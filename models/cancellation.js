// models/cancellation.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cancellation extends Model {
    static associate(models) {
      Cancellation.belongsTo(models.Task, {
        foreignKey: 'taskId',
        as: 'task',
        onDelete: 'CASCADE',
      });
      Cancellation.belongsTo(models.User, {
        foreignKey: 'canceledByUserId',
        as: 'canceledByUser',
        onDelete: 'SET NULL',
      });
    }
  }

  Cancellation.init({
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    canceledByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    canceledByRole: { // 'requester' or 'tasker'
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['requester', 'tasker']],
          msg: "canceledByRole must be 'requester' or 'tasker'",
        }
      }
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Cancellation',
    tableName: 'Cancellations',
    paranoid: false,
    timestamps: true,
  });

  return Cancellation;
};
