const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./userModels');

class Budget extends Model {}

Budget.init({
    budget_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
    },
    monthly_income_goal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true, 
            min: 0,          
        },
    },
    monthly_expense_goal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    actual_income: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0, 
        validate: {
            isDecimal: true,
            min: 0, 
        },
    },
    actual_expenses: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0, 
        validate: {
            isDecimal: true,
            min: 0, 
        },
    },
    disposable_income: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
}, {
    sequelize,
    modelName: 'Budget',
    tableName: 'budget',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

Budget.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
User.hasMany(Budget, { foreignKey: 'user_id' });

module.exports = Budget;

