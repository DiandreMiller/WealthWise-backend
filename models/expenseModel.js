const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./userModels');


class Expense extends Model {};

Expense.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User, 
            key: 'id',
          },
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category_type: {
        type: DataTypes.ENUM,
        values: [
            'housing',
            'utilites',
            'transportation',
            'groceries',
            'subscriptions',
            'debt',
            'childcare',
            'insurance',
            'savings contributions',
            'pet expenses',
            'medical bills',
            'major purchase',
            'travel',
            'repairs',
            'gifts',
            'donations',
            'events',
            'education',
            'loans',
            'legal fees',
            'unplanned expense',
            'entertainment',
            'other'
        ],
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    date_incurred: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    is_recurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize,
    modelName: 'Expense',
    tableName: 'expense',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, 
});

Expense.belongsTo(User, { foreignKey: 'user_id' });


// Expense.belongsTo(User, {
//     foreignKey: 'user_id',
//     as: 'user', 
//   });


module.exports = Expense;
