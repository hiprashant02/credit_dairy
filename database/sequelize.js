
const Sequelize = require('sequelize')
const sequelize = new Sequelize(
   'credit_dairy',
   'root',
   '', {
   dialect: 'mysql',
   host: 'localhost',
   port: 3306,
}
);
sequelize.authenticate()
   .then(() => {
      console.log('\n\n\nConnection has been established successfully.\n\n\n');
   })
   .catch(err => {
      throw err.err;
   });

module.exports = sequelize
