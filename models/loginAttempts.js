'use strict';

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const {v4: uuidv4} = require('uuid');

class LoginAttempt extends Model {}

LoginAttempt.init({
    id:{
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4()
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },

    success: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    timeStamp: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.NOW,
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }

}, {

    sequelize,
    modelName: 'LoginAttempt',
    tableName: 'login_attempts',
    timestamps: false

});

module.exports = LoginAttempt;