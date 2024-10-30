// migrations/XXXXXXXXXXXXXX-remove-deletedAt-from-tasks.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tasks', 'deletedAt');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }
};
