const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('songs', 'root', 'root', {
  host: 'localhost',
    dialect: 'postgres'
});

module.exports = sequelize;