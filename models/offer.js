// models/Offer.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Offer extends Model {
    static associate(models) {
      // An Offer belongs to a Task
      Offer.belongsTo(models.Task, {
        foreignKey: 'taskId',
        as: 'task',
        onDelete: 'CASCADE',
      });

      // An Offer belongs to a User (Tasker)
      Offer.belongsTo(models.User, {
        foreignKey: 'taskerId',
        as: 'tasker',
        onDelete: 'CASCADE',
      });

      // An Offer has one Chat (if accepted)
      Offer.hasOne(models.Chat, {
        foreignKey: 'offerId',
        as: 'chat',
      });
    }
  }

  Offer.init(
    {
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Tasks',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      taskerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      offerPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          min: 1, // Minimum offer price
        },
      },
      offerMessage: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending', // 'pending', 'accepted', 'declined'
        validate: {
          isIn: [['pending', 'accepted', 'declined', 'cancelled']],
        },
      },
    },
    {
      sequelize,
      modelName: 'Offer',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['taskId', 'taskerId'],
        },
      ],
    }
  );

  return Offer;
};
