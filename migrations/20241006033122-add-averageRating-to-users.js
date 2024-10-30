'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'averageRating', {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: null,
      comment: 'Average rating of the user based on received reviews',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'averageRating');
  }
};
