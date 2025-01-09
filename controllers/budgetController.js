const Budget = require('../models/budgetModel');
const User = require('../models/userModels');
// const userbudget = require('../validations/budgetValidation');


const getBudgetByUser = async (request, response) => {
    const { userId } = request.params;
    console.log('userId: budget controller', userId);

    try {
        const budget = await Budget.findOne({
            where: { user_id: userId },
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
    const user_id = request.params.user_id;
    const {
        monthly_income_goal,
        monthly_expense_goal,
        actual_income,
        actual_expenses,
    } = request.body;

    // Validate inputs
    if (
        !user_id ||
        isNaN(parseFloat(monthly_income_goal)) ||
        isNaN(parseFloat(monthly_expense_goal)) ||
        (actual_income !== undefined && actual_income !== null && isNaN(parseFloat(actual_income))) ||
        (actual_expenses !== undefined && actual_expenses !== null && isNaN(parseFloat(actual_expenses)))
    ) {
        return response
            .status(400)
            .json({ message: 'Invalid input data. Please provide valid numbers or leave fields empty for null values.' });
    }

    console.log('Data being inserted into budget:', {
        user_id,
        monthly_income_goal: parseFloat(monthly_income_goal),
        monthly_expense_goal: parseFloat(monthly_expense_goal),
        actual_income: actual_income ? parseFloat(actual_income) : null,
        actual_expenses: actual_expenses ? parseFloat(actual_expenses) : null,
    });

    try {
        const newBudget = await Budget.create({
            user_id,
            monthly_income_goal: parseFloat(monthly_income_goal),
            monthly_expense_goal: parseFloat(monthly_expense_goal),
            actual_income: actual_income ? parseFloat(actual_income) : null,
            actual_expenses: actual_expenses ? parseFloat(actual_expenses) : null,
        });
        console.log('Successfully inserted budget:', newBudget.toJSON());

        response.status(201).json(newBudget);
    } catch (error) {
        response.status(500).json({ message: 'Failed to create budget', error: error.message });
    }
};



const updateBudget = async (request, response) => {
    const { userId, budgetId } = request.params;
    console.log('userID updated Budget:', userId);
    console.log('budgetId updated Budget:', budgetId);
    const { monthly_income_goal, monthly_expense_goal, actual_income, actual_expenses } = request.body;

    try {

        const budget = await Budget.findOne({
            where: {
                budget_id: budgetId,
                user_id: userId,
            },
        });

        if (!budget) {
            return response.status(404).json({ message: 'Budget not found' });
        }

        budget.monthly_income_goal = monthly_income_goal ?? budget.monthly_income_goal;
        budget.monthly_expense_goal = monthly_expense_goal ?? budget.monthly_expense_goal;
        budget.actual_income = actual_income ?? budget.actual_income;
        budget.actual_expenses = actual_expenses ?? budget.actual_expenses;

        await budget.save(); 
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
