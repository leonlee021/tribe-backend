// scripts/testNotifications.js
require('dotenv').config();
const admin = require('../firebaseAdmin');
const { User, sequelize } = require('../models');

async function testNotifications(userEmail) {
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

    if (!user.fcmToken) {
      console.log('No FCM token found for user');
      return;
    }

    console.log('Testing notifications for user:', {
      email: user.email,
      fcmToken: user.fcmToken,
      tokenLength: user.fcmToken?.length
    });

    // Test messages
    const testMessages = [
      {
        title: 'Test Chat Message',
        body: 'This is a test chat message',
        type: 'chat',
        chatId: '123',
        taskId: '456'
      },
      {
        title: 'Test Activity',
        body: 'This is a test activity notification',
        type: 'activity',
        taskId: '789'
      }
    ];

    for (const [index, msg] of testMessages.entries()) {
      try {
        console.log(`\nSending test message ${index + 1}:`, msg);

        // Construct the message payload
        const message = {
          token: user.fcmToken,
          notification: {
            title: msg.title,
            body: msg.body
          },
          data: {
            type: msg.type,
            chatId: msg.chatId?.toString() || '',
            taskId: msg.taskId?.toString() || '',
            messageId: `test-${Date.now()}-${index}`,
            senderId: user.id.toString()
          },
          android: {
            priority: 'high',
            notification: {
              channelId: 'default',
              priority: 'max',
              defaultSound: true,
              defaultVibrateTimings: true
            }
          },
          apns: {
            payload: {
              aps: {
                alert: {
                  title: msg.title,
                  body: msg.body
                },
                sound: 'default',
                badge: 1,
                'content-available': 1
              }
            },
            headers: {
              'apns-priority': '10',
              'apns-push-type': 'alert'
            }
          }
        };

        console.log('Sending message with payload:', JSON.stringify(message, null, 2));
        const response = await admin.messaging().send(message);
        console.log('Message sent successfully:', response);

        // Create notification in database
        const notification = {
          userId: user.id,
          type: msg.type,
          chatId: msg.chatId,
          taskId: msg.taskId,
          message: msg.title,
          isRead: false
        };
        
        console.log('Creating notification in database:', notification);
        // Add code here to create notification in your database if needed

        // Wait between messages
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error('Error sending message:', error.code, error.message);
        if (error.errorInfo) {
          console.error('Error info:', error.errorInfo);
        }
      }
    }

  } catch (error) {
    console.error('Error in test script:', error);
  } finally {
    await sequelize.close();
    console.log('Test completed');
  }
}

// Run the script with more error handling
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  console.error('Usage: node scripts/testNotifications.js user@example.com');
  process.exit(1);
}

console.log('Starting notification test for:', email);
testNotifications(email)
  .then(() => {
    console.log('Test script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test script failed:', error);
    process.exit(1);
  });