const Sequelize = require('sequelize')
const sequelize = require('../database/sequelize');
const Peope = require('./people');
const User = require('./user');
const Transaction = sequelize.define('transaction', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    payment_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        index:true
    },
    note: { type: Sequelize.STRING(180), allowNull: true },
    amount: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    attached_files:{
        type: Sequelize.JSON,
        allowNull: true,
    },
    is_given: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    peopleId: {
        type: Sequelize.INTEGER,
        allowNull:false
    },
    createdBy: {
        type: Sequelize.INTEGER,
        allowNull:false
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
})

Transaction.belongsTo(Peope, { foreignKey: 'peopleId' });
Transaction.belongsTo(User, { foreignKey: 'createdBy' });


module.exports = Transaction