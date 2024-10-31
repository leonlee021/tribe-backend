// firebaseAdmin.js

const admin = require('firebase-admin');

let serviceAccount;

try {
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
  if (!serviceAccountBase64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set.');
  }

  const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
  serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('Firebase Admin initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1); // Exit the process if initialization fails
}

module.exports = admin;
