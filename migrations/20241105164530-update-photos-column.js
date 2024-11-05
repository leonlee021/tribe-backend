'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check current table structure
    const tableInfo = await queryInterface.describeTable('Tasks');

    // 1. Remove 'photoUrl' column if it exists
    if (tableInfo.photoUrl) {
      await queryInterface.removeColumn('Tasks', 'photoUrl');
    }

    // 2. Remove 'photos_temp' column if it exists
    if (tableInfo.photos_temp) {
      await queryInterface.removeColumn('Tasks', 'photos_temp');
    }

    // 3. Alter 'photos' column to TEXT[] and migrate data
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Create a temporary column to hold TEXT[] data using raw SQL
      await queryInterface.sequelize.query(`
        ALTER TABLE "Tasks"
        ADD COLUMN "photos_temp" TEXT[];
      `, { transaction });

      // Migrate data from 'photos' JSON column to 'photos_temp' TEXT[] column
      await queryInterface.sequelize.query(`
        UPDATE "Tasks"
        SET "photos_temp" = ARRAY(
          SELECT json_array_elements_text("photos")
        )
        WHERE "photos" IS NOT NULL;
      `, { transaction });

      // Drop the old 'photos' column
      await queryInterface.removeColumn('Tasks', 'photos', { transaction });

      // Rename 'photos_temp' to 'photos'
      await queryInterface.renameColumn('Tasks', 'photos_temp', 'photos', { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert 'photos' column back to JSON
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Create a temporary column to hold JSON data
      await queryInterface.sequelize.query(`
        ALTER TABLE "Tasks"
        ADD COLUMN "photos_temp" JSON;
      `, { transaction });

      // Migrate data from 'photos' TEXT[] column to 'photos_temp' JSON column
      await queryInterface.sequelize.query(`
        UPDATE "Tasks"
        SET "photos_temp" = to_jsonb("photos")
        WHERE "photos" IS NOT NULL;
      `, { transaction });

      // Drop the 'photos' column
      await queryInterface.removeColumn('Tasks', 'photos', { transaction });

      // Rename 'photos_temp' back to 'photos'
      await queryInterface.renameColumn('Tasks', 'photos_temp', 'photos', { transaction });
    });
  },
};
