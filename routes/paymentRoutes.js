const express = require('express');
const paymentController = require('../controllers/paymentController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

router.post('/setup-intent', authenticateToken, paymentController.createSetupIntent);
router.post('/attach-payment-method', authenticateToken, paymentController.attachPaymentMethod); 
router.get('/saved-card', authenticateToken, paymentController.getSavedCard);
router.post('/remove-card', authenticateToken, paymentController.removeCard);

module.exports = router;
