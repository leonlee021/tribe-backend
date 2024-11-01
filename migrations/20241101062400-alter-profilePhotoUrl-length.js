'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'profilePhotoUrl', {
      type: Sequelize.TEXT, // Allows for much longer strings
      allowNull: true,      // Adjust based on your model's requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'profilePhotoUrl', {
      type: Sequelize.STRING(255), // Revert back to original type
      allowNull: true,             // Adjust based on your model's requirements
    });
  }
};
