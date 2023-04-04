
const Sequelize = require('sequelize')
const sequelize = new Sequelize('credit_dairy', 'root', '', {
  host: '127.0.0.1',
  dialect: 'mysql',
  dialectOptions: {
    socketPath: '/var/run/mysqld/mysqld.sock'
  }
});



sequelize.authenticate()
  .then(() => {
    console.log('\n\n\nConnection has been established successfully.\n\n\n');
  })
  .catch(err => {
    throw err;
  });

module.exports = sequelize
