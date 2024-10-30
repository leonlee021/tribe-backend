'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Chat, { foreignKey: 'chatId', onDelete: 'CASCADE' });
      Message.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId', onDelete: 'CASCADE' });
    }
  }

  Message.init({
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Message',
  });

  return Message;
};
