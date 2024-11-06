// scripts/checkFcmToken.js
require('dotenv').config();
const { User, sequelize } = require('../models');

async function checkFcmToken(email) {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'email', 'fcmToken']
    });

    if (!user) {
      console.log('User not found:', email);
      return;
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      hasFcmToken: !!user.fcmToken,
      fcmToken: user.fcmToken
    });

  } catch (error) {
    console.error('Error checking FCM token:', error);
  } finally {
    await sequelize.close();
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

checkFcmToken(email);