// scripts/testFcmNotification.js
require('dotenv').config();
const admin = require('../config/firebaseAdmin');
const { User, sequelize } = require('../models');

async function sendTestNotification(userEmail) {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    const user = await User.findOne({ 
      where: { email: userEmail },
      attributes: ['id', 'email', 'fcmToken', 'firstName', 'lastName']
    });

    if (!user) {
      console.log('User not found:', userEmail);
      return;
    }

    console.log('Found user:', user.email);
    console.log('FCM Token:', user.fcmToken);

    // Send test notifications with platform-specific configurations
    const notifications = [
      {
        title: 'Test Activity',
        body: `Hello ${user.firstName || 'there'}, this is a test activity notification!`,
        type: 'activity'
      },
      {
        title: 'Test Chat',
        body: 'This is a test chat notification',
        type: 'chat'
      }
    ];

    for (const notif of notifications) {
      try {
        // Basic message structure without platform-specific configs
        const baseMessage = {
          token: user.fcmToken,
          notification: {
            title: notif.title,
            body: notif.body
          },
          data: {
            type: notif.type,
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
          }
        };

        // Try sending Android-specific message first
        const androidMessage = {
          ...baseMessage,
          android: {
            priority: 'high',
            notification: {
              channelId: 'default',
              sound: 'default',
              priority: 'high',
              defaultVibrateTimings: true
            }
          }
        };

        console.log(`Sending ${notif.type} notification (Android)...`);
        try {
          const response = await admin.messaging().send(androidMessage);
          console.log(`Successfully sent ${notif.type} notification to Android:`, response);
          continue; // If Android succeeds, skip iOS attempt
        } catch (androidError) {
          console.log('Android notification failed, trying iOS...');
        }

        // If Android fails, try iOS-specific message
        const iosMessage = {
          ...baseMessage,
          apns: {
            headers: {
              'apns-priority': '10',
              'apns-push-type': 'alert'
            },
            payload: {
              aps: {
                alert: {
                  title: notif.title,
                  body: notif.body
                },
                sound: 'default',
                badge: 1,
                'content-available': 1
              },
              notificationType: notif.type
            }
          }
        };

        console.log(`Sending ${notif.type} notification (iOS)...`);
        const response = await admin.messaging().send(iosMessage);
        console.log(`Successfully sent ${notif.type} notification to iOS:`, response);

      } catch (error) {
        console.error(`Error sending ${notif.type} notification:`, {
          code: error.code,
          message: error.message,
          details: error.errorInfo
        });
      }

      // Wait between notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('Error in test script:', error);
  } finally {
    await sequelize.close();
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  console.error('Usage: node scripts/testFcmNotification.js user@example.com');
  process.exit(1);
}

console.log('Starting notification test for:', email);
sendTestNotification(email)
  .then(() => {
    console.log('Test script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test script failed:', error);
    process.exit(1);
  });