//Dependencies
const express = require('express');
const cors = require('cors');

//Database
const sequelize = require('./config/database');

//Configuration
const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.get('/', (request, response) => {
    response.send('Welcome to my iCapital Financial Planner App');
});


module.exports = app;