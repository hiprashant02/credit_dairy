const Sequelize = require('sequelize')
const sequelize = require('../database/sequelize');
const State = sequelize.define('states', {
    id: {
        type: Sequelize.SMALLINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    state: {
        type: Sequelize.STRING(30),
        allowNull: false,
        index: true
    }
},
    {
        timestamps: false,

        // If don't want createdAt
        createdAt: false,

        // If don't want updatedAt
        updatedAt: false,

    })

module.exports = State