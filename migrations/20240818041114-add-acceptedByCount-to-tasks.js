'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'acceptedByCount', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });

    await queryInterface.addColumn('Tasks', 'helperAcceptedId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('Tasks', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'open',
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tasks', 'acceptedByCount');
    await queryInterface.removeColumn('Tasks', 'helperAcceptedId');
    await queryInterface.removeColumn('Tasks', 'status');
  }
};
