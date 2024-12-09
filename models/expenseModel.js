const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./userModels');


class Expense extends Model {}

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

Expense.belongsTo(User, { foreignKey: 'user_id' });


// Expense.belongsTo(User, {
//     foreignKey: 'user_id',
//     as: 'user', 
//   });


module.exports = Expense;
