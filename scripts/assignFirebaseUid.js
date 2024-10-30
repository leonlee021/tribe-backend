const { v4: uuidv4 } = require('uuid');
const { User } = require('../models'); // Adjust this to the correct path to your models

async function assignUniqueFirebaseUid() {
  try {
    // Fetch all users
    const users = await User.findAll();

    // Loop through all users and assign a unique firebaseUid
    for (const user of users) {
      const newFirebaseUid = uuidv4(); // Generate a unique UUID for each user
      await user.update({ firebaseUid: newFirebaseUid });
    }

    console.log('Successfully assigned unique firebaseUid to all users.');
  } catch (error) {
    console.error('Error updating firebaseUid for users:', error);
  }
}

// Execute the function
assignUniqueFirebaseUid();
