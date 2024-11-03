// scripts/migratePhotos.js
require('dotenv').config(); 
const { Task } = require('../models'); // Adjust path accordingly
const url = require('url');

const bucketUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

const migratePhotos = async () => {
    try {
        const tasks = await Task.findAll();

        for (const task of tasks) {
            if (Array.isArray(task.photos)) {
                const objectKeys = task.photos.map(photoUrl => {
                    // Extract the path after the bucket URL
                    if (photoUrl.startsWith(bucketUrl)) {
                        return photoUrl.replace(bucketUrl, '');
                    }
                    // Handle different URL formats if necessary
                    return null;
                }).filter(key => key !== null);

                await task.update({ photos: objectKeys });
            }
        }

        console.log('Photo migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error during photo migration:', error);
        process.exit(1);
    }
};

migratePhotos();
