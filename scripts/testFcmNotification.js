// scripts/testNotification.js
require('dotenv').config();
const admin = require('../firebaseAdmin');
const { User, sequelize } = require('../models');

async function sendTestNotification(userEmail) {
  let connection;
  try {
    // Test database connection first
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
    } catch (dbError) {
      console.error('Unable to connect to the database:', dbError);
      process.exit(1);
    }

    // Find user
    const user = await User.findOne({ 
      where: { email: userEmail },
      attributes: ['id', 'email', 'fcmToken', 'firstName', 'lastName']
    });

    if (!user) {
      console.log('User not found:', userEmail);
      process.exit(1);
    }

    if (!user.fcmToken) {
      console.log('No FCM token found for user:', userEmail);
      process.exit(1);
    }

    console.log('Found user:', user.email);
    console.log('FCM Token:', user.fcmToken);

    // Send test notifications
    const notifications = [
      {
        title: 'Test Activity',
        body: `Hello ${user.firstName}, this is a test activity notification!`,
        type: 'activity',
        taskId: '1'
      },
      {
        title: 'Test Chat',
        body: 'This is a test chat notification',
        type: 'chat',
        taskId: '1'
      }
    ];

    for (const notif of notifications) {
      const message = {
        notification: {
          title: notif.title,
          body: notif.body
        },
        data: {
          type: notif.type,
          taskId: notif.taskId,
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        },
        token: user.fcmToken
      };

      try {
        const response = await admin.messaging().send(message);
        console.log(`Successfully sent ${notif.type} notification:`, response);
      } catch (fcmError) {
        console.error(`Error sending ${notif.type} notification:`, fcmError);
      }

      // Wait 2 seconds between notifications
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error('Error in test script:', error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Get email from command line argument
const userEmail = process.argv[2];
if (!userEmail) {
  console.error('Please provide a user email');
  console.error('Usage: node scripts/testNotification.js user@example.com');
  process.exit(1);
}

console.log('Starting notification test for:', userEmail);
sendTestNotification(userEmail).then(() => {
  console.log('Test script completed');
  process.exit(0);
}).catch(error => {
  console.error('Test script failed:', error);
  process.exit(1);
});