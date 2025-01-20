'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.Task, {
        foreignKey: 'taskId',
        as: 'task',
        onDelete: 'CASCADE',
      });
      Notification.belongsTo(models.User, {
        foreignKey: 'userId', // The user who receives the notification
        as: 'user',
        onDelete: 'CASCADE',
      });
    }
  }

  Notification.init({
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false, // The ID of the user receiving the notification
    },
    message: {
      type: DataTypes.STRING, // 'offer accepted', 'received offer', 'new message'
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('activity', 'chat'), // Add a type field to differentiate notification types
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Mark notification as unread by default
    },
  }, {
    sequelize,
    modelName: 'Notification',
    timestamps: true,
  });

  return Notification;
};
