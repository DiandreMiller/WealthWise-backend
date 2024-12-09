//Dependencies
const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

//Database
const sequelize = require('./config/database');

//Configuration
const app = express();

// Rate limiting
const limiter = require('./middlewares/rateLimiters'); 

// Incoming request logging
const logIncomingRequest = require('./middlewares/incomingRequests');

//Global Limiters 
//Should I do global limiters?
// app.use(limiter);

const Expense = require('./models/expenseModel');
const User = require('./models/userModels');
const Income = require('./models/incomeModel');


const allowedOrigins = [process.env.FRONTEND_URL_LOCAL, process.env.FRONTEND_URL_DEPLOYED];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); 
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Block's API Testing Tools

// app.use((request, response, next) => {
//     const userAgent = request.headers['user-agent'];
    
//     const blockedAgents = ['Postman', 'Insomnia', 'Paw', 'Swagger', 'curl', 'HTTPie', 
//         'Apigee', 'Rest-Assured', 'JMeter', 'Karate DSL', 'Tavern', 'Hoppscotch', 
//     'Newman', 'Assertible', 'TestMace', 'Beeceptor', 'API Fortress', 'Runscope'];
    
//     if (blockedAgents.some(agent => userAgent && userAgent.includes(agent))) {
//         return response.status(403).send('Requests from API testing tools are not allowed.');
//     }
    
//     next();
// });

  

// app.use(express.json()); // it messes up get requests
app.use((request, response, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        express.json()(request, response, next); 
    } else {
        next();  
    }
});



// Logs all registered routes
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log('middleware logs app.js',middleware.route.path); 
    }
});

//Log one:

app.use((request, response, next) => {
    console.log(`Incoming Request - Method: ${request.method}, URL: ${request.url}`);
    next();
});




// Validations
const signInValidation = require('./validations/userValidationsSignIn');
const signUpValidation = require('./validations/userValidationsSignUp');
const incomeValidation = require('./validations/incomeValidation');
const expenseValidation = require('./validations/expenseValidation');
const budgetValidation = require('./validations/budgetValidation');

//Controllers
const signInController = require('./controllers/signInController'); 
const signUpController = require('./controllers/signUpController'); 
const passkeyController = require('./controllers/passkeyController'); 
const authenticatePasskeyController = require('./controllers/authenticatePasskeyController');
const challengeController = require('./controllers/challengeController');
const incomeController = require('./controllers/userIncomeController');
const expenseController = require('./controllers/expenseController');
const budgetController = require('./controllers/budgetController');

//Check incoming requests
app.use(logIncomingRequest);

//Routes
app.get('/', (request, response) => {
    response.send('Welcome Wealth Wise. Your Ultimate Financial App.');
});

// Rate limiting and validation middleware to routes
app.post('/sign-in', 
    [
        body('identifier').trim().escape().notEmpty().withMessage('Email, username, or phone number is required'),
        body('password').trim().escape().notEmpty().withMessage('Password is required')
    ], 
    async (request, response) => {
    // console.log('Incoming request:', request.method, request.originalUrl);
    // console.log('Request Body:', request.body);

    // Validate the incoming request
    const { error } = signInValidation().validate(request.body); 
    if (error) {
        console.log('Validation Error Sign In:', error.details);
        return response.status(400).json({ message: error.details[0].message });
    }

    // Proceed to the controller if validation passes
    signInController(request, response);
});


app.post('/sign-up', limiter, 
    [
    body('username').trim().escape().notEmpty().withMessage('Username is required'),
    body('email').trim().isEmail().escape().withMessage('Valid email is required'),
    body('password').trim().escape().notEmpty().withMessage('Password is required'),
    body('dateOfBirth').isDate().withMessage('Valid date of birth is required'),
    body('phoneNumber').trim().optional().escape().isMobilePhone().withMessage('Valid phone number is required')
], 
async (request, response) => {
    console.log('Incoming request:', request.method, request.originalUrl);
    console.log('Request Body:', request.body);

     // Validate the incoming request
     const errors = validationResult(request);
     if (!errors.isEmpty()) {
         console.log('Validation Error Sign Up:', errors.array());
         return response.status(400).json({ message: errors.array() });
     }

    // Validate the incoming request
    const { error } = signUpValidation().validate(request.body);
    if (error) {
        console.log('Validation Error Sign Up:', error.details);
        return response.status(400).json({ message: error.details[0].message });
    }

    await signUpController(request, response);
});

//Create Income
app.post('/users/:user_id/income', logIncomingRequest, limiter, incomeController.createIncome);
//Get User Income
// app.get('/users/:user_id/income', logIncomingRequest, limiter, incomeController.getUserIncome);
app.get('/users/:user_id/income', logIncomingRequest, limiter, async (request, response) => {
    const userId = request.params.user_id;

    try {
        const incomeRecords = await Income.findAll({
            where: { user_id: userId },
            include: {
                model: User,
                where: { id: userId },
                required: true,
            },
        });

        response.json(incomeRecords);
    } catch (error) {
        console.error('Error fetching income records:', error);
        response.status(500).json({ message: 'Failed to fetch income records' });
    }
});

//Update Income
app.put('/users/:userId/income/:id', logIncomingRequest, limiter, incomeController.updateIncome);
//Delete Income
app.delete('/users/:userId/income/:id', logIncomingRequest, limiter, incomeController.deleteIncome);


//Create Expense 
app.post('/users/:user_id/expenses', logIncomingRequest, limiter, expenseController.createExpense);
//Get User Income
app.get('/users/:user_id/expenses', logIncomingRequest, limiter, async (request, response) => {
    const userId = request.params.user_id;
    try {
      const expenses = await Expense.findAll({
        where: { user_id: userId },
        include: {
          model: User,
          where: { id: userId },
          required: true,
        },
      });
      response.json(expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      response.status(500).json({ message: 'Failed to fetch expenses' });
    }
  });
  
//Update Income
app.put('/users/:userId/expenses/:id', logIncomingRequest, limiter, expenseController.updateExpense);
//Delete Income
app.delete('/users/:userId/expenses/:id', logIncomingRequest, limiter, expenseController.deleteExpense);

app.use((req, res, next) => {
    console.log('Raw Request Body:', req.body);
    next();
});


//Budget Routes all working without validations
//Create Budget --
app.post('/users/:user_id/budget', logIncomingRequest, limiter, async (request, response) => {
    try {
        console.log('Request Body:', request.body); 
        console.log('Request Params:', request.params); 
    
        // Add `user_id` from route params to the request body
        // const budgeting = { ...request.body, user_id: request.params.userId };
        const budgeting = { ...request.body, user_id: request.params.user_id };
        console.log('test:', budgeting.user_id);

        // Validate the combined object
        const validatedBudget = budgetValidation(budgeting);

        // Proceed to the controller if validation passes
        await budgetController.createBudget( request, response);
    } catch (error) {
        console.error('Budget creation error:', error.message);
        response.status(400).json({ message: error.message });
    }
});

//Get User Budget
app.get('/users/:userId/budget', logIncomingRequest, limiter, budgetController.getBudgetByUser);
//Update User Budget
app.put('/users/:userId/budget/:budgetId', logIncomingRequest, limiter, budgetController.updateBudget);
//Delete Budget
app.delete('/users/:userId/budget/:budgetId', logIncomingRequest, limiter, budgetController.deleteBudget);


app.post('/register-passkey', logIncomingRequest, passkeyController.registerPasskey);
app.post('/verify-passkey', logIncomingRequest, passkeyController.verifyPasskey);
app.post('/authenticate-passkey', logIncomingRequest, authenticatePasskeyController.authenticatePasskey);

app.get('/generate-challenge',  challengeController);

app.get('*', (request, response) => {
    response.status(404).send('Page not found again');
});

// Error handling middleware
app.use((err, request, response, next) => {
    console.error(err.stack); 
    response.status(500).json({ message: 'Server error', error: err.message }); 
});


module.exports = app;