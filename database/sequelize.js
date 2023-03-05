
const Sequelize = require('sequelize')
const sequelize = new Sequelize(
   'credithow', 
   'prash', 
   'bc33445566@BBC', {
      dialect: 'mysql',
      host: 'localhost'
   }
);
module.exports = sequelize
