const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const notificationController = require('../controllers/notificationController');
const { User } = require('../models'); 

// FCM token management
router.post('/update-fcm-token', authenticateToken, notificationController.updateFcmToken);
router.get('/check-fcm-token', authenticateToken, notificationController.checkFcmToken);

// Notification management
router.post('/send', authenticateToken, notificationController.createAndSendNotification);
router.get('/user-notifications', authenticateToken, notificationController.getUserNotifications);
router.post('/clear-task-notifications', authenticateToken, notificationController.clearTaskNotifications);

// routes/notificationRoutes.js
router.post('/test', authenticateToken, async (req, res) => {
    try {
        const email = req.user.email;
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send the push notification directly without creating a database record
        const message = {
            token: user.fcmToken,
            notification: {
                title: 'Test Notification',
                body: 'This is a test notification'
            },
            data: {
                type: 'activity',
                timestamp: Date.now().toString()
            }
        };

        const response = await admin.messaging().send(message);

        res.json({ 
            success: true, 
            fcmToken: user.fcmToken,
            response 
        });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ 
            error: 'Test failed',
            details: error.message
        });
    }
});

module.exports = router;