const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./userModels');

class Income extends Model {}

Income.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users', 
            key: 'id',
        },
        onDelete: 'CASCADE', 
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0.01,
        },
    },
    source: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isValidCategory(value) {
                if (value && !['salary', 'rental', 'investments', 'business', 'pension', 'social security', 'royalties', 'government assistance', 'gifts', 'bonus', 'inheritance', 'lottery/gambling', 'gigs', 'asset sales', 'tax refunds', 'severance pay', 'grants/scholarships', 'other'].includes(value)) {
                    throw new Error('Invalid category value');
                }
            },
        },
    },
    
    
    date_received: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
        },
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    is_recurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize,              
    modelName: 'Income',     
    tableName: 'income',     
    timestamps: false,       
});

Income.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Income;
