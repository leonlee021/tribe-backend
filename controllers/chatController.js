// controllers/chatController.js

const { Chat, Message, User, Task, Review, Cancellation, Offer, Notification } = require('../models');
const { Op } = require('sequelize');
const getAuthenticatedUserId = require('../utils/getAuthenticatedUserId'); // Import the utility function
const admin = require('../firebaseAdmin');

module.exports = {
  // Create a new chat
  createChat: async (req, res) => {
    try {
      const { taskId, taskerId } = req.body;

      // Fetch the authenticated user's ID
      const requesterId = await getAuthenticatedUserId(req);

      if (!requesterId) {
        console.error('Authenticated user ID is missing.');
        return res.status(401).json({ error: 'User authentication required.' });
      }

      // Validate input fields
      if (!taskId || !taskerId) {
        return res.status(400).json({ error: 'Task ID and Tasker ID are required.' });
      }

      // Check if the task exists
      const task = await Task.findOne({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ error: 'Task not found.' });
      }

      // Prevent task owner from initiating a chat with themselves
      if (task.userId === taskerId) {
        return res.status(400).json({ error: 'Task owner cannot initiate a chat with themselves.' });
      }

      // Check if the chat already exists between requester and tasker for the same task
      const existingChat = await Chat.findOne({
        where: {
          taskId,
          requesterId,
          taskerId,
        },
      });

      if (existingChat) {
        return res.status(400).json({ error: 'Chat already exists for this task between these users.' });
      }

      // Create the chat
      const chat = await Chat.create({ requesterId, taskerId, taskId, status: 'pending' });

      res.status(201).json(chat);
    } catch (error) {
      console.error('Error creating chat:', error.message || error);
      res.status(500).json({ error: 'Failed to create chat.' });
    }
  },

  // Get all messages for a chat
  getChatMessages: async (req, res) => {
    try {
      const { id: chatId } = req.params;

      // Fetch the authenticated user's ID
      const userId = await getAuthenticatedUserId(req);

      if (!userId) {
        console.error('Authenticated user ID is missing.');
        return res.status(401).json({ error: 'User authentication required.' });
      }

      // Check if the user is part of the chat
      const chat = await Chat.findOne({
        where: { id: chatId },
        attributes: ['id', 'requesterId', 'taskerId', 'taskId', 'status'],
      });

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found.' });
      }

      if (chat.requesterId !== userId && chat.taskerId !== userId) {
        return res.status(403).json({ error: 'You are not authorized to view messages in this chat.' });
      }

      // Fetch messages
      const messages = await Message.findAll({
        where: { chatId },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['firstName', 'lastName'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error.message || error);
      res.status(500).json({ error: 'Failed to fetch messages.' });
    }
  },

  // Send a message in a chat
  sendMessage: async (req, res) => {
    try {
      const { content } = req.body;
      const chatId = req.params.id;
      const senderId = await getAuthenticatedUserId(req);

      if (!senderId) {
        console.error('Authenticated user ID is missing.');
        return res.status(401).json({ error: 'User authentication required.' });
      }

      // Validate input fields
      if (!content) {
        return res.status(400).json({ error: 'Message content is required.' });
      }

      // Check if the chat exists and the user is part of it
      const chat = await Chat.findOne({
        where: { id: chatId },
        attributes: ['id', 'requesterId', 'taskerId', 'taskId', 'status'],
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['id', 'firstName', 'lastName', 'fcmToken']
          },
          {
            model: User,
            as: 'tasker',
            attributes: ['id', 'firstName', 'lastName', 'fcmToken']
          }
        ]
      });

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found.' });
      }

      if (chat.requesterId !== senderId && chat.taskerId !== senderId) {
        return res.status(403).json({ error: 'You are not authorized to send messages in this chat.' });
      }

      const recipientId = chat.requesterId === senderId ? chat.taskerId : chat.requesterId;
      const recipient = chat.requesterId === senderId ? chat.tasker : chat.requester;
      const sender = chat.requesterId === senderId ? chat.requester : chat.tasker;

      // Create the message
      const message = await Message.create({ content, senderId, chatId });

      // Create notification for the other user
      await Notification.create({
        taskId: chat.taskId,
        userId: recipientId, // Notify the other party (tasker or requester)
        message: "new message",
        type: "chat",
      });

      // Send push notification if recipient has FCM token
      if (recipient.fcmToken) {
        try {
          // Basic message structure
          const baseMessage = {
            token: recipient.fcmToken,
            notification: {
              title: `Message from ${sender.firstName}`,
              body: content.length > 100 ? `${content.substring(0, 97)}...` : content
            },
            data: {
              type: 'chat',
              chatId: chatId.toString(),
              taskId: chat.taskId.toString(),
              senderId: senderId.toString(),
              click_action: 'FLUTTER_NOTIFICATION_CLICK'
            }
          };

          // Try Android-specific configuration first
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
            await admin.messaging().send(androidMessage);
          } catch (androidError) {
            // If Android fails, try iOS-specific configuration
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
                      title: baseMessage.notification.title,
                      body: baseMessage.notification.body
                    },
                    sound: 'default',
                    badge: 1,
                    'content-available': 1
                  },
                  ...baseMessage.data
                }
              }
            };

            await admin.messaging().send(iosMessage);
          }
        } catch (pushError) {
          // Log push notification error but don't fail the message send
          console.error('Failed to send push notification:', pushError);
        }
      }

      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error.message || error);
      res.status(500).json({ error: 'Failed to send message.' });
    }
  },

  // Get all chats for a user (requester or tasker)
  getAllChats: async (req, res) => {
    try {
      // Fetch the authenticated user's ID
      const userId = await getAuthenticatedUserId(req);

      if (!userId) {
        console.error('Authenticated user ID is missing.');
        return res.status(401).json({ error: 'User authentication required.' });
      }

      const chats = await Chat.findAll({
        where: {
          [Op.or]: [{ requesterId: userId }, { taskerId: userId }],
        },
        include: [
          { model: User, as: 'requester', attributes: ['firstName', 'lastName'] },
          { model: User, as: 'tasker', attributes: ['firstName', 'lastName'] },
          { model: Task, attributes: ['taskName', 'status'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json(
        chats.map((chat) => ({
          id: chat.id,
          taskId: chat.taskId,
          taskName: chat.Task.taskName,
          status: chat.status,
          taskStatus: chat.Task.status,
          requesterName: `${chat.requester.firstName} ${chat.requester.lastName}`,
          taskerName: `${chat.tasker.firstName} ${chat.tasker.lastName}`,
          requesterId: chat.requesterId,
          taskerId: chat.taskerId,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        }))
      );
    } catch (error) {
      console.error('Error fetching chats:', error.message || error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  // Get a specific chat by ID
  getChatById: async (req, res) => {
    try {
      // Fetch the authenticated user's ID
      const userId = await getAuthenticatedUserId(req);

      if (!userId) {
        console.error('Authenticated user ID is missing.');
        return res.status(401).json({ error: 'User authentication required.' });
      }

      const chat = await Chat.findOne({
        where: { id: req.params.id },
        include: [
          {
            model: User,
            as: 'requester', // Alias to refer to the requester
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: User,
            as: 'tasker', // Alias to refer to the tasker
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: Task, // Include task to get taskName
            attributes: ['taskName'],
          },
          {
            model: Review,
            as: 'reviews',
            where: { reviewerId: userId },
            attributes: ['id', 'rating', 'review', 'reviewedUserId'],
            required: false,
          },
        ],
      });

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found.' });
      }

      // Ensure the user is part of the chat
      if (chat.requesterId !== userId && chat.taskerId !== userId) {
        return res.status(403).json({ error: 'You do not have permission to view this chat.' });
      }

      const hasSubmittedReview = chat.reviews && chat.reviews.length > 0;

      const chatDetails = {
        id: chat.id,
        requesterId: chat.requesterId,
        taskerId: chat.taskerId,
        taskId: chat.taskId,
        taskName: chat.Task.taskName, // Include taskName in response
        requesterName: `${chat.requester.firstName} ${chat.requester.lastName}`,
        taskerName: `${chat.tasker.firstName} ${chat.tasker.lastName}`,
        status: chat.status,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        hasSubmittedReview,
      };

      res.status(200).json(chatDetails);
    } catch (error) {
      console.error('Error fetching chat:', error.message || error);
      res.status(500).json({ error: 'Failed to fetch chat.' });
    }
  },

  // Mark task as completed
  completeTask: async (req, res) => {
    try {
      const { chatId } = req.body;

      // Fetch the authenticated user's ID
      const userId = await getAuthenticatedUserId(req);

      if (!userId) {
        console.error('Authenticated user ID is missing.');
        return res.status(401).json({ error: 'User authentication required.' });
      }

      // Validate input
      if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required.' });
      }

      // Find the chat
      const chat = await Chat.findByPk(chatId);

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found.' });
      }

      // Find the associated task
      const task = await Task.findByPk(chat.taskId);

      if (!task || task.status !== 'active') {
        return res.status(400).json({ error: 'Task not found or not active.' });
      }

      // Ensure that the requester is marking the task as completed
      if (task.userId !== userId) {
        return res.status(403).json({ error: 'Only the task requester can mark the task as completed.' });
      }

      // Update the task and chat statuses to 'completed'
      task.status = 'completed';
      chat.status = 'completed';

      await task.save();
      await chat.save();

      // Create a new notification for the completed task
      await Notification.create({
        taskId: task.id,
        userId: chat.taskerId, // Notify the tasker about the completion
        message: 'task completed',
        type: 'activity', // Custom type to identify completed task notifications
      });

      res.status(200).json({ message: 'Task marked as completed successfully.' });
    } catch (error) {
      console.error('Error marking task as completed:', error.message || error);
      res.status(500).json({ error: 'Failed to mark task as completed.' });
    }
  },


  cancelTask: async (req, res) => {
    try {
      const { chatId, reason } = req.body;
      const userId = await getAuthenticatedUserId(req);
  
      if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required.' });
      }
  
      const chat = await Chat.findByPk(chatId);
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found.' });
      }
  
      const task = await Task.findByPk(chat.taskId, {
        include: [{ model: Offer, as: 'offers' }],
      });
  
      if (!task) {
        return res.status(400).json({ error: 'Task not found or not active.' });
      }
  
      const isRequester = task.userId === userId;
      const isTasker = task.taskerAcceptedId === userId;
  
      if (!isRequester && !isTasker) {
        return res.status(403).json({ error: 'You are not authorized to cancel this task.' });
      }

      let otherUser;
      if (isRequester) {
        otherUser = task.taskerAcceptedId; // Tasker's ID before it's nullified
        if (!otherUser) {
          return res.status(400).json({ error: 'No tasker associated with this task.' });
        }
      } else {
        otherUser = task.userId; // Requester's ID
      }
  
      await Cancellation.create({
        taskId: task.id,
        canceledByUserId: userId,
        canceledByRole: isRequester ? 'requester' : 'tasker',
        reason: reason || null,
      });
  
      if (isTasker) {
        const tasker = await User.findByPk(userId);
        if (tasker) {
          tasker.canceledTasks = tasker.canceledTasks ? tasker.canceledTasks + 1 : 1;
          await tasker.save();
        }
      }

      await Notification.create({
        taskId: task.id,
        userId: otherUser, // Use the correct tasker ID here
        message: "task cancelled",
        type: 'activity',
     });  
  
      await Offer.update(
        { status: 'pending' },
        { where: { taskId: task.id, status: { [Op.ne]: 'cancelled' } } }
      );
  
      const acceptedOffer = task.offers.find(offer => offer.taskerId === task.taskerAcceptedId);
      if (acceptedOffer) {
        acceptedOffer.status = 'cancelled';
        await acceptedOffer.save();
      }
  
      // Reset chatId to null when the task is canceled
      task.status = 'offered';
      task.taskerAcceptedId = null;
      task.chatId = null;
      await task.save();
  
      chat.status = 'pending';
      await chat.save();

  
      res.status(200).json({ message: 'Task has been canceled and reverted to offered status.' });
    } catch (error) {
      console.error('Error canceling task:', error);
      res.status(500).json({ error: 'Failed to cancel the task.' });
    }
  },
  


};