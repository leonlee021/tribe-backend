'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {
      Chat.belongsTo(models.User, { as: 'requester', foreignKey: 'requesterId' });
      Chat.belongsTo(models.User, { as: 'tasker', foreignKey: 'taskerId' });
      Chat.belongsTo(models.Task, { foreignKey: 'taskId', onDelete: 'CASCADE'}); // Add onDelete: 'CASCADE'
      Chat.hasMany(models.Message, { foreignKey: 'chatId' });
      Chat.hasMany(models.Review, { as: 'reviews', foreignKey: 'chatId' });
      Chat.belongsTo(models.Offer, { foreignKey: 'offerId', as: 'offer' });
    }
    
  }
  Chat.init({
    requesterId: DataTypes.INTEGER,
    taskerId: DataTypes.INTEGER,
    taskId: DataTypes.INTEGER,
    offerId: DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending' // 'pending', 'active', 'completed', 'declined'
  }
  }, {
    sequelize,
    modelName: 'Chat',
    indexes: [
      {
          unique: true,
          fields: ['taskId', 'requesterId', 'taskerId']
      }
    ],
  });
  return Chat;
};