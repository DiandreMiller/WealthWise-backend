const Budget = require('../models/budgetModel');
const User = require('../models/userModels');
// const userbudget = require('../validations/budgetValidation');
const security = require('../utils/encryption');


const getBudgetByUser = async (request, response) => {
    const { userId } = request.params;
    console.log('userId: budget controller', userId);
    // const { encryptedUserId }  = request.params;
    const decryptedUserId = security.decrypt(userId);  
    console.log('encryptedUserId getBudgetByUser:', userId);
    console.log('decryptedUserId getBudgetByUser:', decryptedUserId);
   
    try {
        const { userId } = request.params;
        const decryptedUserId = security.decrypt(userId);  

        if (!decryptedUserId) {
            return response.status(400).json({ message: 'Invalid user ID after decryption' });
        }
        const budget = await Budget.findOne({
            where: { user_id: decryptedUserId },
            include: { model: User, as: 'user', attributes: ['username', 'email'] },
        });

        if (!budget) {
            return response.status(404).json({ message: 'Budget not found for this user' });
        }

        response.status(200).json(budget);
    } catch (error) {
        console.error('Error fetching budget:', error);
        response.status(500).json({ message: 'Failed to fetch budget' });
    }
};


const createBudget = async (request, response) => {
    try {
        const { monthly_income_goal, monthly_expense_goal, actual_income, actual_expenses, user_id } = request.body;

        // Check if user_id exists
        if (!user_id) {
            throw new Error('User ID is required but is missing.');
        }

        // Convert string values to numbers
        const numericBudget = {
            user_id,
            monthly_income_goal: parseFloat(monthly_income_goal), 
            monthly_expense_goal: parseFloat(monthly_expense_goal),
            actual_income: parseFloat(actual_income),
            actual_expenses: parseFloat(actual_expenses)
        };

        // Save the budget
        const newBudget = await Budget.create(numericBudget);

        return response.status(201).json(newBudget);
    } catch (error) {
        console.error('Budget creation error:', error.message);
        return response.status(400).json({ message: error.message });
    }
};


const updateBudget = async (request, response) => {
    const { userId, budgetId } = request.params;
    console.log('userID updated Budget:', userId);
    console.log('budgetId updated Budget:', budgetId);
    const { monthly_income_goal, monthly_expense_goal, actual_income, actual_expenses } = request.body;

    try {
        const decryptedUserId = security.decrypt(userId);  
        const budget = await Budget.findOne({
            where: {
                budget_id: budgetId,
                user_id: decryptedUserId,
            },
        });

        if (!budget) {
            return response.status(404).json({ message: 'Budget not found' });
        }

        // const updatedActualIncome = actual_income ?? budget.actual_income;
        // const updatedActualExpenses = actual_expenses ?? budget.actual_expenses;

        budget.monthly_income_goal = monthly_income_goal ?? budget.monthly_income_goal;
        budget.monthly_expense_goal = monthly_expense_goal ?? budget.monthly_expense_goal;
        budget.actual_income = actual_income ?? budget.actual_income;
        budget.actual_expenses = actual_expenses ?? budget.actual_expenses;
        // budget.disposable_income = updatedActualIncome - updatedActualExpenses;

        await budget.save(); 
        console.log("Updated budget:", budget.toJSON());
        response.status(200).json(budget);
    } catch (error) {
        console.error('Error updating budget:', error);
        response.status(500).json({ message: 'Failed to update budget' });
    }
};



const deleteBudget = async (request, response) => {
    const { budgetId } = request.params;

    try {
        const budget = await Budget.findByPk(budgetId);

        if (!budget) {
            return response.status(404).json({ message: 'Budget not found' });
        }

        await budget.destroy(); 
        response.status(200).json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Error deleting budget:', error);
        response.status(500).json({ message: 'Failed to delete budget' });
    }
};


module.exports = { getBudgetByUser, createBudget, updateBudget, deleteBudget };
