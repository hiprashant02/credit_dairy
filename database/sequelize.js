
const Sequelize = require('sequelize')
const sequelize = new Sequelize('credit_dairy', 'root', '', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql'
});

sequelize.authenticate()
   .then(() => {
      console.log('\n\n\nConnection has been established successfully.\n\n\n');
   })
   .catch(err => {
      throw err;
   });

module.exports = sequelize
