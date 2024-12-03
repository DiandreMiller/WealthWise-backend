const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Expense extends Model {}

Expense.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date_incurred: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Expense',
    tableName: 'expense',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, 
});

module.exports = Expense;
