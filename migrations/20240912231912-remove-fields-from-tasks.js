'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tasks', 'requestType');
    await queryInterface.removeColumn('Tasks', 'deadline');
    await queryInterface.removeColumn('Tasks', 'specificHelper');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'requestType', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Tasks', 'deadline', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Tasks', 'specificHelper', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  }
};
