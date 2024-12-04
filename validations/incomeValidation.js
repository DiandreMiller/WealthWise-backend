const Joi = require('joi');

function logIncome(income) {

    const schema = Joi.object({
        //Consider if it needs to be required
        income: Joi.number().positive().required()
    })

    const { error, value } = schema.validate(income);
    if (error) {
        throw new Error(error.details[0].message);
    } else {
        return value;
    }
}

module.exports = logIncome;