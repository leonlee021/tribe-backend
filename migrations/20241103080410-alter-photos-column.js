'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change 'photos' column from JSON to ARRAY(TEXT)
    await queryInterface.changeColumn('Tasks', 'photos', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert 'photos' column back to JSON
    await queryInterface.changeColumn('Tasks', 'photos', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  }
};
