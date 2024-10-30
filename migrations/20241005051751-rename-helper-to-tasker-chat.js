'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Chats', 'helperId', 'taskerId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Chats', 'taskerId', 'helperId');
  }
};
