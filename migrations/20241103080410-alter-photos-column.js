'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the photos_temp column already exists
    const tableInfo = await queryInterface.describeTable('Tasks');
    
    if (!tableInfo.photos_temp) {
      // Step 1: Add a new temporary column for photos with ARRAY(TEXT) type
      await queryInterface.addColumn('Tasks', 'photos_temp', {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      });
    }

    // Step 2: Fetch all task records
    const tasks = await queryInterface.sequelize.query(
      `SELECT id, photos FROM "Tasks";`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Step 3: Loop through each task to migrate data
    for (const task of tasks) {
      if (task.photos) {
        const photosArray = task.photos.map(photo => `'${photo}'`).join(','); // Convert to string format for SQL
        await queryInterface.sequelize.query(
          `UPDATE "Tasks" SET "photos_temp" = ARRAY[${photosArray}]::text[] WHERE "id" = ${task.id};`,
          { type: Sequelize.QueryTypes.UPDATE }
        );
      }
    }

    // Step 4: Drop the original 'photos' column
    await queryInterface.removeColumn('Tasks', 'photos');

    // Step 5: Rename 'photos_temp' to 'photos'
    await queryInterface.renameColumn('Tasks', 'photos_temp', 'photos');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the 'photos' column to JSON type
    const tableInfo = await queryInterface.describeTable('Tasks');

    if (!tableInfo.photos_temp) {
      await queryInterface.addColumn('Tasks', 'photos_temp', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    }

    const tasks = await queryInterface.sequelize.query(
      `SELECT id, photos FROM "Tasks";`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const task of tasks) {
      if (task.photos) {
        const photosJson = JSON.stringify(task.photos);
        await queryInterface.sequelize.query(
          `UPDATE "Tasks" SET "photos_temp" = :photosJson WHERE "id" = :id;`,
          {
            replacements: { photosJson, id: task.id },
            type: Sequelize.QueryTypes.UPDATE,
          }
        );
      }
    }

    await queryInterface.removeColumn('Tasks', 'photos');
    await queryInterface.renameColumn('Tasks', 'photos_temp', 'photos');
  }
};
