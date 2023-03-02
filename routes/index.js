var express = require('express');
const People = require('../models/people');
const Transaction = require('../models/transaction');
var router = express.Router();

/* GET home page. */
router.get('/purchase_from_supplier', function (req, res, next) {
  const transaction = Transaction.create({ amount: req.body.amount, supplierId: req.body.supplierId })
  const supplier = People.findByPk(req.body.supplierId)
  res.status(200).json({ status: "OK" })
});

module.exports = router;
