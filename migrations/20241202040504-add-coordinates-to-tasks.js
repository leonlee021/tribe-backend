'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
    });

    await queryInterface.addColumn('Tasks', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tasks', 'latitude');
    await queryInterface.removeColumn('Tasks', 'longitude');
  }
};