const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./userModels')

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
        field: 'user_id'
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

Budget.belongsTo(User, { as: 'user', foreignKey: 'user_id'});
User.hasMany(Budget, { foreignKey: 'user_id' });

module.exports = Budget;
