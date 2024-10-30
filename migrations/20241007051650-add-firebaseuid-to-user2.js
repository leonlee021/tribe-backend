module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'firebaseUid', {
      type: Sequelize.STRING,
      allowNull: false, // Do not allow null values
      defaultValue: '', // You can set a default value like an empty string or any other value
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'firebaseUid');
  }
};
