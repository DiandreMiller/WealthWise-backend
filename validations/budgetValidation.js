// const Joi = require('joi');

// function userBudget(budgeting) {
//     console.log('Budgeting object being validated:', budgeting);
//     const { user_id } = budgeting; 
//     console.log('Extracted user_id:', user_id);
//     const schema = Joi.object({
//         // user_id: Joi.string().guid({ version: 'uuidv4' }).required(), 
//         user_id: Joi.string().uuid().required(),
//         monthly_income_goal: Joi.number().positive().required(),
//         monthly_expense_goal: Joi.number().positive().required(),
//         actual_income: Joi.number().min(0).required(),
//         actual_expenses: Joi.number().min(0).required(),
//         disposable_income: Joi.number().positive().optional(),
//     });

//     const { error, value } = schema.validate(budgeting);
//     if (error) {
//         console.log('error: budget validation:', error.details[0].message);
//         throw new Error(error.details[0].message);
//     }
//     return value;
// }

// module.exports = userBudget;

// const Joi = require('joi');

// function userBudget(budgeting) {
//     console.log('Budgeting object being validated:', budgeting);
//     const { user_id } = budgeting; 
//     console.log('Extracted user_id:', user_id);

//     const schema = Joi.object({
//         user_id: Joi.string().uuid().required(),
//         monthly_income_goal: Joi.number().positive().required(),
//         monthly_expense_goal: Joi.number().positive().required(),
//         actual_income: Joi.number().min(0).required(),
//         actual_expenses: Joi.number().min(0).required(),
//         disposable_income: Joi.number().positive().optional(),
//     });

//     // ✅ Return both `error` and `value` without throwing an error
//     return schema.validate(budgeting, { abortEarly: false });
// }

// module.exports = userBudget;





function userBudget(budgeting) {
    console.log('🔍 Budgeting object being validated:', budgeting);

    const schema = Joi.object({
        user_id: Joi.string().uuid().required(),
        monthly_income_goal: Joi.number().positive().required(),
        monthly_expense_goal: Joi.number().positive().required(),
        actual_income: Joi.number().min(0).required(),
        actual_expenses: Joi.number().min(0).required(),
        disposable_income: Joi.number().positive().optional(),
    });

    const { error, value } = schema.validate(budgeting, { abortEarly: false });

    console.log('✅ Validation result - Value:', value);
    console.log('🚨 Validation result - Error:', error ? error.details : 'None');

    if (!value.user_id) {
        console.error('🚨 Validation issue: user_id missing after validation');
    }

    return { error, value };
}
