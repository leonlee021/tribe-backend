module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'photos', {
      type: Sequelize.JSON, // Store multiple photo URLs as JSON
      allowNull: true,      // Optional: not every task will have photos
    });
    
    await queryInterface.removeColumn('Tasks', 'photoUrl');  // Remove the old photoUrl field
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'photoUrl', {
      type: Sequelize.STRING,
      allowNull: true,      // Optional: not every task will have a photo
    });

    await queryInterface.removeColumn('Tasks', 'photos');  // Remove the new photos field
  }
};
