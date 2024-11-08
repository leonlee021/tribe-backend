// scripts/testTokenUpdate.js
require('dotenv').config();
const { User, sequelize } = require('../models');

async function testTokenUpdate(email, testToken) {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    // Find user
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'email', 'fcmToken']
    });

    if (!user) {
      console.log('User not found:', email);
      return;
    }

    console.log('Before update:', {
      id: user.id,
      email: user.email,
      fcmToken: user.fcmToken
    });

    // Update token
    user.fcmToken = testToken;
    await user.save();

    // Verify update
    const updatedUser = await User.findByPk(user.id);
    console.log('After update:', {
      id: updatedUser.id,
      email: updatedUser.email,
      fcmToken: updatedUser.fcmToken
    });

  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await sequelize.close();
  }
}

const email = process.argv[2];
const testToken = process.argv[3] || 'test-token-' + Date.now();

if (!email) {
  console.error('Please provide an email address');
  console.error('Usage: node scripts/testTokenUpdate.js email@example.com [testToken]');
  process.exit(1);
}

testTokenUpdate(email, testToken);