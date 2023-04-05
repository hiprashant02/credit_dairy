var express = require('express');
const createHttpError = require('http-errors');
const clientMap = require('../clientMap');
const People = require('../models/people');
const Transaction = require('../models/transaction');
const User = require('../models/user');
var router = express.Router();

/* GET home page. */
router.post('/all', async function (req, res, next) {
    try {
        const pageSize = 30;
        const currentPage = req.body.currentPage | 1;
        const offset = (currentPage - 1) * pageSize;
        const peopleId = req.body.peopleId
        if (!peopleId) {
            throw new Error("Missing people id")
        }
        const [transactions, transactionsMetaData] = await Transaction.findAll({
            where: {
                peopleId: peopleId
            }, limit: pageSize, offset: offset
        })
        res.status(200).json({ status: "Ok", transactions: transactions })
    } catch (error) {
        next(createHttpError(500, error.message))
    }
});

router.post('/create', async function (req, res, next) {
    try {
        const peopleId = req.body.peopleId
        console.log("popleId");
        console.log(peopleId);
        if (!peopleId) {
            throw new Error("Missing people id")
        }
        const note = req.body.note
        const amount = parseFloat(req.body.amount)
        if (!amount) {
            throw new Error("Missing amount")
        }
        const attached_files = JSON.stringify(req.body.attached_files)
        const is_given = req.body.is_given
        if (req.body.boolean !== undefined) {
            throw new Error("Missing Relation type in Boolean")
        }
        const people = await People.findByPk(peopleId)
        const now = new Date();
        const currentDate = now.toISOString().slice(0, 19).replace('T', ' ');
        const payment_date = !req.body.payment_date ? currentDate: req.body.payment_date

        const transactions = await Transaction.create({payment_date: payment_date, note: note, amount: amount, attached_files: attached_files, is_given: is_given, peopleId: peopleId, createdBy: req.body.userId })
        if (is_given) {
            const new_given = parseFloat(people.total_given) + amount
            const total_received = parseFloat(people.total_received)
            if (new_given > total_received) {
                const net_due = new_given - total_received
                await People.update({ total_given: new_given, net_due: net_due }, { where: {id:peopleId} })
                const supplier = await User.findByPk(people.userOf)
                const customer_due = parseFloat(supplier.customer_due) + amount
                const net_customer_due = customer_due - parseFloat(supplier.customer_advance)
                await User.update({ customer_due: customer_due, total_given: parseFloat(supplier.total_given) + amount, net_customer_due: net_customer_due }, { where: {id:supplier.id} })
                const customer = await User.findByPk(people.userId)
                const supplier_due = parseFloat(customer.supplier_due) + amount
                const net_supplier_due = supplier_due - parseFloat(customer.supplier_advance)
                await User.update({ supplier_due: supplier_due, total_received: parseFloat(customer.total_received) + amount, net_supplier_due: net_supplier_due }, { where: {id: customer.id} })
            } else {
                const net_due = total_received - new_given
                await People.update({ total_given: new_given, net_due: net_due }, { where: {id : peopleId} })
                const supplier = await User.findByPk(people.userOf)
                const customer_advance = parseFloat(supplier.customer_advance) - amount
                const net_customer_due = parseFloat(supplier.customer_due) - customer_advance
                await User.update({ customer_advance: customer_advance, total_given: parseFloat(supplier.total_given) + amount, net_customer_due: net_customer_due }, { where: {id:supplier.id} })
                const customer = await User.findByPk(people.userId)
                var supplier_advance = parseFloat(customer.supplier_advance) - amount
                var supplier_due = parseFloat(customer.supplier_due)
                if (supplier_advance < 0) {
                    supplier_due = Math.abs(supplier_advance)
                    supplier_advance = 0
                }
                const net_supplier_due = supplier_due - supplier_advance
                await User.update({ supplier_advance: supplier_advance, supplier_due: supplier_due, total_received: parseFloat(customer.total_received) + amount, net_supplier_due: net_supplier_due }, { where: {id:customer.id} })
            }
        } else {
            const total_given = parseFloat(people.total_given)
            const new_received = parseFloat(people.total_received) + amount
            if (total_given > new_received) {
                const net_due = total_given - new_received
                await People.update({ total_received: new_received, net_due: net_due }, { where: {id:peopleId} })
                const supplier = await User.findByPk(people.userOf)
                const customer_due = parseFloat(supplier.customer_due) - amount
                const net_customer_due = customer_due - parseFloat(supplier.customer_advance)
                await User.update({ customer_due: customer_due, total_received: parseFloat(supplier.total_received) + amount, net_customer_due: net_customer_due }, { where: {id:supplier.id} })
                const customer = await User.findByPk(people.userId)
                var supplier_due = parseFloat(customer.supplier_due) - amount
                var supplier_advance = parseFloat(customer.supplier_advance)
                if (supplier_due < 0) {
                    supplier_advance = Math.abs(supplier_advance)
                    supplier_due = 0
                }
                const net_supplier_due = supplier_due - supplier_advance
                await User.update({ supplier_advance: supplier_advance, supplier_due: supplier_due, total_given: parseFloat(customer.total_given) + amount, net_supplier_due: net_supplier_due }, { where: {id: customer.id} })
            } else {
                const net_due = new_received - total_given
                await People.update({ total_received: new_received, net_due: net_due }, { where: {id: peopleId} })
                const supplier = await User.findByPk(people.userOf)
                const customer_advance = parseFloat(supplier.customer_advance) + amount
                const net_customer_due = parseFloat(supplier.customer_due) - customer_advance
                await User.update({ customer_advance: customer_advance, total_received: parseFloat(supplier.total_received) + amount, net_customer_due: net_customer_due }, { where: {id:supplier.id} })
                const customer = await User.findByPk(people.userId)
                const supplier_due = parseFloat(customer.supplier_due) + amount
                const net_supplier_due = supplier_due - parseFloat(customer.supplier_advance)
                await User.update({ supplier_due: supplier_due, total_received: parseFloat(customer.total_received) + amount, net_supplier_due: net_supplier_due }, { where: {id: customer.id} })
            }
        }
        res.status(200).json({ status: "Ok", transactions: transactions })
        
        const customerDevice = clientMap[people.userId];
        const supplierDevice = clientMap[people.userOf];

        if (customerDevice) {
            customerDevice.emit('added', { transactions });
        }
        if (supplierDevice) {
            supplierDevice.emit('added', { transactions });
        }
    } catch (error) {
        next(createHttpError(500, error.message))
        throw error
    }
});
function subtractSmallerFromLarger(a, b) {
    if (a > b) {
        return a - b;
    } else {
        return b - a;
    }
}
module.exports = router;
