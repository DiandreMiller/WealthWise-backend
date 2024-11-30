'use strict';

const User = require('./userModels');

const models = { User, Movie };

if(User.associate) {
    User.associate(models);
}   


module.exports = models;