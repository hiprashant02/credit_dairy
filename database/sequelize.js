
const Sequelize = require('sequelize')
const sequelize = new Sequelize(
   'credit_dairy',
   'root',
   '', {
   dialect: 'mysql',
   host: 'localhost'
}
);
sequelize.authenticate()
   .then(() => {
      console.log('\n\n\nConnection has been established successfully.\n\n\n');
   })
   .catch(err => {
      console.error('\n\n\nUnable to connect to the database:', err);
      console.error('\n\n\n')
   });

module.exports = sequelize
