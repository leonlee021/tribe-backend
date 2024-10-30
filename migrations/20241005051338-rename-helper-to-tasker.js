'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Tasks', 'helperAcceptedId', 'taskerAcceptedId');
    // If you renamed 'helperUsername' to 'taskerUsername', include:
    await queryInterface.renameColumn('Tasks', 'helperUsername', 'taskerUsername');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Tasks', 'taskerAcceptedId', 'helperAcceptedId');
    // If you renamed 'taskerUsername' back to 'helperUsername', include:
    await queryInterface.renameColumn('Tasks', 'taskerUsername', 'helperUsername');
  }
};
