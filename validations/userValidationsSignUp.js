const Joi = require('joi');

function createSignUpSchema() {
    const today = new Date();
    const minimumEighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

    return Joi.object({
        username: Joi.string()
            .alphanum()
            .min(8)
            .max(32)
            .trim()
            .required()
            .messages({
                'string.alphanum': 'Username must only contain alphanumeric characters',
                'string.min': 'Username must be at least 8 characters long',
                'string.max': 'Username must not exceed 32 characters',
                'any.required': 'Username is required'
            }),

        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu', 'info'] } })
            .normalize()
            .trim()
            .required()
            .messages({
                'string.email': 'Email must be a valid email address',
                'any.required': 'Email is required'
            }),

        password: Joi.string()
            .trim()
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:\'",.<>?]).{8,32}$'))
            .required()
            .messages({
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be between 8 to 32 characters long.',
                'any.required': 'Password is required'
            }),

        dateOfBirth: Joi.date()
            .less('now')
            .required()
            .custom((value, helpers) => {
                const birthDate = new Date(value);
                if (birthDate > minimumEighteenYearsAgo) {
                    return helpers.error('any.invalid'); 
                }
                return value;
            })
            .messages({
                'date.base': 'Date of Birth must be a valid date',
                'any.invalid': 'You must be at least 18 years old',
                'any.required': 'Date of Birth is required'
            }),

        phoneNumber: Joi.string()
            .pattern(/^\+?[1-9]\d{1,14}$/)
            .optional() 
            .messages({
                'string.pattern.base': 'Phone number must be in E.164 format and contain 1 to 15 digits',
            }),

        webauthnid: Joi.string().trim().allow('').optional(), 
        webauthnpublickey: Joi.string().trim().allow('').optional(),
    });
}

module.exports = createSignUpSchema;
