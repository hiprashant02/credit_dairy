var express = require('express');
const createHttpError = require('http-errors');
const Business = require('../models/business');
var router = express.Router();

/* GET home page. */
router.post('/create', function (req, res, next) {
    try {
        if (!req.body.name) {
            throw new Error("Missing Name")
        }
        const createdBusiness = Business.create({ name: req.body.name, userId: req.body.userId })
        res.status(200).json({ status: "OK", createdBusinessId: createdBusiness.id })
    } catch (error) {
        next(createHttpError(500, error.message))
    }
});

router.get('/all', function (req, res, next) {
    try {
        const businesses = Business.findAll({
            where: {
                userId: req.body.userId
            }
        })
        res.status(200).json({ status: "OK", businesses: businesses.id })
    } catch (error) {
        next(createHttpError(500, error.message))
    }
});

module.exports = router;
