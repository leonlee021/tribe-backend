'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Notifications', 'type', {
      type: Sequelize.ENUM('activity', 'chat'),
      allowNull: false,
      defaultValue: 'activity', // You can choose an appropriate default if needed
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Notifications', 'type');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Notifications_type";'); // Drop ENUM type if not used elsewhere
  }
};
