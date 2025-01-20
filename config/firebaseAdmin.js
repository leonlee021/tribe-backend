const admin = require('firebase-admin');

const initializeFirebaseAdmin = () => {
  try {
    if (!admin.apps.length) {
      const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
      if (!serviceAccountBase64) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 not found in environment');
      }

      const serviceAccount = JSON.parse(
        Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('🟢 Firebase Admin initialized successfully');
    }
  } catch (error) {
    console.error('🔴 Error initializing Firebase Admin:', error);
    throw error;
  }
};

module.exports = {
  admin,
  initializeFirebaseAdmin
};

// ///firebaseAdmin.js
// const admin = require('firebase-admin');
// require('dotenv').config();

// function initializeFirebaseAdmin() {
//   try {
//     // Check for service account credentials
//     const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
//     if (!serviceAccountBase64) {
//       throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set.');
//     }

//     // Decode and parse service account
//     let serviceAccount;
//     try {
//       const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
//       serviceAccount = JSON.parse(serviceAccountJson);
//     } catch (parseError) {
//       throw new Error(`Failed to parse service account JSON: ${parseError.message}`);
//     }

//     // Validate required service account fields
//     const requiredFields = ['project_id', 'private_key', 'client_email'];
//     for (const field of requiredFields) {
//       if (!serviceAccount[field]) {
//         throw new Error(`Service account missing required field: ${field}`);
//       }
//     }

//     // Initialize Firebase Admin
//     if (!admin.apps.length) {
//       admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//         projectId: serviceAccount.project_id
//       });

//       console.log('Firebase Admin initialized successfully:', {
//         projectId: serviceAccount.project_id,
//         clientEmail: serviceAccount.client_email
//       });
//     } else {
//       console.log('Firebase Admin already initialized');
//     }

//     return admin;
//   } catch (error) {
//     console.error('Firebase Admin initialization failed:', error.message);
//     throw error;
//   }
// }

// let firebaseAdmin;
// try {
//   firebaseAdmin = initializeFirebaseAdmin();
// } catch (error) {
//   console.error('Fatal: Could not initialize Firebase Admin');
//   process.exit(1);
// }

// module.exports = firebaseAdmin;

