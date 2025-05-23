'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Chats', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Chats', 'status');
  }
};
