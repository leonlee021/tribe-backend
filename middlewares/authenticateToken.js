// middlewares/authenticateToken.js

const admin = require('../config/firebaseAdmin'); // Ensure the path is correct
const { User } = require('../models'); // Import your User model

const authenticateToken = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        console.warn('Authorization header missing');
        return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
        console.warn('Token missing or improperly formatted');
        return res.status(401).json({ error: 'Token missing or improperly formatted' });
    }

    try {
        // Verify the ID token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(token);
        const firebaseUid = decodedToken.uid; // Correct field extraction
        const email = decodedToken.email;

        if (!firebaseUid || !email) {
            console.warn('Decoded token does not contain uid or email');
            return res.status(400).json({ error: 'Invalid token: UID or email missing' });
        }

        // Attach user info to request (without querying the database)
        req.user = { uid: firebaseUid, email };
        next();
    } catch (err) {
        console.error(`Token verification failed for token: ${token}`, err);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authenticateToken;
