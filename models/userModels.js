const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../config/database');
// const Expense = require('./expenseModel');
// console.log('user expense:', Expense);

class User extends Model {}

// Define the User model
User.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: uuidv4, 
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [60, 500],
        },
        field: 'password_hash'
    }, 
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true, 
        unique: true,
        validate: {
            is: /^\+?[1-9]\d{1,14}$/ 
        },
        // field: 'phone_number'
    },
    failedLoginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastFailedLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    accountLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true, 
        }
    },
    webauthnid: {
        type: DataTypes.STRING, 
        allowNull: true,
    },
    webauthnpublickey: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    authCounter: {
        type: DataTypes.INTEGER,
        defaultValue: 0, 
    },
    challenge: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hasregisteredpasskey: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'reset_token',
    },
    resetTokenExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reset_token_expires',
    }
}, {
    sequelize,              
    modelName: 'User',      
    tableName: 'users',     
    timestamps: true,   
    // underscored: true,      
    createdAt: 'created_at', 
    updatedAt: 'updated_at'   
});

// User.hasMany(Expense, { foreignKey: 'user_id' });


module.exports = User;
