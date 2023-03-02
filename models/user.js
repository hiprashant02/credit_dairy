const Sequelize = require('sequelize')
const sequelize = require('../database/sequelize')
const City = require('./all _cities')
const State = require('./all_states')
const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },

    name: { type: Sequelize.STRING(80), allowNull: true, index: true },
    business_name: { type: Sequelize.STRING(80), allowNull: true, index: true },

    mobile: {
        type: Sequelize.STRING(10), allowNull: false, unique: true
    },
    street_name: {
        type: Sequelize.STRING(120), allowNull: true
    },
    nearest_landmark: {
        type: Sequelize.STRING(120), allowNull: true
    },
    cityId: {
        type: Sequelize.SMALLINT, allowNull: true
    },
    stateId: {
        type: Sequelize.SMALLINT, allowNull: true
    },
    supplier_due: {
        type: Sequelize.DOUBLE,
        allowNull: true,
    },
    customer_due: {
        type: Sequelize.DOUBLE,
        allowNull: true
    },
    supplier_advance: {
        type: Sequelize.DOUBLE,
        allowNull: true,
    },
    customer_advance: {
        type: Sequelize.DOUBLE,
        allowNull: true
    },
    net_supplier_due: {
        type: Sequelize.DOUBLE,
        allowNull: true,
    },
    net_customer_due: {
        type: Sequelize.DOUBLE,
        allowNull: true
    },
    total_given: {
        type: Sequelize.DOUBLE,
        allowNull: true
    },
    total_received: {
        type: Sequelize.DOUBLE,
        allowNull: true
    },
    otp_attempt: {
        type: Sequelize.MEDIUMINT,
        allowNull: false,
        defaultValue: 0
    },
    login_attempt: {
        type: Sequelize.MEDIUMINT,
        allowNull: false,
        defaultValue: 0
    },
    otp: {
        type: Sequelize.SMALLINT,
        allowNull: true
    },
    expiry_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
    canChangePhone:{
        type: Sequelize.BOOLEAN,
        allowNull: true
    },
    banned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
})
User.belongsTo(City,{foreignKey: "cityId"})
User.belongsTo(State,{foreignKey: "stateId"})

module.exports = User