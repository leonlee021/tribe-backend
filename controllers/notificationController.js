// controllers/notificationController.js
const { User, Notification } = require('../models');
const getAuthenticatedUserId = require('../utils/getAuthenticatedUserId');

const notificationController = {
  updateFcmToken: async (req, res) => {
    try {
      const { fcmToken } = req.body;
      const email = req.user.email;
    
      console.log('Updating FCM token for user:', email);
      console.log('New FCM token:', fcmToken);

      if (!fcmToken) {
        console.log('FCM token missing in request');
        return res.status(400).json({ error: 'FCM token is required' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log('User not found:', email);
        return res.status(404).json({ error: 'User not found' });
      }

      await User.update(
        { fcmToken },
        { where: { id: user.id } }
      );

      console.log('FCM token updated successfully for user:', email);

      res.json({ success: true, message: 'FCM token updated successfully' });
    } catch (error) {
      console.error('Error updating FCM token:', error);
      res.status(500).json({ error: 'Failed to update FCM token' });
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