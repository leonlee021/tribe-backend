const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authenticateToken');
const { uploadProfilePhoto } = require('../middlewares/upload');
const admin = require('../config/firebaseAdmin');


router.get('/', userController.getAllUsers);
router.post('/', authenticateToken, userController.createOrUpdateUser);
router.get('/profile', authenticateToken, userController.getUserProfile);
router.put('/profile', authenticateToken, userController.updateUserProfile);
router.get('/:userId', authenticateToken, userController.getUserProfileById);
router.post('/profile-photo', authenticateToken, uploadProfilePhoto.single('profilePhoto'), userController.uploadProfilePhoto);
router.delete('/delete-account', authenticateToken, userController.deleteAccount);
router.post('/push-token', authenticateToken, userController.updatePushToken);

module.exports = router;
