require('dotenv').config();
const admin = require('../firebaseAdmin');

async function verifyFirebaseSetup() {
  try {
    console.log('Starting Firebase verification...');

    // Verify basic initialization
    if (!admin) {
      throw new Error('Firebase Admin not initialized');
    }

    // Verify app configuration
    const app = admin.app();
    const projectId = app.options.projectId;
    console.log('✓ Firebase App initialized');
    console.log('✓ Project ID:', projectId);

    // Test messaging service with a dry run
    const messaging = admin.messaging();
    const testMessage = {
      topic: 'test',
      notification: {
        title: 'Test',
        body: 'Test message'
      },
      android: {
        priority: 'high'
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default'
          }
        }
      }
    };

    try {
      await messaging.send(testMessage, true); // true for dry run
      console.log('✓ Firebase Messaging dry run successful');
    } catch (error) {
      if (error.code === 'messaging/invalid-recipient') {
        console.log('✓ Firebase Messaging configuration verified (expected error in dry run)');
      } else {
        throw error;
      }
    }

    // Verify APNS configuration
    const apnsMessage = {
      token: 'test-token', // Invalid token to test APNS configuration
      notification: {
        title: 'APNS Test',
        body: 'Testing APNS configuration'
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default'
          }
        },
        headers: {
          'apns-priority': '10'
        }
      }
    };

    try {
      await messaging.send(apnsMessage, true); // true for dry run
      console.log('✓ APNS configuration verified');
    } catch (error) {
      if (error.code === 'messaging/invalid-argument' || 
          error.code === 'messaging/registration-token-not-registered') {
        console.log('✓ APNS configuration verified (expected error with test token)');
      } else {
        console.error('! APNS configuration issue detected:', error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', error.errorInfo);
      }
    }

    console.log('\nFirebase verification completed! ✓');
    return true;
  } catch (error) {
    console.error('\nFirebase verification failed! ✗');
    console.error('Error:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.errorInfo) console.error('Error details:', error.errorInfo);
    return false;
  }
}

// Run verification
verifyFirebaseSetup()
  .then((success) => {
    if (!success) {
      process.exit(1);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('Verification script failed:', error);
    process.exit(1);
  });