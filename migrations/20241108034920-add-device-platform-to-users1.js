// migrations/[timestamp]-fix-add-device-platform.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column exists first
      const tableDescribe = await queryInterface.describeTable('Users');
      
      if (!tableDescribe.devicePlatform) {
        console.log('Adding devicePlatform column...');
        await queryInterface.addColumn('Users', 'devicePlatform', {
          type: Sequelize.STRING(50),
          allowNull: true
        });
        console.log('devicePlatform column added successfully');
      } else {
        console.log('devicePlatform column already exists');
      }

      // Also verify fcmToken column
      if (!tableDescribe.fcmToken) {
        console.log('Adding fcmToken column...');
        await queryInterface.addColumn('Users', 'fcmToken', {
          type: Sequelize.STRING(255),
          allowNull: true
        });
        console.log('fcmToken column added successfully');
      }
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableDescribe = await queryInterface.describeTable('Users');
      
      if (tableDescribe.devicePlatform) {
        await queryInterface.removeColumn('Users', 'devicePlatform');
      }
    } catch (error) {
      console.error('Migration rollback failed:', error);
      throw error;
    }
  }
};