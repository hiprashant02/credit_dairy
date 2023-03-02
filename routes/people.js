var express = require('express');
const createHttpError = require('http-errors');
const { QueryTypes } = require('sequelize');
const sequelize = require('../database/sequelize');
const People = require('../models/people');
const User = require('../models/user');
const matchAddress = require('../utils/address_match');
var router = express.Router();



router.post('/create', async function (req, res, next) {
    try {
        if (!req.body.phone) throw new Error("Missing phone")
        if (req.body.phone.toString().length != 10) throw new Error("Invalid phone")

        if (!req.body.createCustomer) throw new Error("Missing Create Customer Value")

        const replacements = [req.body.userId, req.body.userId, req.body.userId, req.body.phone, req.body.userId, req.body.people]
        const people = await sequelize.query(
            `SELECT p.id, CASE
                   WHEN p.userOf = :userId THEN 'Customer'
                   WHEN p.userId = :userId THEN 'Supplier'
                 END AS \`type\`
            FROM people p
            LEFT JOIN users supplier ON p.userOf = supplier.id 
            LEFT JOIN users customer ON p.userId = customer.id
            WHERE (p.userOf = :userId AND customer.mobile = :mobile)
               OR (p.userId = :userId AND supplier.mobile=  :mobile);`,
            {
                replacements: {
                    userId:req.body.userId,
                    mobile: req.body.phone
                },
                type: QueryTypes.SELECT
            }
        );
        console.log("logggg");
        console.log(people);
        if (people.length!==0) {
            res.status(200).json({ status: "Already Exists", id: people[0].id, type: people[0].type })
            return
        }
        var user = await User.findOne({ where: { mobile: req.body.phone } })
        if (user === null) {
            if (!req.body.name) throw new Error("Missing Name")
            user = await User.create({ mobile: req.body.phone, name: req.body.name })
        }
        const address =  req.body.city && req.city.body ? matchAddress(req.body.city,req.body.state):{}
        const CreatedCustomer = await People.create({ name: req.body.name, street_name: req.body.street_name, nearest_landmark: req.body.nearest_landmark, city: address.city, state: address.state, userOf: req.body.createCustomer ? req.body.userId : user.id, userId: req.body.createCustomer ? user.id : req.body.userId, createdBy: req.body.userId })
        res.status(200).json({ "status": "Success", customers: CreatedCustomer })
        const device1 = clientMap[user.id];
        const device2 = clientMap[req.body.userId];

        if (device1) {
            device1.emit('added', { CreatedCustomer });
        }
        if (device2) {
            device2.emit('added', { CreatedCustomer });
        }
    } catch (error) {
        next(createHttpError(500, error.message))
        throw error
    }
});

router.post('/customers', async function (req, res, next) {
    try {
        const pageSize = 30;
        const currentPage = req.body.currentPage | 1;
        const offset = (currentPage - 1) * pageSize;
        const [customers, customersMetaData] = await People.query(
            `SELECT IF(p.createdBy = ? AND p.name <> '', p.name, ) AS \`name\`, 
         customer.mobile, p.id, p.total_given, p.total_received, p.net_due
         FROM people p
         LEFT JOIN users customer ON p.userId = customer.id
         WHERE p.userOf = ? ORDER BY updatedAt DESC LIMIT ${pageSize} OFFSET ${offset}`,
            { type: db.Sequelize.QueryTypes.SELECT, replacements: [req.body.userId, req.body.userId] })
        res.status(200).json({ "status": "OK", customers: customers })
    } catch (error) {
        next(createHttpError(500, error.message))
    }
});
router.post('/suppliers', async function (req, res, next) {
    try {
        const pageSize = 30;
        const currentPage = parseInt(req.body.currentPage) | 1;
        const offset = (currentPage - 1) * pageSize;
        const [suppliers, suppliersMetdaData] = await People.query(
            `SELECT IF(p.createdBy = ? AND p.name <> '', p.name, supplier.name) AS \`Name\`
         supplier.mobile,
         p.id
         FROM people p
         LEFT JOIN users supplier ON p.userOf = customer.id
         WHERE p.userId = ? ORDER BY updatedAt DESC LIMIT ${pageSize} OFFSET ${offset}`,
            { type: db.Sequelize.QueryTypes.SELECT, replacements: [req.body.userId, req.body.userId] })
        res.status(200).json({ "status": "OK", suppliers: suppliers })
    } catch (error) {
        next(createHttpError(500, error.message))
    }
});

router.post('/all', async function (req, res, next) {
    try {
        const people = await People.query(`
         SELECT 
           CASE
             WHEN p.userOf = ${req.body.userId} THEN 'Customer'
             WHEN p.userId = ${req.body.userId} THEN 'Supplier'
           END AS \`Type\`,
           CASE
             WHEN p.createdBy = ${req.body.userId} AND p.name <> '' THEN p.name
             WHEN p.userOf = ${req.body.userId} THEN customer.name
             WHEN p.userId = ${req.body.userId} THEN supplier.name
           END AS \`Name\`
         FROM people p
         LEFT JOIN users supplier ON p.userOf = supplier.id 
         LEFT JOIN users customer ON p.userId = customer.id
         WHERE p.userOf = ${req.body.userId} OR p.userId = ${req.body.userId}
         ORDER BY updatedAt DESC`, {
            type: db.Sequelize.QueryTypes.SELECT
        })
        res.status(200).json({ "status": "OK", people: people })
    } catch (error) {
        next(createHttpError(500, error.message))
    }
});

module.exports = router;
