// testFirebaseAdmin.js

const admin = require('../firebaseAdmin');

const testAdmin = async () => {
  try {
    const user = await admin.auth().getUserByEmail('leonlee021@gmail.com');
    console.log('User data:', user.toJSON());
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

testAdmin();
