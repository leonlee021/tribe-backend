// controllers/notificationController.js
const { User, Notification } = require('../models');
const { admin } = require('../config/firebaseAdmin');
const getAuthenticatedUserId = require('../utils/getAuthenticatedUserId');

const notificationController = {
  updateFcmToken: async (req, res) => {
    try {
      const { fcmToken, platform } = req.body;
      const email = req.user.email;

      if (!fcmToken) {
        return res.status(400).json({ error: 'FCM token is required' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ 
        fcmToken,
        devicePlatform: platform
      });

      console.log('🟢 Token updated for user:', {
        userId: user.id,
        platform,
        tokenUpdated: true
      });

      res.json({ success: true });
    } catch (error) {
      console.error('🔴 Error updating FCM token:', error);
      res.status(500).json({ error: 'Failed to update FCM token' });
    }
  },

  sendPushNotification: async (userId, title, body, data = {}) => {
    try {
      const user = await User.findByPk(userId);
      if (!user?.fcmToken) {
        console.log('🟡 No FCM token found for user:', userId);
        return null;
      }

      const message = {
        token: user.fcmToken,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          timestamp: Date.now().toString(),
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'default',
            sound: 'default',
            priority: 'high',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log('🟢 Push notification sent:', response);

      // Create notification record in database
      await Notification.create({
        userId,
        taskId: data.taskId || null,
        message: body,
        type: data.type || 'activity',
        isRead: false,
      });

      return response;
    } catch (error) {
      console.error('🔴 Error sending push notification:', error);
      throw error;
    }
  },

  createAndSendNotification: async (req, res) => {
    try {
      const { userId, title, body, taskId, type } = req.body;

      await notificationController.sendPushNotification(
        userId,
        title,
        body,
        {
          taskId,
          type,
          screen: 'TaskScreen', // or whatever screen you want to navigate to
          timestamp: Date.now().toString(),
        }
      );

      res.json({ success: true });
    } catch (error) {
      console.error('🔴 Error creating and sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  },

  getUserNotifications: async (req, res) => {
    try {
      const email = req.user.email;
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const notifications = await Notification.findAll({
        where: {
          userId: user.id,
          isRead: false,
        },
        order: [['createdAt', 'DESC']],
      });

      res.json({ notifications });
    } catch (error) {
      console.error('🔴 Error fetching notifications:', error);
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

      const [updatedCount] = await Notification.update(
        { isRead: true },
        {
          where: {
            userId: user.id,
            taskId,
            message,
            isRead: false,
          }
        }
      );

      res.json({ 
        success: true, 
        updatedCount,
        message: updatedCount > 0 ? 'Notifications cleared' : 'No notifications to clear' 
      });
    } catch (error) {
      console.error('🔴 Error clearing notifications:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = notificationController;