const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User, { as: 'reviewer', foreignKey: 'reviewerId' });
      Review.belongsTo(models.User, { as: 'reviewedUser', foreignKey: 'reviewedUserId' });
      Review.belongsTo(models.Chat, { foreignKey: 'chatId', as: 'chat' });
    }
  }

  Review.init({
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Rating must be at least 1',
        },
        max: {
          args: [5],
          msg: 'Rating cannot exceed 5',
        },
      },
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reviewedUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Review',
    hooks: {
      afterCreate: async (review, options) => {
        await updateUserRatingAndCount(review.reviewedUserId, sequelize);
      },
      afterUpdate: async (review, options) => {
        await updateUserRatingAndCount(review.reviewedUserId, sequelize);
      },
      afterDestroy: async (review, options) => {
        await updateUserRatingAndCount(review.reviewedUserId, sequelize);
      },
    },
  });

  // Helper function to update averageRating and ratingsCount
  const updateUserRatingAndCount = async (userId, sequelizeInstance) => {
    const { Review, User } = sequelizeInstance.models;

    // Calculate the new average rating and ratings count
    const result = await Review.findAll({
      where: { reviewedUserId: userId },
      attributes: [
        [sequelizeInstance.fn('AVG', sequelizeInstance.col('rating')), 'avgRating'],
        [sequelizeInstance.fn('COUNT', sequelizeInstance.col('id')), 'ratingsCount']
      ],
      raw: true,
    });

    const avgRating = result[0].avgRating ? parseFloat(result[0].avgRating).toFixed(1) : null;
    const ratingsCount = result[0].ratingsCount ? parseInt(result[0].ratingsCount, 10) : 0;

    // Update the User's averageRating and ratingsCount
    await User.update(
      { averageRating: avgRating, ratingsCount: ratingsCount },
      { where: { id: userId } }
    );
  };

  return Review;
};
