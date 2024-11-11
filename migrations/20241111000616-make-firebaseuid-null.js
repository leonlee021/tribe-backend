// migrations/YYYYMMDDHHMMSS-modify-firebase-uid-constraint.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'firebaseUid', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'firebaseUid', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
