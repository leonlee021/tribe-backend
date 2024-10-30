// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/', authenticateToken, reviewController.submitReview);

module.exports = router;
