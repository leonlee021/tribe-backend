const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticateToken = require('../middlewares/authenticateToken');
const optionalAuthenticateToken = require('../middlewares/optionalAuthenticateToken'); // New middleware
router.use(optionalAuthenticateToken);

// Bring in the uploadTaskPhotos instance
const uploadTaskPhotos = taskController.uploadTaskPhotos; // If exported from taskController.js

// Routes for task operations
//router.post('/', authenticateToken, taskController.createTask);
router.post('/',
    authenticateToken, // Authentication middleware
    uploadTaskPhotos.array('photos', 5), // Multer middleware
    taskController.createTask // Controller
  );
router.get('/', optionalAuthenticateToken, taskController.getAllTasks);
router.get('/hidden', authenticateToken, taskController.getHiddenTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', authenticateToken, taskController.updateTask);
router.delete('/:taskId', authenticateToken, taskController.deleteTask);
router.get('/user/:userId', authenticateToken, taskController.getTasksByUser);
router.get('/tasker/:taskerId', authenticateToken, taskController.getTasksByHelper);
router.post('/:taskId/hide', authenticateToken, taskController.hideTask);
router.post('/:taskId/unhide', authenticateToken, taskController.unhideTask);
router.get('/:taskId/review-status', authenticateToken, taskController.hasSubmittedReview);

module.exports = router;
