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

        const offer = await Offer.findOne({
            where: { id: offerId },
            include: [{ model: Task, as: 'task' }],
        });

        if (!offer) {
            return res.status(404).json({ message: 'Offer not found.' });
        }

        const task = offer.task;

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

        // Set the tasker ID from the accepted offer and update the task status
        task.status = 'active';
        task.taskerAcceptedId = offer.taskerId;

        // Log taskerId and taskerAcceptedId for debugging purposes
        console.log('Tasker ID from Offer:', offer.taskerId);
        console.log('Tasker Accepted ID in Task:', task.taskerAcceptedId);

        // Ensure the taskerId is set before creating the notification
        if (!task.taskerAcceptedId) {
            return res.status(400).json({ message: 'Tasker ID is missing. Could not create notification.' });
        }

        // Create a chat between the requester and the tasker
        const chat = await Chat.create({
            requesterId: task.userId,
            taskerId: offer.taskerId,
            taskId: task.id,
            offerId: offer.id,
            status: 'active',
        });

        if (!task.taskerAcceptedId) {
          console.error('Tasker Accepted ID is missing. Cannot create notification.');
          return res.status(400).json({ message: 'Tasker ID is missing. Could not create notification.' });
      }
      
      // Log the taskerAcceptedId before creating the notification
      console.log('Creating notification for taskerAcceptedId:', task.taskerAcceptedId);
      

        // Create notification for the tasker (notify tasker that offer has been accepted)
        await Notification.create({
            taskId: task.id,
            userId: task.taskerAcceptedId, // Use the correct tasker ID here
            message: "offer accepted",
            type: 'activity',
        });

        // Update the task with the newly created chatId
        task.chatId = chat.id;
        await task.save();

        return res.status(200).json({ message: 'Offer accepted successfully.', chat });
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
