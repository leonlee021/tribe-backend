'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'fcmToken', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'pushToken' // Add after existing pushToken field
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'fcmToken');
  }
};