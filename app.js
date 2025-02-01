//Dependencies
const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const { validate: validateUuid } = require('uuid'); 

//Database
const sequelize = require('./config/database');

//Configuration
const app = express();

//Cors Policy
var corsOptions = {
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL_DEPLOYED : process.env.FRONTEND_URL_LOCAL,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

app.use(cors(corsOptions));

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
const Budget = require('./models/budgetModel');



// Block's API Testing Tools
app.use((request, response, next) => {
    const userAgent = request.headers['user-agent'];
    
    const blockedAgents = [
        'Postman', 'Insomnia', 'Paw', 'Swagger', 'curl', 'HTTPie', 
        'Apigee', 'Rest-Assured', 'JMeter', 'Karate DSL', 'Tavern', 'Hoppscotch', 
        'Newman', 'Assertible', 'TestMace', 'Beeceptor', 'API Fortress', 'Runscope', 
        'Wget', 'Arthas Tunnel', 'Bat', 'Hurl', 'Restish', 'Axios Mock Adapter', 
        'fetch-mock', 'Mocha', 'Cypress', 'Nightwatch.js', 'PyRestTest', 'Locust', 
        'pytest-httpx', 'HTTPretty', 'WireMock', 'Spock Framework', 'TestNG', 
        'VCR', 'Faraday', 'RSpec API Documentation', 'Guzzle', 'Laravel Dusk', 
        'Artillery', 'Gatling', 'Vegeta', 'Boom', 'PostgREST', 'JSON Server', 
        'MSW (Mock Service Worker)', 'Prism', 'OWASP ZAP', 'Burp Suite', 
        'Nikto', 'Mitmproxy', 'SmartBear ReadyAPI', 'BlazeMeter', 'Testim', 
        'Thunder Client', 'REST Client', 'Postwoman (Hoppscotch)', 'Tyk Test Framework', 
        'FastAPI TestClient', 'Grpcurl', 'RoboHydra', 'Apache HttpClient', 
        'Zerocode', 'Step CI', 'Spectral', 'Fortio', 'Apiritif', 'SoapUI', 
        'GraphiQL', 'Altair', 'Mockoon', 'Swagger UI', 'Chakram', 'Supertest', 
        'K6', 'WireMock', 'API Tester', 'Boomi', 'LoopBack Explorer', 'API Blueprint', 
        'CloudTest', 'SlashDB', 'LambdaTest', 'Dredd', 'API Gateway Testing Console', 
        'RestCase', 'Nock', 'MockServer', 'Mirage JS', 'Traffic Parrot', 'Hoverfly', 
        'MockLab', 'Interceptor', 'Scriptrunner', 'Kong', 'LocalStack', 'Acunetix', 
        'Nessus', 'NetSparker', 'Qualys', 'Burp API Scanner', 'SecApps', 'SSLyze', 
        'Intruder.io', 'API Security.io', 'Firebug Lite', 'API Buddy', 'Fiddler Everywhere', 
        'Boomerang', 'Advanced REST Client', 'ReqBin', 'ReqRes', 'HTTP Debugger', 
        'Charles Proxy', 'BrowserStack API Testing', 'Nightfall AI', 'HTTP Toolkit', 
        'Smocker', 'HTTP Prompt', 'FakeIt', 'JQ', 'HTTPRequester', 'Netcat', 
        'TLSScan', 'SockJS', 'NanoHTTPD', 'Feign', 'OkHttp', 'Unirest', 'Retrofit', 
        'Spring WebTestClient', 'Requests-Mock', 'WebTest', 'Testify', 
        'Falcon Testing Library', 'Tornado HTTPClient', 'FrisbyJS', 'PactJS', 
        'Puppeteer', 'Jasmine-ajax', 'Jest Mock Fetch', 'Zend HTTP Client', 
        'PHPUnit REST API Testing', 'PHPSpec', 'Cucumber', 'Typhoeus', 'Resty', 
        'Golang HTTP Mock', 'Loader.io', 'Tsung', 'NeoLoad', 'LoadNinja', 'WebLOAD', 
        'OpenSTA', 'Locust', 'Siege', 'Hey', 'Taurus', 'Postman Monitors', 
        'Uptrends', 'StatusCake', 'Pingdom', 'Datadog API Monitoring', 'Uptime Robot', 
        'Moesif', 'Dotcom-Monitor', 'Splunk Synthetic Monitoring', 'Sentry', 
        'Parasoft SOAtest', 'Telerik Test Studio', 'Protractor', 'Katalon Studio', 
        'TestProject', 'API-Checker', 'ScriptRunner for APIs', 'Mocky.io', 
        'Faker.js', 'Pyngrok', 'Clouditor', 'Firecamp', 'FoxyProxy', 'Grizzly HTTP', 
        'HTTPBin', 'Requestly', 'WireMock Cloud', 'SwaggerHub', 'Gravitee', 
        'WcfStorm', 'API Umbrella', 'Redocly', 'API Science', 'Dart HTTP Client', 
        'Hitch', 'OpenAPI Diff', 'Swagger Validator', 'RoboHydra Server', 'OverOps', 
        'StormForge', 'LoadView', 'Tyk Dashboard', 'Kubernetes Kube-API', 
        'AquaSec Kube-Bench', 'AppDynamics API Monitoring', 'Keycloak REST Client', 
        'Dredd CLI', 'Tyk Gateway', 'Grizzly Load Tester', 'Restlet Client', 
        'Fiddler Classic', 'K6 Cloud', 'Parrot', 'Swagger Codegen', 'APIsec', 
        'Zanshin API Scanner', 'Imperva API Security', 'Salt Security', 
        'Traceable AI', 'Sauce Labs API Testing', 'SmartMock.io', 'Snapshooter', 
        'Reflect', 'Vialer.js', 'NGINX Amplify', 'GraphQL Inspector'
    ];
    
    
    if (blockedAgents.some(agent => userAgent && userAgent.includes(agent))) {
        return response.status(403).send('Requests from API testing tools are not allowed.');
    }
    
    next();
});

  

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
// const budgetValidation = require('./validations/budgetValidation');

//Controllers
const signInController = require('./controllers/signInController'); 
const signUpController = require('./controllers/signUpController'); 
const passkeyController = require('./controllers/passkeyController'); 
const authenticatePasskeyController = require('./controllers/authenticatePasskeyController');
const challengeController = require('./controllers/challengeController');
const incomeController = require('./controllers/userIncomeController');
const expenseController = require('./controllers/expenseController');
const budgetController = require('./controllers/budgetController');
const userController = require('./controllers/userController');
const resetPasswordController = require('./controllers/resetPasswordController');

//Security
const security = require('./utils/encryption')

//Check incoming requests
app.use(logIncomingRequest);

//Routes
app.get('/', (request, response) => {
    response.send('Welcome Wealth Wise. Your Ultimate Financial App.');
});

// Rate limiting and validation middleware to routes
app.post('/sign-in', limiter,
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

//Get One User
app.get('/users/:id', async (request, response) => {

   
    try {
        const encryptedUserId = request.params.id;
        console.log('encryptedUserId:', encryptedUserId);
        const decryptedUserId = security.decrypt(encryptedUserId);
        console.log('decryptedUserId:', decryptedUserId);

        if (!decryptedUserId) {
            return response.status(400).json({ message: 'Invalid user ID after decryption' });
        }

        const user = await User.findByPk(decryptedUserId, {
            attributes: { exclude: ['password'] }, 
        });
        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }
        response.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        response.status(500).json({ message: 'Failed to fetch user' });
    }
});

//Create Income
app.post('/users/:user_id/income', logIncomingRequest, incomeController.createIncome);
//Get User Income
app.get('/users/:user_id/income', logIncomingRequest, async (request, response) => {
    const userId = request.params.user_id;
    const decryptedUserId = security.decrypt(userId);

    try {
        const incomeRecords = await Income.findAll({
            where: { user_id: decryptedUserId },
            include: {
                model: User,
                where: { id: decryptedUserId },
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
app.put('/users/:userId/income/:id', logIncomingRequest, incomeController.updateIncome);
//Delete Income
app.delete('/users/:userId/income/:id', logIncomingRequest, incomeController.deleteIncome);


//Create Expense 
app.post('/users/:user_id/expenses', logIncomingRequest, expenseController.createExpense);
//Get User Income
app.get('/users/:user_id/expenses', logIncomingRequest, async (request, response) => {
    const userId = request.params.user_id;
    const decryptedUserId = security.decrypt(userId)
    try {
      const expenses = await Expense.findAll({
        where: { user_id: decryptedUserId },
        include: {
          model: User,
          where: { id: decryptedUserId },
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
app.put('/users/:userId/expenses/:id', logIncomingRequest, expenseController.updateExpense);
//Delete Income
app.delete('/users/:userId/expenses/:id', logIncomingRequest, expenseController.deleteExpense);

app.use((req, res, next) => {
    console.log('Raw Request Body:', req.body);
    next();
});


//Budget Routes all working without validations - investigate why
//Create Budget --
// app.post('/users/:user_id/budget', logIncomingRequest, async (request, response) => {
//     try {
//         console.log('Request Body:', request.body); 
//         console.log('Request Params:', request.params); 
//         const encryptedUserId = request.params.user_id;
//         const decryptedUserId = security.decrypt(encryptedUserId);
//         console.log('decryptedUserId budget:', decryptedUserId);

//         if (!decryptedUserId) {
//             return response.status(400).json({ message: 'Invalid user ID after decryption' });
//         }
    
//         // Add `user_id` from route params to the request body
//         // const budgeting = { ...request.body, user_id: request.params.userId };
//         // const budgeting = { ...request.body, user_id: request.params.user_id };
//         const budgeting = { ...request.body, user_id: decryptedUserId };
//         console.log('test:', budgeting.user_id);

//         // Validate the combined object
//         const validatedBudget = budgetValidation(budgeting);

//         // Proceed to the controller if validation passes
//         await budgetController.createBudget( { ...value }, response);
//         } catch (error) {
//         console.error('Budget creation error:', error.message);
//         response.status(400).json({ message: error.message });
//     }
// });

app.post('/users/:user_id/budget', logIncomingRequest, async (request, response) => {
    try {
        console.log('Request Body:', request.body); 
        console.log('Request Params:', request.params); 

        // ✅ Decrypt user_id before using it
        const encryptedUserId = request.params.user_id;
        const decryptedUserId = security.decrypt(encryptedUserId);
        console.log('✅ Decrypted User ID:', decryptedUserId);

        if (!decryptedUserId) {
            return response.status(400).json({ message: 'Invalid user ID after decryption' });
        }

        // ✅ Create budgeting object with decrypted user_id
        const budgeting = { 
            ...request.body, 
            user_id: decryptedUserId  // ✅ Ensure user_id is included!
        };
        console.log('✅ Budgeting object being validated:', budgeting);

        await budgetController.createBudget({ body: budgeting }, response);
    } catch (error) {
        console.error('🚨 Budget creation error:', error.message);
        response.status(500).json({ message: 'Failed to create budget' });
    }
});





//Get User Budget
app.get('/users/:userId/budget', logIncomingRequest, budgetController.getBudgetByUser);

//Get specific user budget
app.get('/users/:userId/budget/:budgetId', logIncomingRequest, async (request, response) => {
    const { userId, budgetId } = request.params;
    console.log('userId:', userId);
    console.log('Received budgetId:', budgetId, '| Length:', budgetId.length);
    console.log('Characters:', [...budgetId]);

    if (budgetId.length !== 36) {
        console.log('Invalid length for budgetId:', budgetId, '| Length:', budgetId.length);
        return response.status(400).json({ message: 'Invalid budgetId length' });
    }
    

    if (!validateUuid(budgetId)) {
        console.log('Invalid budgetId format:', budgetId);
        return response.status(400).json({ message: 'Invalid budgetId format' });
    }

    console.log('Fetching budget for userId:', userId, 'budgetId:', budgetId);

    try {
        const decryptedUserId = security.decrypt(userId);
        console.log('decryptedUserId budget:', decryptedUserId);
        const budget = await Budget.findOne({
            where: { user_id: decryptedUserId, budget_id: budgetId },
        });

        console.log('Budget Query Result:', budget);

        if (!budget) {
            return response.status(404).json({ message: 'Budget not found' });
        }

        response.status(200).json(budget);
    } catch (error) {
        console.error('Error fetching budget:', error.message);
        response.status(500).json({ message: 'Failed to fetch budget' });
    }
});


//Update User Budget
app.put('/users/:userId/budget/:budgetId', logIncomingRequest, budgetController.updateBudget);
//Delete Budget
app.delete('/users/:userId/budget/:budgetId', logIncomingRequest, budgetController.deleteBudget);


// Password Reset Request Route
app.post('/password-reset-request', async (request, response) => {
    try {
        const { email } = request.body;

        if (!email) {
            return response.status(400).json({ error: 'Email is required' });
        }

        await resetPasswordController.requestPasswordReset(email);
        response.status(200).json({
            message: 'If the email exists, a password reset link has been sent.',
        });
    } catch (error) {
        console.error('Error in /password-reset-request:', error.message);
        response.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});

// Reset Password Route
app.post('/reset-password', async (request, response) => {
    try {
        const { token, newPassword } = request.body;

        if (!token || !newPassword) {
            return response.status(400).json({ error: 'Token and new password are required.' });
        }

        await resetPasswordController.resetPassword(token, newPassword);
        response.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
        console.error('Error in /reset-password:', error.message);
        response.status(500).json({ error: 'An error occurred while resetting the password.' });
    }
});


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