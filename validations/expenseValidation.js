const Joi = require('joi');

function logExpenses(expenseData) {
    const schema = Joi.object({
        //Consider if it needs to be required
        expense: Joi.number().positive().required()
    });

    const { error, value } = schema.validate(expenseData);
    if (error) {
        throw new Error(error.details[0].message);
    }
    return value; 
}

module.exports = logExpenses;
