'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Add a new temporary column for photos with ARRAY(TEXT) type
    await queryInterface.addColumn('Tasks', 'photos_temp', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });

    // Step 2: Copy data from JSON `photos` column to ARRAY `photos_temp`
    const tasks = await queryInterface.sequelize.query(
      `SELECT id, photos FROM "Tasks";`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const task of tasks) {
      if (task.photos) {
        const photosArray = task.photos.map(photo => photo); // Assuming `photos` is already an array of strings
        await queryInterface.sequelize.query(
          `UPDATE "Tasks" SET "photos_temp" = :photosArray WHERE id = :id;`,
          { replacements: { photosArray, id: task.id } }
        );
      }
    }

    // Step 3: Drop the original 'photos' column
    await queryInterface.removeColumn('Tasks', 'photos');

    // Step 4: Rename 'photos_temp' to 'photos'
    await queryInterface.renameColumn('Tasks', 'photos_temp', 'photos');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to JSON column type if needed
    await queryInterface.addColumn('Tasks', 'photos_temp', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    const tasks = await queryInterface.sequelize.query(
      `SELECT id, photos FROM "Tasks";`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const task of tasks) {
      if (task.photos) {
        const photosJson = JSON.stringify(task.photos);
        await queryInterface.sequelize.query(
          `UPDATE "Tasks" SET "photos_temp" = :photosJson WHERE id = :id;`,
          { replacements: { photosJson, id: task.id } }
        );
      }
    }

    await queryInterface.removeColumn('Tasks', 'photos');
    await queryInterface.renameColumn('Tasks', 'photos_temp', 'photos');
  }
};
