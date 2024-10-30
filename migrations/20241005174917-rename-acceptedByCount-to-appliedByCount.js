// migrations/XXXXXXXXXXXXXX-rename-acceptedByCount-to-appliedByCount.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Tasks', 'acceptedByCount', 'appliedByCount');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Tasks', 'appliedByCount', 'acceptedByCount');
  },
};
