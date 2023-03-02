const express = require('express')
const User = require('../models/user')
const jwt = require('jsonwebtoken');
const createHttpError = require('http-errors');
const sendOtp = require('../utils/send_otp')
const matchAddress = require('../utils/address_match');
const City = require('../models/all _cities');
const State = require('../models/all_states');
var router = express.Router();
var _connection;



router.post('/authenticate', async function (req, res, next) {
  try {
    if (!req.body.phone) throw new Error("Missing phone")
    if (req.body.phone.toString().length != 10) throw new Error("Invalid phone")
    // const [users, userFields] = await _connection.execute("SELECT `id`, `login_attempt` FROM `users` WHERE mobile = ?", [req.body.phone])
    const user = await User.findOne({
      attributes: ['id', 'otp_attempt'],
      where: {
        mobile: req.body.phone
      }
    });
    if (user !== null) {
      if (user.otp_attempt == 0) {
        if (!req.body.name) throw new Error("Name is missing")
        if (req.body.name.length == 0) throw new Error("Invalid Name")

        const address = await matchAddress(req.body.city, req.body.state)

        const otp = await sendOtp(req.body.phone)
        const expiryTime = new Date(Date.now() + 8 * 60 * 1000); 
        const updatedUser = await User.update({ name: req.body.name, otp_attempt: 1, otp: otp,expiry_time:expiryTime, business_name: req.body.business_name, street_name: req.body.street_name, nearest_landmark: req.body.nearest_landmark, cityId: address.city, stateId: address.state }, { where: user.id })
        res.status(200).json({ msg: "OTP sent successfully", userId: updatedUser.id });
      }
      const otp = await sendOtp(req.body.phone)
      const expiryTime = new Date(Date.now() + 8 * 60 * 1000); 
      await User.update({ otp: otp, otp_attempt: parseInt(user.otp_attempt) + 1,expiry_time:expiryTime }, {
        where: {
          id: user.id
        }
      });
      res.status(200).json({ msg: "OTP sent successfully", userId: user.id });
      return;
    }

    if (!req.body.name) throw new Error("Name is missing")
    if (req.body.name.length == 0) throw new Error("Invalid Name")

    const address =  req.body.city && req.city.body ? matchAddress(req.body.city,req.body.state):{}

    const otp = await sendOtp(req.body.phone)
    const expiryTime = new Date(Date.now() + 8 * 60 * 1000); 
    const createdUser = await User.create({ name: req.body.name, mobile: req.body.phone, otp_attempt: 1, otp: otp,expiry_time:expiryTime, business_name: req.body.business_name, street_name: req.body.street_name, nearest_landmark: req.body.nearest_landmark, cityId: address.city, stateId: address.state })
    res.status(200).json({ msg: "OTP sent successfully", userId: createdUser.id });
  } catch (error) {
    next(createHttpError(500, error.toString()))
  }
});

router.post('/changephone', async function (req, res, next) {
  try {
    if (!req.body.stepNumber) throw new Error("Missing Step Number. It's internal client app problem")

    if (req.body.stepNumber == 1) {
      const user = User.findByPk(req.body.userId, { attributes: ['mobile', 'otp_attempt'] })
      const otp = await sendOtp(user.mobile)
      const expiryTime = new Date(Date.now() + 8 * 60 * 1000); 
      await User.update({ otp: otp, otp_attempt: parseInt(user.otp_attempt) + 1, expiry_time:expiryTime }, {
        where: {
          id: req.body.userId
        }
      });
      res.status(200).json({ status: "OK", msg: "Otp on old phone sent successfully" })
    }
    if (req.body.stepNumber == 2) {
      if (!req.body.otp) throw new Error("Missing OTP")
      if (req.body.otp.toString().length != 4 && req.body.otp != 0) throw new Error("Invalid OTP")

      const user = User.findByPk(req.body.userId, { attributes: ['otp'] })
      if (user.expiry_time < new Date()) {
        throw new Error("OTP Expired")
      }
      if (user.otp == req.body.otp) {
        await User.update({ otp: 0, canChangePhone: true }, {
          where: {
            id: req.body.userId
          }
        });
        res.status(200).json("Old number verified successfully")
      }
    }
    if (req.body.stepNumber == 3) {
      if (!req.body.phone) throw new Error("Missing phone")
      if (req.body.phone.toString().length != 10) throw new Error("Invalid phone")

      const user = User.findByPk(req.body.userId,{ attributes: ['canChangePhone', 'otp_attempt']})
      if (user.canChangePhone == false) {
        throw new Error("User have to verify the otp sent on old number first")
      }
      const otp = await sendOtp(req.body.phone)
      const expiryTime = new Date(Date.now() + 8 * 60 * 1000); 
      await User.update({ otp: otp,expiry_time:expiryTime, otp_attempt: parseInt(user.otp_attempt) + 1 }, {
        where: {
          id: req.body.userId
        }
      });
      res.status(200).json({ status: "OK", msg: "Otp on new phone sent successfully" })
    }
    if (req.body.stepNumber == 4) {
      if (!req.body.otp) throw new Error("Missing OTP")
      if (req.body.otp.toString().length != 4 && req.body.otp != 0) throw new Error("Invalid OTP")

      if (!req.body.phone) throw new Error("Missing phone")
      if (req.body.phone.toString().length != 10) throw new Error("Invalid phone")

      const user = User.findByPk(req.body.userId,{attributes: ['otp', 'canChangePhone']})
      if (user.canChangePhone == false) {
        throw new Error("User have to verify the otp sent on old number first")
      }
      if (user.expiry_time < new Date()) {
        throw new Error("OTP expired")
      }
      if (user.otp == req.body.otp) {
        await User.update({ otp: 0, canChangePhone: false, mobile: req.body.phone }, {
          where: {
            id: req.body.userId
          }
        });
        res.status(200).json({"msg":"New number verified successfully",newPhone:req.body.phone})
      }
    }
  } catch (error) {
    next(createHttpError(500, error.message))
  }
})

router.post('/change_details', async function(req,res, next){
  try {
    if (req.body.column=="mobile"|| req.body.column=="id") {
      throw new Error("You can't change mobile number or Id from this route")
    }
    if (!req.body.column&& !req.body.columnValue) {
      throw new Error("Missing Data")
    }
    if (req.body.column == "cityId") {
      const user = User.findByPk(req.body.userId, { attributes: ['stateId'] })
      const city = await City.findOne({
        where: {
          city: req.body.columnValue
        }
      })
      if (city === null) {
        throw new Error("Invalid City")
      }
      if (city.stateId !== user.state) {
        throw new Error("City and State Mismatch")
      }
      req.body.columnValue = city.id
    }
    if (req.body.column=="stateId") {
      const user = User.findByPk(req.body.userId, { attributes: ['cityId'] })
      const state = await State.findOne({
        where: {
          state: req.body.columnValue
        }
      })
      const city = await City.findByPk(user.cityId)
      if (state === null) {
        throw new Error("Invalid State")
      }
      if (state.id !== city.stateId) {
        if(!req.body.city){
          throw new Error("You need to select a new city co prevoisly selected city doesn't come under new selected state")
        }
        const city = await City.findOne({
          where: {
            city: req.body.city
          }
        })
        if (city===null) {
          throw new Error("Invalid city")
        }
        if (city.stateId!=state.id) {
          throw new Error("City State Mismatch")
        }
        await User.update({cityId:city.id},{where:{id:req.body.userId}})
      }
      req.body.columnValue = state.id
    }
    const columnName = req.body.column
    await User.update({columnName:req.body.columnValue},{where:{id:req.body.userId}})
    res.status(200).json({msg: "Details updated Successfully"})
  } catch (error) {
    next(createHttpError(500,error.message))
  }
})

router.post('/verify-otp', async function (req, res, next) {
  try {
    if (!req.body.userId) throw new Error("Missing userId")

    if (!req.body.otp) throw new Error("Missing OTP")
    if (req.body.otp.toString().length != 4) throw new Error("Invalid OTP")

    const user = await User.findByPk(req.body.userId, { attributes: ['otp', 'login_attempt'], });
    if (user === null) {
      throw new Error("Register your number first")
    }
    if (user.expiry_time < new Date()) {
      throw new Error("OTP expired")
    }
    if (user.otp != req.body.otp) {
      throw new Error("Wrong Otp")
    }
    await User.update({ login_attempt: parseInt(user.login_attempt) + 1, otp: 0 }, {
      where: {
        id: req.body.userId
      }
    });
    const token = jwt.sign({ userId: req.body.userId }, 'aitfgil');
    res.status(200).json({ status: "Success", token: token })
  } catch (error) {
    next(createHttpError(500, error.message))
  }
})


module.exports = router