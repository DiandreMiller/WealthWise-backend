//Configuration
require('dotenv').config();
const app = require('./app');

//PORT
const PORT = process.env.PORT || 4444;

//Listen
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
