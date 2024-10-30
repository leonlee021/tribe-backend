// routes/notifications.js

const express = require('express');
const router = express.Router();
const { User, Notification } = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');

// Route to get notifications for the current user
router.get('/user-notifications', authenticateToken, async (req, res) => {
    try {
        const email = req.user.email;
  
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
  
        const userId = user.id;

        console.log('User ID:', userId);

        // Fetch unread notifications for the user
        const notifications = await Notification.findAll({
            where: {
                userId: userId,
                isRead: false, // Only unread notifications
            },
        });

        // Log fetched notifications
        console.log('Notifications found:', notifications);

        res.json({ notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});



// Route to mark notifications as read
router.post('/clear-task-notifications', authenticateToken, async (req, res) => {
    try {
        const { taskId, message } = req.body;
        const email = req.user.email;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = user.id;

        // Log the notifications before trying to update them
        const notifications = await Notification.findAll({
            where: {
                userId: userId,
                taskId: taskId,
                message: message,
                isRead: false,
            }
        });

        console.log('Matching Notifications:', notifications); // Log matching notifications

        if (notifications.length === 0) {
            // Gracefully handle the case where no notifications are found without returning an error
            return res.json({ message: 'No matching notifications found. Nothing to update.' });
        }

        // Perform the update
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

        // Check the result of the update
        if (updatedRowsCount > 0) {
            return res.json({ message: 'Task notifications cleared' });
        } else {
            // Gracefully handle the case where no rows were updated
            return res.json({ message: 'No unread notifications were updated.' });
        }
    } catch (error) {
        console.error('Error clearing task notifications:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});



module.exports = router;
