'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename 'user_id' to 'reviewedUserId'
    await queryInterface.renameColumn('Reviews', 'user_id', 'reviewedUserId');

    // Rename 'reviewer_id' to 'reviewerId'
    await queryInterface.renameColumn('Reviews', 'reviewer_id', 'reviewerId');

    // Add 'chatId' column
    await queryInterface.addColumn('Reviews', 'chatId', {
      type: Sequelize.INTEGER,
      allowNull: false, // Adjust according to your requirements
      references: {
        model: 'Chats',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Update foreign key for 'reviewedUserId'
    await queryInterface.removeConstraint('Reviews', 'Reviews_user_id_fkey');
    await queryInterface.addConstraint('Reviews', {
      fields: ['reviewedUserId'],
      type: 'foreign key',
      name: 'Reviews_reviewedUserId_fkey',
      references: {
        table: 'Users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Update foreign key for 'reviewerId'
    await queryInterface.removeConstraint('Reviews', 'Reviews_reviewer_id_fkey');
    await queryInterface.addConstraint('Reviews', {
      fields: ['reviewerId'],
      type: 'foreign key',
      name: 'Reviews_reviewerId_fkey',
      references: {
        table: 'Users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert 'reviewedUserId' back to 'user_id'
    await queryInterface.renameColumn('Reviews', 'reviewedUserId', 'user_id');

    // Revert 'reviewerId' back to 'reviewer_id'
    await queryInterface.renameColumn('Reviews', 'reviewerId', 'reviewer_id');

    // Remove 'chatId' column
    await queryInterface.removeColumn('Reviews', 'chatId');

    // Restore foreign key for 'user_id'
    await queryInterface.removeConstraint('Reviews', 'Reviews_reviewedUserId_fkey');
    await queryInterface.addConstraint('Reviews', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'Reviews_user_id_fkey',
      references: {
        table: 'Users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Restore foreign key for 'reviewer_id'
    await queryInterface.removeConstraint('Reviews', 'Reviews_reviewerId_fkey');
    await queryInterface.addConstraint('Reviews', {
      fields: ['reviewer_id'],
      type: 'foreign key',
      name: 'Reviews_reviewer_id_fkey',
      references: {
        table: 'Users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
};
