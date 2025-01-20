// middlewares/authenticateToken.js
const { admin } = require('../config/firebaseAdmin'); // Note the { admin } destructuring
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            console.warn('🔴 Authorization header missing');
            return res.status(401).json({ error: 'Authorization header missing' });
        }

        const token = authHeader.replace('Bearer ', '').trim();

        if (!token) {
            console.warn('🔴 Token missing or improperly formatted');
            return res.status(401).json({ error: 'Token missing or improperly formatted' });
        }

        try {
            // Add some debug logging
            console.log('🟡 Attempting to verify token');
            
            // Verify the ID token using Firebase Admin SDK
            const decodedToken = await admin.auth().verifyIdToken(token);
            console.log('🟢 Token verified successfully', { 
                uid: decodedToken.uid,
                email: decodedToken.email 
            });

            const firebaseUid = decodedToken.uid;
            const email = decodedToken.email;

            if (!firebaseUid || !email) {
                console.warn('🔴 Decoded token does not contain uid or email');
                return res.status(400).json({ error: 'Invalid token: UID or email missing' });
            }

            // Attach user info to request
            req.user = { uid: firebaseUid, email };
            next();
        } catch (err) {
            console.error('🔴 Token verification failed:', err);
            // More specific error handling
            if (err.code === 'auth/id-token-expired') {
                return res.status(401).json({ error: 'Token has expired' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('🔴 Middleware error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = authenticateToken;