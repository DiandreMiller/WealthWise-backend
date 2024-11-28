const { Sequelize, Op } = require('sequelize');

let sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432
});

if(process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        port: process.env.DB_PORT || 5432,
        host: process.env.DB_HOST || 'localhost',
    });
}


module.exports = { sequelize, Op };













// const {Client} = require('pg');
// require('dotenv').config();

// const client = new Client({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASS,
//     port: process.env.DB_PORT,
// });

// client.connect()
//     .then(() => console.log('Connected to database'))
//     .catch((error) => console.error('Error connecting to database', error.stack));

// module.exports = client;