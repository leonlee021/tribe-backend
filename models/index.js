// models/index.js

'use strict';

try {

  const fs = require('fs');
  const path = require('path');
  const Sequelize = require('sequelize');
  const basename = path.basename(__filename);
  const env = process.env.NODE_ENV || 'development';
  const db = {};

  let sequelize;
  
  // Check for DATABASE_URL to configure Heroku Postgres in production
  if (env === 'production' && process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // For Heroku Postgres
        },
      },
    });
  } else {
    // Local development config
    const dbConfig = {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: 'postgres',
    };
    sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      dialect: dbConfig.dialect,
    });
  }


  fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    try {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    } catch (error) {
      console.error(`Error loading model file ${file}:`, error);
      throw error; // Re-throw to prevent proceeding with an incomplete setup
    }
  });

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  // console.log('Loaded models:', Object.keys(db));

  // console.log('About to export db:', db);
  module.exports = db;
  // console.log('module.exports has been set.');

} catch (error) {
  console.error('Error in models/index.js:', error);
  // Re-throw the error to prevent silent failures
  throw error;
}
