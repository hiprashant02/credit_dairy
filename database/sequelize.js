
const Sequelize = require('sequelize')
const sequelize = new Sequelize(
   'credit_dairy', 
   'root', 
   '', {
      dialect: 'mysql',
      host: 'localhost'
   }
);
module.exports = sequelize
