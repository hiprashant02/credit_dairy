
const Sequelize = require('sequelize')
const sequelize = new Sequelize(
   'credithow', 
   'root', 
   '', {
      dialect: 'mysql',
      host: 'localhost'
   }
);
module.exports = sequelize