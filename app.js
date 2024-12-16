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
const userController = require('./controllers/userController');

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

//Get One User
app.get('/users/:id', async (request, response) => {
    const userId = request.params.id;
    try {
        const user = await User.findByPk(userId, {
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
app.put('/users/:userId/income/:id', logIncomingRequest, incomeController.updateIncome);
//Delete Income
app.delete('/users/:userId/income/:id', logIncomingRequest, incomeController.deleteIncome);


//Create Expense 
app.post('/users/:user_id/expenses', logIncomingRequest, expenseController.createExpense);
//Get User Income
app.get('/users/:user_id/expenses', logIncomingRequest, async (request, response) => {
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
app.put('/users/:userId/expenses/:id', logIncomingRequest, expenseController.updateExpense);
//Delete Income
app.delete('/users/:userId/expenses/:id', logIncomingRequest, expenseController.deleteExpense);

app.use((req, res, next) => {
    console.log('Raw Request Body:', req.body);
    next();
});


//Budget Routes all working without validations
//Create Budget --
app.post('/users/:user_id/budget', logIncomingRequest, async (request, response) => {
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
app.get('/users/:userId/budget', logIncomingRequest, budgetController.getBudgetByUser);
//Update User Budget
app.put('/users/:userId/budget/:budgetId', logIncomingRequest, budgetController.updateBudget);
//Delete Budget
app.delete('/users/:userId/budget/:budgetId', logIncomingRequest, budgetController.deleteBudget);


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