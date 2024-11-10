'use strict';

/** @type {import('sequelize-cli').Migration} */
// migrations/YYYYMMDDHHMMSS-add-soft-delete-to-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Make email nullable
    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert email to non-nullable
    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};