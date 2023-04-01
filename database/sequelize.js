
const Sequelize = require('sequelize')
const sequelize = new Sequelize('credit_dairy', 'root', '', {
  host: 'localhost',
  port: 3306, // This is the default port number for MySQL
  dialect: 'mysql'
});

module.exports = sequelize
