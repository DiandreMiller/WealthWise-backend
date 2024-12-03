const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('postgres', process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
});

const createDatabase = async () => {
    try {
        await sequelize.query(`CREATE DATABASE "${process.env.DB_NAME}";`);
        console.log(`Database ${process.env.DB_NAME} created successfully.`);
    } catch (error) {
        console.error('Error creating the database:', error);
    } finally {
        await sequelize.close();
    }
};

createDatabase();
