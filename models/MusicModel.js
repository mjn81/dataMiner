const Sequelize = require('sequelize');

const sequelize = require('../config/db');

module.exports = sequelize.define('music', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: Sequelize.STRING,
    artists: Sequelize.ARRAY(Sequelize.STRING),
    genres: Sequelize.ARRAY(Sequelize.STRING),
    year: Sequelize.INTEGER,
    source: Sequelize.STRING,
});
