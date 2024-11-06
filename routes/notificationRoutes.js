// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const notificationController = require('../controllers/notificationController');

router.post('/update-fcm-token', authenticateToken, notificationController.updateFcmToken);
router.get('/check-fcm-token', authenticateToken, notificationController.checkFcmToken);
router.get('/user-notifications', authenticateToken, notificationController.getUserNotifications);
router.post('/clear-task-notifications', authenticateToken, notificationController.clearTaskNotifications);

module.exports = router;