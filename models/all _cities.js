const Sequelize = require('sequelize')
const sequelize = require('../database/sequelize');
const State = require('./all_states');
const City = sequelize.define('cities', {
    id: {
        type: Sequelize.SMALLINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    city: {
        type: Sequelize.STRING(30),
        allowNull: false,
        index: true
    },
    stateId: {
        type: Sequelize.SMALLINT,
        allowNull: false,
    },
}, {
    timestamps: false,

    // If don't want createdAt
    createdAt: false,

    // If don't want updatedAt
    updatedAt: false,

})

City.belongsTo(State, { foreignKey: 'stateId' });

module.exports = City