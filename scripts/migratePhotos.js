// scripts/migratePhotos.js

const { Task } = require('../models'); // Ensure correct path
const { Op } = require('sequelize');

const migratePhotos = async () => {
    try {
        // Fetch all tasks
        const tasks = await Task.findAll();

        for (const task of tasks) {
            // Ensure task.photos is an array
            if (!Array.isArray(task.photos)) {
                console.warn(`Task ID ${task.id} has invalid photos data.`);
                continue;
            }

            // Extract S3 object keys from pre-signed URLs
            const photoKeys = task.photos.map(url => {
                try {
                    const parsedUrl = new URL(url);
                    const pathname = parsedUrl.pathname; // e.g., /task_photos/user123/uuid1.jpg
                    return decodeURIComponent(pathname.substring(1)); // Remove leading '/'
                } catch (e) {
                    console.error(`Invalid URL for Task ID ${task.id}: ${url}`);
                    return null; // Exclude invalid URLs
                }
            }).filter(key => key !== null); // Remove nulls from the array

            if (photoKeys.length === 0) {
                console.warn(`Task ID ${task.id} has no valid photo keys after migration.`);
                continue;
            }

            // Enforce maximum of 5 photos per task
            if (photoKeys.length > 5) {
                console.warn(`Task ID ${task.id} has more than 5 photos. Truncating to first 5.`);
                photoKeys.length = 5; // Keep only first 5 photos
            }

            // Update the task with the array of S3 object keys
            await task.update({
                photos: photoKeys, // Set as array, not JSON string
                updatedAt: new Date(),
            });

            console.log(`Task ID ${task.id} photos updated successfully.`);
        }

        console.log('Photo migration completed successfully.');
    } catch (error) {
        console.error('Error during photo migration:', error);
    }
};

migratePhotos();
