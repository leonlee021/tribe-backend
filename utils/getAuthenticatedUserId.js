// utils/getAuthenticatedUserId.js

const { User } = require('../models');

const getAuthenticatedUserId = async (req) => {
    if (req.user && req.user.uid) {
        const user = await User.findOne({ where: { firebaseUid: req.user.uid } });
        if (user) {
            return user.id;
        } else {
            throw new Error('User not found');
        }
    }
    return null; // For unauthenticated users
};

module.exports = getAuthenticatedUserId;
