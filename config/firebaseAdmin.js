// config/firebaseAdmin.js
const admin = require('firebase-admin');

const initializeFirebaseAdmin = () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      console.log('🟢 Firebase Admin initialized successfully');
    }
  } catch (error) {
    console.error('🔴 Error initializing Firebase Admin:', error);
    throw error;
  }
};

module.exports = { admin, initializeFirebaseAdmin };
