// migrations/20241101-add-chatId-to-Task.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // await queryInterface.addColumn('Tasks', 'chatId', {
    //   type: Sequelize.INTEGER,
    //   allowNull: true, // or false based on your requirements
    // });
  },

  down: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn('Tasks', 'chatId');
  }
};
