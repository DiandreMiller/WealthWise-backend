const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Budget extends Model {}

Budget.init({
    budget_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    monthly_income_goal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    monthly_expense_goal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    actual_income: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    actual_expenses: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    disposable_income: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, 
    },
}, {
    sequelize,
    modelName: 'Budget',
    tableName: 'budget',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, 
});

module.exports = Budget;
