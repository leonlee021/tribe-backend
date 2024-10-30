// migrations/XXXXXXXXXXXXXX-create-offer.js

'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Offers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tasks',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      taskerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      offerPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      offerMessage: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // Add unique constraint to prevent multiple offers from the same tasker on the same task
    await queryInterface.addConstraint('Offers', {
      fields: ['taskId', 'taskerId'],
      type: 'unique',
      name: 'unique_offer_per_tasker_per_task',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Offers', 'unique_offer_per_tasker_per_task');
    await queryInterface.dropTable('Offers');
  },
};
