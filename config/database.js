const {Client} = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

client.connect()
    .then(() => console.log('Connected to database'))
    .catch((error) => console.error('Error connecting to database', error.stack));

module.exports = client;