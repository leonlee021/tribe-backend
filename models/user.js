'use strict';
const bcrypt = require('bcrypt');
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Task, {
        foreignKey: 'userId',
        as: 'requestedTasks',  // Changed from 'tasks' to be more specific
        onDelete: 'CASCADE',
      });
      User.hasMany(models.Task, {
        foreignKey: 'taskerAcceptedId',
        as: 'assignedTasks',
        onDelete: 'CASCADE',
      });
      User.hasMany(models.Chat, { as: 'requestedChats', foreignKey: 'requesterId' });
      User.hasMany(models.Chat, { as: 'taskedChats', foreignKey: 'taskerId' });
      User.hasMany(models.Message, { as: 'messages', foreignKey: 'senderId' });
      User.hasMany(models.Review, { as: 'reviewsReceived', foreignKey: 'reviewedUserId' });
      User.hasMany(models.Review, { as: 'reviewsGiven', foreignKey: 'reviewerId' });
      User.hasMany(models.TaskHide, {
        foreignKey: 'userId',
        as: 'hiddenTasks',
        onDelete: 'CASCADE',
      });
      User.hasMany(models.Offer, {
        foreignKey: 'taskerId',
        as: 'offers',
        onDelete: 'CASCADE',
      });
      User.hasMany(models.Cancellation, { // Corrected association
        foreignKey: 'canceledByUserId',   // Match the foreign key in Cancellation model
        as: 'cancellations',               // Meaningful alias
        onDelete: 'CASCADE',
      });
      User.hasMany(models.Notification, {
        foreignKey: 'userId',
        as: 'notifications',
        onDelete: 'CASCADE',
      });
    }
  }

  User.init({
    id: { // Add this field
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "First name must not be empty"
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Last name must not be empty"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: {
          msg: "Must be a valid email address"
        },
        notEmpty: {
          msg: "Email must not be empty"
        }
      }
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePhotoUrl: {
      type: DataTypes.TEXT, // Updated from STRING(255) to TEXT
      allowNull: true,      // Adjust based on your requirements
    },
    stripeCustomerId: DataTypes.STRING, 
    averageRating: {
      type: DataTypes.DECIMAL(2, 1), // e.g., 4.50
      allowNull: true,
      defaultValue: null,
    },
    ratingsCount: { // New field
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    firebaseUid: {  // Add Firebase UID to link with Firebase Auth
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    pushToken: {
      type: DataTypes.STRING,
      allowNull: true, // It's optional because the user may not have granted permissions
    },
    fcmToken: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Firebase Cloud Messaging token for push notifications'
    },
    devicePlatform: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'ios'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};
