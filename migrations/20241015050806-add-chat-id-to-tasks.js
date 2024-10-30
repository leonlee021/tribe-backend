'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the chatId column to tasks
    await queryInterface.addColumn('Tasks', 'chatId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Chats', // Name of the table you are referencing
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // If the chat is deleted, set the chatId to NULL
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the chatId column from tasks
    await queryInterface.removeColumn('Tasks', 'chatId');
  }
};
