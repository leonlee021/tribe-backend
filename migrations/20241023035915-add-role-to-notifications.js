'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Notifications', 'role', {
      type: Sequelize.ENUM('requester', 'tasker'),
      allowNull: false,
      defaultValue: 'requester', // Set a default or handle existing data accordingly
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Notifications', 'role');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Notifications_role";');
  }
};
