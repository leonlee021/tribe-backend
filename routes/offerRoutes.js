// routes/offerRoutes.js

const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const authenticateToken = require('../middlewares/authenticateToken.js'); // Middleware to authenticate requests


// Submit a new offer
router.post('/', authenticateToken, offerController.createOffer);

// Get all offers for a specific task (task owner only)
router.get('/task/:taskId', authenticateToken, offerController.getOffersForTask);

// Accept an offer (task owner only)
router.post('/accept/:offerId', authenticateToken, offerController.acceptOffer);

// Decline an offer (task owner only)
router.post('/decline/:offerId', authenticateToken, offerController.declineOffer);

module.exports = router;
