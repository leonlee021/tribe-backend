// controllers/taskController.js

const { Task, Chat, User, sequelize, Review, Cancellation, TaskHide, Offer, Notification } = require('../models');
const { Op } = require('sequelize');
const getAuthenticatedUserId = require('../utils/getAuthenticatedUserId'); 

// Create a new task
// Create a new task

const multer = require('multer');
const path = require('path');

// Set up storage for task photos
const taskPhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/task_photos/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Create the multer instance for task photos
const uploadTaskPhotos = multer({ storage: taskPhotoStorage });
exports.uploadTaskPhotos = uploadTaskPhotos;

exports.createTask = async (req, res) => {
    try {
        const { taskName, postContent, locationDependent, location, price, taskerUsername } = req.body;
        
        // Validate taskName
        if (!taskName || taskName.trim().split(' ').length > 5) {
            return res.status(400).json({ error: 'Task name is required and must be no longer than 5 words.' });
        }

        const userId = await getAuthenticatedUserId(req);

        if (!userId) {
            console.error('Authenticated user ID is missing.');
            return res.status(401).json({ error: 'User authentication required.' });
        }

        // Handle uploaded images
        let photoUrls = [];
        if (req.files && req.files.length > 0) {
            const protocol = req.protocol;
            const host = req.get('host');

            photoUrls = req.files.map(file => {
                // Construct the URL to access the uploaded image
                return `${protocol}://${host}/uploads/task_photos/${file.filename}`;
            });
        }

        // Create the task
        const task = await Task.create({
            taskName: taskName.trim(),
            postContent,
            locationDependent,
            location,
            price,
            taskerUsername,
            photos: photoUrls, // Store the array of photo URLs
            userId,
        });

        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error.message || error);
        res.status(500).json({ error: 'Failed to create task.' });
    }
};


// Get tasks created by a specific user
exports.getTasksByUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Validate userId
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        // Fetch hidden task IDs for the user
        const hiddenTaskIds = await TaskHide.findAll({
            where: { userId },
            attributes: ['taskId'],
        }).then(hides => hides.map(hide => hide.taskId));

        // Fetch all tasks created by the user
        const allTasks = await Task.findAll({
            where: { userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'profilePhotoUrl'],
                },
                {
                    model: Offer,
                    as: 'offers',
                    include: [
                        {
                            model: User,
                            as: 'tasker',
                            attributes: ['id', 'firstName', 'lastName', 'profilePhotoUrl'],
                        },
                    ],
                },
                {
                    model: Chat,
                    as: 'activeChat',
                    include: [
                        {
                            model: Review,
                            as: 'reviews',
                            required: false,
                            attributes: ['id', 'rating', 'review', 'reviewedUserId'],
                        },
                    ],
                },
            ],
        });

        // Filter out hidden tasks for displaying
        const visibleTasks = allTasks.filter(task => !hiddenTaskIds.includes(task.id));

        // Calculate total reviews and average rating including hidden tasks
        let totalReviews = 0;
        let totalRating = 0;

        allTasks.forEach(task => {
            if (task.activeChat && task.activeChat.reviews) {
                task.activeChat.reviews.forEach(review => {
                    if (parseInt(review.reviewedUserId) === parseInt(userId)) {
                        totalReviews += 1;
                        totalRating += review.rating;
                    }
                });
            }
        });

        // Calculate the average rating
        const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : null;

        res.status(200).json({
            tasks: visibleTasks, // Return only visible tasks
            averageRating,
            reviewCount: totalReviews,
        });
    } catch (error) {
        console.error('Error fetching tasks by user:', error);
        res.status(500).json({ error: 'Failed to fetch tasks for user.' });
    }
};

// Get all tasks with additional user context
exports.getAllTasks = async (req, res) => {
    try {
        // Fetch the authenticated user ID
        const userId = await getAuthenticatedUserId(req);

        if (userId) {
            //console.log('Fetching tasks for authenticated user ID:', userId);
        } else {
            //console.log('Fetching tasks for guest user');
        }

        // Fetch all tasks with related data
        const tasks = await Task.findAll({
            
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'profilePhotoUrl'],
                },
                {
                    model: Offer,
                    as: 'offers',
                    include: [
                        {
                            model: User,
                            as: 'tasker',
                            attributes: ['id', 'firstName', 'lastName', 'profilePhotoUrl', 'averageRating'],
                        },
                    ],
                },
                {
                    model: Chat,
                    as: 'activeChat',
                    attributes: ['id', 'taskerId'],
                },
                {
                    model: Cancellation,
                    as: 'cancellations',
                    attributes: ['reason', 'canceledByRole'],
                    include: [
                        {
                            model: User,
                            as: 'canceledByUser',
                            attributes: ['id', 'firstName', 'lastName'],
                        },
                    ],
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        //console.log('Number of tasks fetched:', tasks.length);

        // Map through tasks to add additional context
        const tasksWithCounts = tasks.map(task => {
            const appliedByCount = task.offers.length;
            const userHasApplied = userId
                ? task.offers.some(offer => offer.taskerId === userId)
                : false;

            return {
                ...task.toJSON(),
                appliedByCount,
                userHasApplied,
            };
        });

        res.json(tasksWithCounts);
    } catch (err) {
        console.error('Error fetching all tasks:', err);
        res.status(500).json({ error: 'Failed to fetch all tasks.' });
    }
};


// Get a specific task by ID
exports.getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id;

        // Validate taskId
        if (!taskId) {
            return res.status(400).json({ error: 'Task ID is required.' });
        }

        const task = await Task.findByPk(taskId, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['firstName', 'lastName', 'profilePhotoUrl'],
                },
                {
                    model: Offer,
                    as: 'offers',
                    include: [
                        {
                            model: User,
                            as: 'tasker',
                            attributes: ['id', 'firstName', 'lastName', 'profilePhotoUrl', 'averageRating'],
                        },
                    ],
                },
                // Include other associations as needed
            ],
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        res.json(task);
    } catch (error) {
        console.error('Error fetching task by ID:', error);
        res.status(500).json({ error: 'Failed to fetch task.' });
    }
};

// Update a task
exports.updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { uid } = req.user; // Authenticated user's UID

        // Validate taskId
        if (!taskId) {
            return res.status(400).json({ error: 'Task ID is required.' });
        }

        // Fetch the user to get userId
        let userId = null;
        try {
            userId = await getAuthenticatedUserId(req);
        } catch (userError) {
            console.error('Error fetching user ID:', userError.message);
            return res.status(401).json({ error: 'User authentication required.' });
        }

        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        // Check if the authenticated user is the owner of the task
        if (task.userId !== userId) {
            return res.status(403).json({ error: 'You are not authorized to update this task.' });
        }

        // Update the task with provided data, including photoUrl
        await task.update({
            ...req.body, // Use spread to update any other fields passed in req.body
            photos: req.body.photos || task.photos, // Update the photos array if provided
        });

        res.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task.' });
    }
};


// Delete a task
// Flag a task as deleted instead of actually deleting it
exports.deleteTask = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const { uid } = req.user; // Authenticated user's UID

        // Validate taskId
        if (!taskId) {
            return res.status(400).json({ error: 'Task ID is required.' });
        }

        // Fetch the user to get userId
        let userId = null;
        try {
            userId = await getAuthenticatedUserId(req);
        } catch (userError) {
            console.error('Error fetching user ID:', userError.message);
            return res.status(401).json({ error: 'User authentication required.' });
        }

        // Start a transaction
        const transaction = await sequelize.transaction();

        try {
            // Find the task
            const task = await Task.findByPk(taskId, { transaction });
            if (!task) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Task not found.' });
            }

            // Check if the authenticated user is the owner of the task
            if (task.userId !== userId) {
                await transaction.rollback();
                return res.status(403).json({ error: 'You are not authorized to delete this task.' });
            }

            // Flag the task as deleted
            task.deleted = true;
            await task.save({ transaction });

            // Commit the transaction
            await transaction.commit();

            res.status(200).json({ message: 'Task flagged as deleted successfully.' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Error flagging task as deleted:', error);
        res.status(500).json({ error: 'Failed to flag task as deleted.' });
    }
};


// Hide a task for the authenticated user
exports.hideTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { uid } = req.user; // Authenticated user's UID

        // Validate taskId
        if (!taskId) {
            return res.status(400).json({ error: 'Task ID is required.' });
        }

        // Fetch the user to get userId
        let userId = null;
        try {
            userId = await getAuthenticatedUserId(req);
        } catch (userError) {
            console.error('Error fetching user ID:', userError.message);
            return res.status(401).json({ error: 'User authentication required.' });
        }

        // Check if the task exists
        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        // Check if the user has already hidden this task
        const existingHide = await TaskHide.findOne({ where: { taskId, userId } });
        if (existingHide) {
            return res.status(400).json({ error: 'Task is already hidden.' });
        }

        // Create a TaskHide entry
        await TaskHide.create({ taskId, userId });

        res.status(200).json({ message: 'Task hidden successfully.' });
    } catch (error) {
        console.error('Error hiding task:', error);
        res.status(500).json({ error: 'Failed to hide task.' });
    }
};

// Unhide a task for the authenticated user
exports.unhideTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { uid } = req.user; // Authenticated user's UID

        // Validate taskId
        if (!taskId) {
            return res.status(400).json({ error: 'Task ID is required.' });
        }

        // Fetch the user to get userId
        let userId = null;
        try {
            userId = await getAuthenticatedUserId(req);
        } catch (userError) {
            console.error('Error fetching user ID:', userError.message);
            return res.status(401).json({ error: 'User authentication required.' });
        }

        // Find the TaskHide entry
        const hideEntry = await TaskHide.findOne({ where: { taskId, userId } });
        if (!hideEntry) {
            return res.status(400).json({ error: 'Task is not hidden.' });
        }

        // Delete the TaskHide entry
        await hideEntry.destroy();

        res.status(200).json({ message: 'Task unhidden successfully.' });
    } catch (error) {
        console.error('Error unhiding task:', error);
        res.status(500).json({ error: 'Failed to unhide task.' });
    }
};

// Fetch hidden tasks for the authenticated user
exports.getHiddenTasks = async (req, res) => {
    try {
        const { uid } = req.user; // Extract 'uid' from 'req.user'

        // Fetch the user from the database to get the 'id'
        let userId = null;
        try {
            userId = await getAuthenticatedUserId(req);
        } catch (userError) {
            console.error('Error fetching user ID:', userError.message);
            return res.status(401).json({ error: 'User authentication required.' });
        }
        
        // Fetch hidden task IDs
        const hiddenTaskIds = await TaskHide.findAll({
            where: { userId },
            attributes: ['taskId'],
        }).then(hides => hides.map(hide => hide.taskId));

        // Fetch all hidden tasks
        const hiddenTasks = await Task.findAll({
            where: { id: hiddenTaskIds },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'profilePhotoUrl'],
                },
                {
                    model: Chat,
                    as: 'activeChat',
                    include: [
                        {
                            model: Review,
                            as: 'reviews',
                            required: false,
                        },
                    ],
                },
            ],
        });

        res.status(200).json({ tasks: hiddenTasks });
    } catch (error) {
        console.error('Error fetching hidden tasks:', error);
        res.status(500).json({ error: 'Failed to fetch hidden tasks.' });
    }
};



// Get tasks accepted by a specific helper (tasker)
exports.getTasksByHelper = async (req, res) => {
    const taskerId = req.params.taskerId;

    try {
        // Validate taskerId
        if (!taskerId) {
            return res.status(400).json({ error: 'Tasker ID is required.' });
        }

        // Fetch hidden task IDs for the helper
        const hiddenTaskIds = await TaskHide.findAll({
            where: { userId: taskerId },
            attributes: ['taskId'],
        }).then(hides => hides.map(hide => hide.taskId));

        // Fetch all tasks accepted by the helper
        const allTasks = await Task.findAll({
            where: {
                taskerAcceptedId: taskerId,
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'profilePhotoUrl'],
                },
                {
                    model: Offer,
                    as: 'offers',
                    include: [
                        {
                            model: User,
                            as: 'tasker',
                            attributes: ['id', 'firstName', 'lastName', 'profilePhotoUrl'],
                        },
                    ],
                },
                {
                    model: Chat,
                    as: 'activeChat',
                    include: [
                        {
                            model: Review,
                            as: 'reviews',
                            required: false,
                            attributes: ['id', 'rating', 'review', 'reviewedUserId'],
                        },
                    ],
                },
            ],
        });

        // Filter out hidden tasks for displaying
        const visibleTasks = allTasks.filter(task => !hiddenTaskIds.includes(task.id));

        // Calculate total reviews and average rating including hidden tasks
        let totalReviews = 0;
        let totalRating = 0;

        allTasks.forEach(task => {
            if (task.activeChat && task.activeChat.reviews) {
                task.activeChat.reviews.forEach(review => {
                    if (parseInt(review.reviewedUserId) === parseInt(taskerId)) {
                        totalReviews += 1;
                        totalRating += review.rating;
                    }
                });
            }
        });

        // Calculate the average rating
        const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : null;

        res.status(200).json({
            tasks: visibleTasks, // Return only visible tasks
            averageRating,
            reviewCount: totalReviews,
        });
    } catch (error) {
        console.error('Error fetching tasks by helper:', error);
        res.status(500).json({ error: 'Failed to fetch tasks for helper.' });
    }
};

exports.hasSubmittedReview = async(req,res) => {
    try {
        const { taskId } = req.params;
        const userId = await getAuthenticatedUserId(req); // Function to get logged-in user ID
  
        if (!userId) {
          return res.status(401).json({ error: 'User authentication required.' });
        }

        //console.log('Checking task with ID:', taskId);
  
        // Find the task to get the associated chatId
        const task = await Task.findOne({ where: { id: taskId } });
        if (!task) {
          return res.status(404).json({ error: 'Task not found.' });
        }

        //console.log('Found task:', task); 
  
        // Check if the task has a chatId
        if (!task.chatId) {
        //console.log('No chatId for this task');
          return res.status(200).json({ hasSubmittedReview: false });
        }

        //console.log('Task chatId:', task.chatId); // Debugging
  
        // Check if the user has submitted a review for the task's chat
        const review = await Review.findOne({
          where: {
            chatId: task.chatId,
            reviewerId: userId,
          },
        });

        //console.log('Review found:', review); // Debugging
  
        const hasSubmittedReview = !!review; // true if review exists, false otherwise
        return res.status(200).json({ hasSubmittedReview });
      } catch (error) {
        console.error('Error checking if review was submitted:', error.message || error);
        return res.status(500).json({ error: 'Failed to check if review was submitted.' });
      }
};