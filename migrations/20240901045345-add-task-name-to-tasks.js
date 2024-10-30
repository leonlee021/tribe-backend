'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Tasks', 'taskName', {
          type: Sequelize.STRING,
          allowNull: false,
      });
  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('Tasks', 'taskName');
  }
};
