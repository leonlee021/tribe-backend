// routes/cancellationRoutes.js
const express = require('express');
const router = express.Router();
const cancellationController = require('../controllers/cancellationController');

// Route to fetch cancellations by tasker
router.get('/tasker/:userId', cancellationController.getCancellationsByTasker);

module.exports = router;
