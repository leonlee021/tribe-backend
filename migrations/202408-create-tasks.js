'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tasks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      taskName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      postContent: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      locationDependent: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      taskerUsername: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      appliedByCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      taskerAcceptedId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'open',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      chatId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Chats',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      photos: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Tasks');
  }
};
