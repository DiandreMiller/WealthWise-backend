'use strict';

const { Sequelize, Op } = require('sequelize');

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
          dialect: 'postgres',
          protocol: 'postgres',
          logging: false,
          dialectOptions: {
              ssl: process.env.NODE_ENV === 'production' ? {
                  require: true,
                  rejectUnauthorized: false, 
              } : false,
          },
      })
    : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
          host: process.env.DB_HOST || 'localhost',
          dialect: 'postgres',
          port: process.env.DB_PORT || 5432,
          logging: false, 
      });

module.exports = { sequelize, Op };
