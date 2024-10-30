module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'firebaseUid', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'firebaseUid', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false
    });
  }
};
