'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'photoUrl', {
      type: Sequelize.STRING,
      allowNull: true, // The field is optional
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tasks', 'photoUrl');
  }
};
