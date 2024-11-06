const admin = require('../firebaseAdmin.js');
const { User, Notification } = require('../models');

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        type: data.type || 'activity',
        taskId: data.taskId?.toString() || '',
      },
      token: fcmToken,
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true,
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
    console.log('Successfully sent notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

const notificationService = {
  sendNotification: async (userId, title, body, notificationType, taskId = null) => {
    try {
      const user = await User.findByPk(userId);
      if (!user?.fcmToken) {
        console.log('No FCM token found for user:', userId);
        return;
      }

      // Create notification in database
      const notification = await Notification.create({
        userId,
        taskId,
        message: body,
        type: notificationType,
        isRead: false
      });

      // Send push notification
      await sendPushNotification(
        user.fcmToken,
        title,
        body,
        {
          type: notificationType,
          taskId,
          notificationId: notification.id.toString()
        }
      );

      return notification;
    } catch (error) {
      console.error('Error in notification service:', error);
      throw error;
    }
  }
};

module.exports = notificationService;