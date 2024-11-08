// scripts/testNotifications.js
require('dotenv').config();
const admin = require('../firebaseAdmin');
const { User, Chat, Message, sequelize } = require('../models');

async function testNotifications(userEmail) {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // 1. Test FCM Token Retrieval
    const user = await User.findOne({ 
      where: { email: userEmail },
      attributes: ['id', 'email', 'fcmToken', 'firstName', 'lastName']
    });

    if (!user) {
      console.log('User not found:', userEmail);
      return;
    }

    console.log('Test 1: User FCM Token Check');
    console.log('User:', user.email);
    console.log('FCM Token:', user.fcmToken);
    console.log('Token length:', user.fcmToken?.length);
    console.log('-------------------');

    // 2. Test Different Message Types
    const testMessages = [
      {
        title: 'Test Chat Message',
        body: 'Short message test',
        type: 'chat',
        chatId: '123',
        taskId: '456'
      },
      {
        title: 'Test Long Message',
        body: 'This is a very long message that should be truncated when it appears in the notification. We want to make sure it handles long content properly and shows ellipsis when needed.',
        type: 'chat',
        chatId: '123',
        taskId: '456'
      },
      {
        title: 'Test Activity Update',
        body: 'New activity on your task',
        type: 'activity',
        taskId: '456'
      },
      {
        title: 'Test Special Characters',
        body: 'Testing emoji 👋 and special characters: @#$%',
        type: 'chat',
        chatId: '123',
        taskId: '456'
      }
    ];

    for (const [index, msg] of testMessages.entries()) {
      try {
        console.log(`\nTest ${index + 2}: Sending "${msg.title}"`);
        
        // Base message structure
        const baseMessage = {
          token: user.fcmToken,
          notification: {
            title: msg.title,
            body: msg.body.length > 100 ? `${msg.body.substring(0, 97)}...` : msg.body
          },
          data: {
            type: msg.type,
            chatId: msg.chatId,
            taskId: msg.taskId,
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
          }
        };

        // Try Android format first
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

        try {
          console.log('Attempting Android format...');
          const response = await admin.messaging().send(androidMessage);
          console.log('Android notification sent:', response);
        } catch (androidError) {
          console.log('Android format failed, trying iOS format...');
          
          // iOS format as fallback
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
                    title: msg.title,
                    body: msg.body.length > 100 ? `${msg.body.substring(0, 97)}...` : msg.body
                  },
                  sound: 'default',
                  badge: 1,
                  'content-available': 1
                },
                ...baseMessage.data
              }
            }
          };

          const response = await admin.messaging().send(iosMessage);
          console.log('iOS notification sent:', response);
        }

        // Wait between notifications
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        console.error(`Failed to send test ${index + 2}:`, {
          code: error.code,
          message: error.message,
          details: error.errorInfo
        });
      }
    }

    // 3. Test Error Cases
    console.log('\nTest 6: Invalid Token Test');
    try {
      await admin.messaging().send({
        token: 'invalid_token',
        notification: {
          title: 'Invalid Token Test',
          body: 'This should fail'
        }
      });
    } catch (error) {
      console.log('Expected error received:', error.message);
    }

    console.log('\nTest 7: Debug Info');
    console.log('Platform detection from token length:');
    if (user.fcmToken?.length > 140) {
      console.log('Likely iOS token');
    } else {
      console.log('Likely Android token');
    }

  } catch (error) {
    console.error('Error in test script:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  console.error('Usage: node scripts/testNotifications.js user@example.com');
  process.exit(1);
}

console.log('Starting notification tests for:', email);
testNotifications(email)
  .then(() => {
    console.log('All tests completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test script failed:', error);
    process.exit(1);
  });