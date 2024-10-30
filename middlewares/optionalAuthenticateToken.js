// middlewares/optionalAuthenticateToken.js

const admin = require('../firebaseAdmin');
const { User } = require('../models');

const optionalAuthenticateToken = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return next(); // Proceed without setting req.user
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return next(); // Proceed without setting req.user
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const firebaseUid = decodedToken.uid || decodedToken.sub || decodedToken.user_id;

        if (!firebaseUid) {
            return next(); // Proceed without setting req.user
        }

        const user = await User.findOne({ where: { firebaseUid } });
        if (user) {
            req.user = user;
        }
    } catch (err) {
        console.warn('Optional authentication failed:', err);
        // Proceed as guest
    }

    next();
};

module.exports = optionalAuthenticateToken;
