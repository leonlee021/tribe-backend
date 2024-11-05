'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
      });
      Task.belongsTo(models.User, {
        foreignKey: 'taskerAcceptedId',
        as: 'tasker',  
        onDelete: 'SET NULL', 
      });
      Task.belongsTo(models.Chat, {
        as: 'activeChat', // Alias for the active chat
        foreignKey: 'chatId', // Use the chatId field on the Task
        onDelete: 'SET NULL',
      });
      Task.hasMany(models.TaskHide, {
        foreignKey: 'taskId',
        as: 'hiddenByUsers',
        onDelete: 'CASCADE',
      });
      Task.hasMany(models.Offer, {
        foreignKey: 'taskId',
        as: 'offers',
        onDelete: 'CASCADE',
      });
      Task.hasMany(models.Cancellation, { // New association
        foreignKey: 'taskId',
        as: 'cancellations',
        onDelete: 'CASCADE',
      });
      Task.hasMany(models.Notification, {
        foreignKey: 'taskId',
        as: 'notifications',
        onDelete: 'CASCADE',
      });
    }
  }

  Task.init({
    taskName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Task name must not be empty"
        }
      }
    },
    postContent: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Post content must not be empty"
        }
      }
    },
    locationDependent: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        min: {
          args: [5],
          msg: "Price must be at least 5"
        }
      }
    },
    taskerUsername: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    appliedByCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    taskerAcceptedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'open', // can be 'open', 'offered', 'active', or 'completed'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deleted: { // New field to flag soft deletion
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    photos: {  // New field to store multiple photo URLs
      type: DataTypes.ARRAY(DataTypes.TEXT), // Array of S3 object keys
      allowNull: true,      // Optional
      validate: {
        isArrayLengthValid(value) {
          if (value && value.length > 5) {
            throw new Error('Maximum 5 photos are allowed per task.');
          }
        }
      }
    },
    
  }, {
    sequelize,
    modelName: 'Task',
    paranoid: false,
    timestamps: true,
  });

  return Task;
};
