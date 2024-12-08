const Joi = require('joi');

function userBudget(budgeting) {
    const schema = Joi.object({
        //Consider if it needs to be required
        budget: Joi.number().positive().required()
    });

    const { error, value } = schema.validate(budgeting);
    if (error) {
        throw new Error(error.details[0].message);
    }
    return value; 
}

module.exports = userBudget;
