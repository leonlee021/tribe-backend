const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticateToken = require('../middlewares/authenticateToken');

// Route to fetch all chat conversations for the authenticated user
router.get('/', authenticateToken, chatController.getAllChats);

// Route to create a chat
router.post('/', authenticateToken, chatController.createChat);

// Route to get messages for a specific chat
router.get('/:id/messages', authenticateToken, chatController.getChatMessages);

// Route to send a message in a specific chat
router.post('/:id/messages', authenticateToken, chatController.sendMessage);

router.get('/:id', authenticateToken, chatController.getChatById);

router.post('/complete', authenticateToken, chatController.completeTask);

router.post('/cancelTask', authenticateToken, chatController.cancelTask);

module.exports = router;
