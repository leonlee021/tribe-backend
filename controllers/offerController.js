// controllers/offerController.js

const { Offer, Task, User, Chat, Review, Sequelize, Notification } = require('../models');
const { Op } = require('sequelize');
const { sendPushNotification } = require('../services/notificationService');
const getAuthenticatedUserId = require('../utils/getAuthenticatedUserId'); // Import the utility function

module.exports = {
  // Submit a new offer
  createOffer: async (req, res) => {
    try {
      const { taskId, offerPrice, offerMessage } = req.body;

      // Fetch the authenticated user's ID
      const taskerId = await getAuthenticatedUserId(req);

      if (!taskerId) {
        console.error('Authenticated user ID is missing.');
        return res.status(401).json({ message: 'User authentication required.' });
      }

      // Validate input fields
      if (!taskId || !offerPrice || !offerMessage) {
        return res.status(400).json({ message: 'Task ID, offer price, and offer message are required.' });
      }

      // Check if the task exists and is open
      const task = await Task.findOne({ 
        where: { 
          id: taskId, 
          status: { 
            [Op.or]: ['open', 'offered'] 
          } 
        } 
      });
      if (!task) {
        return res.status(404).json({ message: 'Task not found or not open for offers.' });
      }

      // Prevent task owner from making an offer
      if (task.userId === taskerId) {
        return res.status(400).json({ message: 'Task owner cannot make an offer on their own task.' });
      }

      // Check if the user has already made an offer on this task
      const existingOffer = await Offer.findOne({ where: { taskId, taskerId } });
      if (existingOffer) {
        return res.status(400).json({ message: 'You have already made an offer on this task.' });
      }

      // Create the offer
      const offer = await Offer.create({
        taskId,
        taskerId,
        offerPrice,
        offerMessage,
      });

      // Create notification for the requester
      await Notification.create({
        taskId: task.id,
        userId: task.userId, // Notify the requester (owner of the task)
        message: "received offer",
        type: 'activity',
      });

      const taskOwner = await User.findByPk(task.userId);

      if (taskOwner && taskOwner.pushToken) {
        // Send a push notification
        await sendPushNotification(
          taskOwner.pushToken,
          'New Offer Received',
          `You have received a new offer on your task: ${task.taskName}`,
          { type: 'activity', taskId: task.id }
        );
      }

      // Increment the appliedByCount on Task
      await task.increment('appliedByCount');

      // Optionally update the task status to 'offered' if needed
      // Uncomment the following lines if you want to update the task status
      
      task.status = 'offered';
      await task.save();
      

      return res.status(201).json({ message: 'Offer submitted successfully.', offer });
    } catch (error) {
      console.error('Error creating offer:', error.message || error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'You have already made an offer on this task.' });
      }
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Get all offers for a specific task (only task owner can view)
  getOffersForTask: async (req, res) => {
    try {
      const { taskId } = req.params;

      // Fetch the authenticated user's ID
      const userId = await getAuthenticatedUserId(req);

      if (!userId) {
        console.error('Authenticated user ID is missing.');
        return res.status(401).json({ message: 'User authentication required.' });
      }

      // Validate taskId
      if (!taskId) {
        return res.status(400).json({ message: 'Task ID is required.' });
      }

      // Check if the task exists and belongs to the user
      const task = await Task.findOne({ where: { id: taskId, userId } });
      if (!task) {
        return res.status(404).json({ message: 'Task not found or you do not have permission to view offers.' });
      }

      // Fetch all offers for the task, including tasker details with averageRating
      const offers = await Offer.findAll({
        where: { taskId },
        include: [
          {
            model: User,
            as: 'tasker',
            attributes: ['id', 'firstName', 'lastName', 'profilePhotoUrl', 'averageRating'],
          },
        ],
      });

      return res.status(200).json({ offers });
    } catch (error) {
      console.error('Error fetching offers:', error.message || error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Accept an offer (only task owner can accept)
// controllers/offerController.js
acceptOffer: async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required.' });
    }

    if (!offerId) {
      return res.status(400).json({ message: 'Offer ID is required.' });
    }

    // Get offer with task and tasker details
    const offer = await Offer.findOne({
      where: { id: offerId },
      include: [
        { 
          model: Task, 
          as: 'task',
          include: [
            {
              model: User,
              as: 'requester',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        },
        {
          model: User,
          as: 'tasker',
          attributes: ['id', 'firstName', 'lastName', 'fcmToken']
        }
      ]
    });

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found.' });
    }

    const task = offer.task;
    const tasker = offer.tasker;

    // Ensure that only the task owner can accept the offer
    if (task.userId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to accept this offer.' });
    }

    // Ensure the offer is still pending
    if (offer.status !== 'pending') {
      return res.status(400).json({ message: 'This offer has already been processed.' });
    }

    // Mark the offer as accepted
    offer.status = 'accepted';
    await offer.save();

    // Mark all other pending offers for this task as declined
    await Offer.update(
      { status: 'declined' },
      { where: { taskId: task.id, id: { [Op.ne]: offer.id }, status: 'pending' } }
    );

    // Update task status and tasker
    task.status = 'active';
    task.taskerAcceptedId = offer.taskerId;

    // Create chat
    const chat = await Chat.create({
      requesterId: task.userId,
      taskerId: offer.taskerId,
      taskId: task.id,
      offerId: offer.id,
      status: 'active',
    });

    // Update task with chat ID
    task.chatId = chat.id;
    await task.save();

    // Create in-app notification
    await Notification.create({
      taskId: task.id,
      userId: task.taskerAcceptedId,
      message: "offer accepted",
      type: 'activity',
    });

    // Send push notification if tasker has FCM token
    if (tasker.fcmToken) {
      try {
        console.log('Sending push notification to tasker:', {
          taskerId: tasker.id,
          fcmToken: tasker.fcmToken
        });

        const notificationMessage = {
          token: tasker.fcmToken,
          notification: {
            title: 'Offer Accepted!',
            body: `Your offer for "${task.title}" has been accepted`,
          },
          data: {
            type: 'activity',
            taskId: task.id.toString(),
            chatId: chat.id.toString(),
            messageType: 'offer accepted',
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
          },
          android: {
            priority: 'high',
            notification: {
              channelId: 'default',
              priority: 'high',
              defaultVibrateTimings: true,
              icon: '@drawable/ic_notification',
              color: '#3717ce'
            }
          },
          apns: {
            payload: {
              aps: {
                alert: {
                  title: 'Offer Accepted!',
                  body: `Your offer for "${task.title}" has been accepted`
                },
                sound: 'default',
                badge: 1,
                'content-available': 1
              },
              type: 'activity',
              taskId: task.id.toString(),
              chatId: chat.id.toString(),
              messageType: 'offer accepted'
            },
            headers: {
              'apns-priority': '10',
              'apns-push-type': 'alert'
            }
          }
        };

        const response = await admin.messaging().send(notificationMessage);
        console.log('Push notification sent successfully:', response);
      } catch (error) {
        // Log push notification error but don't fail the offer acceptance
        console.error('Error sending push notification:', error);
      }
    } else {
      console.log('No FCM token found for tasker:', tasker.id);
    }

    return res.status(200).json({ 
      message: 'Offer accepted successfully.', 
      chat 
    });

  } catch (error) {
    console.error('Error accepting offer:', error.message || error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
},



  // Decline an offer (only task owner can decline)
  declineOffer: async (req, res) => {
    try {
      const { offerId } = req.params;

      // Fetch the authenticated user's ID
      const userId = await getAuthenticatedUserId(req);

      if (!userId) {
        console.error('Authenticated user ID is missing.');
        return res.status(401).json({ message: 'User authentication required.' });
      }

      // Validate offerId
      if (!offerId) {
        return res.status(400).json({ message: 'Offer ID is required.' });
      }

      // Find the offer and include the associated task
      const offer = await Offer.findOne({
        where: { id: offerId },
        include: [{ model: Task, as: 'task' }],
      });

      if (!offer) {
        return res.status(404).json({ message: 'Offer not found.' });
      }

      const task = offer.task;

      // Check if the user is the owner of the task
      if (task.userId !== userId) {
        return res.status(403).json({ message: 'You do not have permission to decline this offer.' });
      }

      // Check if the offer is still pending
      if (offer.status !== 'pending') {
        return res.status(400).json({ message: 'This offer has already been processed.' });
      }

      // Update the offer status to 'declined'
      offer.status = 'declined';
      await offer.save();

      // Decrement the appliedByCount on Task
      await task.decrement('appliedByCount');

      return res.status(200).json({ message: 'Offer declined successfully.' });
    } catch (error) {
      console.error('Error declining offer:', error.message || error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },
};
