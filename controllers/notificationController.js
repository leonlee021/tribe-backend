// controllers/notificationController.js
const { User, Notification } = require('../models');
const getAuthenticatedUserId = require('../utils/getAuthenticatedUserId');

const notificationController = {
    updateFcmToken: async (req, res) => {
        try {
            const { fcmToken, platform } = req.body;
            const email = req.user.email;

            console.log('Updating FCM token:', {
            email,
            platform,
            tokenLength: fcmToken?.length
            });

            if (!fcmToken) {
            return res.status(400).json({ error: 'FCM token is required' });
            }

            const user = await User.findOne({ where: { email } });
            if (!user) {
            return res.status(404).json({ error: 'User not found' });
            }

            // Update user with token and platform
            await user.update({ 
            fcmToken,
            devicePlatform: platform // Make sure to add this field to your User model
            });

            console.log('Token updated for user:', {
            userId: user.id,
            platform,
            tokenUpdated: true
            });

            res.json({ 
            success: true, 
            message: 'FCM token updated successfully'
            });
        } catch (error) {
            console.error('Error updating FCM token:', error);
            res.status(500).json({ error: 'Failed to update FCM token' });
        }
        },

        sendNotification: async (userId, title, body, data = {}) => {
            try {
              const user = await User.findByPk(userId);
              if (!user?.fcmToken) {
                console.log('No FCM token found for user:', userId);
                return;
              }
        
              const platform = user.devicePlatform || 'ios'; // Default to iOS if not specified
              console.log('Sending notification to platform:', platform);
        
              let message = {
                token: user.fcmToken,
                notification: {
                  title,
                  body,
                },
                data: {
                  ...data,
                  click_action: 'FLUTTER_NOTIFICATION_CLICK',
                },
              };
        
              // Add platform-specific configuration
              if (platform === 'ios') {
                message = {
                  ...message,
                  apns: {
                    headers: {
                      'apns-priority': '10',
                      'apns-push-type': 'alert'
                    },
                    payload: {
                      aps: {
                        alert: {
                          title,
                          body,
                        },
                        sound: 'default',
                        badge: 1,
                        'content-available': 1
                      },
                      ...data
                    }
                  }
                };
              } else {
                message = {
                  ...message,
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
              }
        
              const response = await admin.messaging().send(message);
              console.log(`Successfully sent notification to ${platform}:`, response);
              return response;
            } catch (error) {
              console.error('Error sending notification:', error);
              throw error;
            }
          },


  checkFcmToken: async (req, res) => {
    try {
      const email = req.user.email;
      const user = await User.findOne({ 
        where: { email },
        attributes: ['id', 'email', 'fcmToken']
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        email: user.email,
        fcmToken: user.fcmToken,
        hasToken: !!user.fcmToken
      });
    } catch (error) {
      console.error('Error checking FCM token:', error);
      res.status(500).json({ error: 'Failed to check FCM token' });
    }
  },

  getUserNotifications: async (req, res) => {
    try {
      const email = req.user.email;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userId = user.id;
      console.log('User ID:', userId);

      const notifications = await Notification.findAll({
        where: {
          userId: userId,
          isRead: false,
        },
      });

      console.log('Notifications found:', notifications);
      res.json({ notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  clearTaskNotifications: async (req, res) => {
    try {
      const { taskId, message } = req.body;
      const email = req.user.email;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userId = user.id;

      const notifications = await Notification.findAll({
        where: {
          userId: userId,
          taskId: taskId,
          message: message,
          isRead: false,
        }
      });

      console.log('Matching Notifications:', notifications);

      if (notifications.length === 0) {
        return res.json({ message: 'No matching notifications found. Nothing to update.' });
      }

      const [updatedRowsCount] = await Notification.update(
        { isRead: true },
        {
          where: {
            userId: userId,
            taskId: taskId,
            isRead: false,
            message: message
          }
        }
      );

      if (updatedRowsCount > 0) {
        return res.json({ message: 'Task notifications cleared' });
      } else {
        return res.json({ message: 'No unread notifications were updated.' });
      }
    } catch (error) {
      console.error('Error clearing task notifications:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = notificationController;