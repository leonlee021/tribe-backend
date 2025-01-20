// middlewares/optionalAuthenticateToken.js

const admin = require('../config/firebaseAdmin');
const { User } = require('../models');

const optionalAuthenticateToken = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        // Continue without authentication
        next();
        return;
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
        return next(); // Proceed without setting req.user
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = { 
            uid: decodedToken.uid, 
            email: decodedToken.email 
        };
    } catch (err) {
        console.warn('Optional authentication failed:', err);
        // Proceed as guest
    }

    next();
};

module.exports = optionalAuthenticateToken;
