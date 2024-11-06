// scripts/testDatabase.js
require('dotenv').config();
const { sequelize } = require('../models');

async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Test User model
    const { User } = require('../models');
    const userCount = await User.count();
    console.log('Total users in database:', userCount);
    
    // Get database configuration
    const config = sequelize.config;
    console.log('Database configuration:', {
      host: config.host,
      database: config.database,
      username: config.username,
      dialect: config.dialect
      // Don't log password
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testDatabaseConnection();