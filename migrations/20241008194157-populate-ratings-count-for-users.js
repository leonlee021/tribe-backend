'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Raw query to update ratingsCount based on existing reviews
    await queryInterface.sequelize.query(`
      UPDATE "Users" u
      SET "ratingsCount" = sub.count
      FROM (
        SELECT "reviewedUserId", COUNT(*) as count
        FROM "Reviews"
        GROUP BY "reviewedUserId"
      ) sub
      WHERE u.id = sub."reviewedUserId";
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Optionally, reset ratingsCount to 0
    await queryInterface.sequelize.query(`
      UPDATE "Users"
      SET "ratingsCount" = 0;
    `);
  }
};
