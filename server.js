//Configuration
require('dotenv').config();
const app = require('./app');

const { sequelize } = require('./config/database');

//PORT
const PORT = process.env.PORT || 4444;

// Sync Sequelize and Start Server
(async () => {
    try {
      await sequelize.authenticate();
      console.log('Database connected successfully.');
  
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      process.exit(1); 
    }
  })();