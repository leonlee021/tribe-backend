// scripts/updateFcmToken.js
require('dotenv').config();
const { User, sequelize } = require('../models');

async function updateUserFcmToken(email, fcmToken) {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    const result = await User.update(
      { fcmToken },
      { 
        where: { email },
        returning: true
      }
    );

    if (result[0] === 0) {
      console.log('No user found with email:', email);
      return;
    }

    console.log('FCM token updated successfully');
    
    // Verify the update
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'email', 'fcmToken']
    });

    console.log('Updated user:', {
      id: user.id,
      email: user.email,
      fcmToken: user.fcmToken
    });

  } catch (error) {
    console.error('Error updating FCM token:', error);
  } finally {
    await sequelize.close();
  }
}

const email = process.argv[2];
const fcmToken = process.argv[3];

if (!email || !fcmToken) {
  console.error('Please provide both email and FCM token');
  console.error('Usage: node scripts/updateFcmToken.js user@example.com fcm-token');
  process.exit(1);
}

updateUserFcmToken(email, fcmToken);