const admin = require('../config/firebaseAdmin');
const { User } = require('../models');

async function testNotification(userId) {
  try {
    // Get user's FCM token
    const user = await User.findByPk(userId);
    if (!user?.fcmToken) {
      console.log('No FCM token found for user:', userId);
      return;
    }

    const message = {
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification'
      },
      data: {
        type: 'activity',
        taskId: '1',
      },
      token: user.fcmToken,
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent test notification:', response);
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
}

// Usage: node scripts/testFcmNotification.js userId
const userId = process.argv[2];
if (!userId) {
  console.error('Please provide a user ID');
  process.exit(1);
}

testNotification(userId);