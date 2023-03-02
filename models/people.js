const Sequelize = require('sequelize')
const sequelize = require('../database/sequelize');
const City = require('./all _cities');
const State = require('./all_states');
const User = require('./user');
const People = sequelize.define('people', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },

    name: { type: Sequelize.STRING(80), allowNull: false, index:true },

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
    userOf: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER  ,
        allowNull:false
    },
    net_due: {
        type: Sequelize.DOUBLE,
        allowNull:true,
    },
    dueDate: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    total_given: {
        type: Sequelize.DOUBLE,
        allowNull:true
    },
    total_received: {
        type: Sequelize.DOUBLE,
        allowNull:true
    },
    createdBy:{
        type: Sequelize.INTEGER,
        allowNull: true
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
})

People.belongsTo(User, { foreignKey: 'userOf' });
People.belongsTo(User, { foreignKey: 'userId' });
People.belongsTo(User, { foreignKey: 'createdBy' });
People.belongsTo(City,{foreignKey: "cityId"})
People.belongsTo(State,{foreignKey: "stateId"})

module.exports = People