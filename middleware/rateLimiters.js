const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMS: 15 * 60 * 1000, //user has only 3 attempts within a 15 minute window
    max: 3,
    message: 'Exceeded number of login attemps, please try again later'
});

module.exports = loginLimiter;