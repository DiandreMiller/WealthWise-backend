const Joi = require('joi');

function userBudget(budgeting) {
    console.log('Budgeting object being validated:', budgeting);
    const { user_id } = budgeting; 
    console.log('Extracted user_id:', user_id);
    const schema = Joi.object({
        // user_id: Joi.string().guid({ version: 'uuidv4' }).required(), 
        user_id: Joi.string().uuid().required(),
        monthly_income_goal: Joi.number().positive().required(),
        monthly_expense_goal: Joi.number().positive().required(),
        actual_income: Joi.number().min(0).required(),
        actual_expenses: Joi.number().min(0).required(),
        disposable_income: Joi.number().positive().optional(),
    });

    const { error, value } = schema.validate(budgeting);
    if (error) {
        console.log('error: budget validation:', error.details[0].message);
        throw new Error(error.details[0].message);
    }
    return value;
}

module.exports = userBudget;
