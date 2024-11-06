// scripts/testNotification.js
const admin = require('../firebaseAdmin');
const { User } = require('../models');

async function sendTestNotification(userEmail) {
  try {
    // Find user and their FCM token
    const user = await User.findOne({ 
      where: { email: userEmail }
    });

    if (!user || !user.fcmToken) {
      console.log('User not found or no FCM token available');
      return;
    }

    console.log('Found user:', user.email);
    console.log('FCM Token:', user.fcmToken);

    // Create notification message
    const message = {
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification from your app!'
      },
      data: {
        type: 'activity',
        taskId: '1',
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true,
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            contentAvailable: true
          }
        }
      },
      token: user.fcmToken
    };

    // Send the message
    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification:', response);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Test different notification types
async function sendMultipleTestNotifications(userEmail) {
  try {
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user || !user.fcmToken) {
      console.log('User not found or no FCM token available');
      return;
    }

    const notifications = [
      {
        title: 'New Activity',
        body: 'Someone has sent you a new task offer!',
        type: 'activity',
        taskId: '1'
      },
      {
        title: 'New Message',
        body: 'You have a new message in chat',
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
          taskId: notif.taskId
        },
        token: user.fcmToken
      };

      const response = await admin.messaging().send(message);
      console.log(`Sent ${notif.type} notification:`, response);
      
      // Wait 2 seconds between notifications
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error('Error sending test notifications:', error);
  }
}

// Usage
const userEmail = process.argv[2];
if (!userEmail) {
  console.error('Please provide a user email');
  process.exit(1);
}

console.log('Sending test notifications to:', userEmail);
sendMultipleTestNotifications(userEmail);