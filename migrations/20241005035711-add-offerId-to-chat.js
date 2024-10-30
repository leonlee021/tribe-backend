// migrations/XXXXXXXXXXXXXX-add-offerId-to-chat.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Chats', 'offerId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Offers',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Optional: Add index for offerId
    await queryInterface.addIndex('Chats', ['offerId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Chats', ['offerId']);
    await queryInterface.removeColumn('Chats', 'offerId');
  },
};
