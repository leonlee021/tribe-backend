const { User, Task } = require('../models'); // Assuming User and Task models are set up
const { Op } = require('sequelize');

async function updateProfilePhotoUrls(oldBaseUrl, newBaseUrl) {
    try {
        // Update User profilePhotoUrls
        const users = await User.findAll({
            where: {
                profilePhotoUrl: {
                    [Op.like]: `${oldBaseUrl}%`
                }
            }
        });

        // Update each user's profilePhotoUrl
        for (let user of users) {
            const updatedUrl = user.profilePhotoUrl.replace(oldBaseUrl, newBaseUrl);
            user.profilePhotoUrl = updatedUrl;
            await user.save();
        }
        console.log(`${users.length} user profile photos updated successfully.`);

        // Update Task photos
        const tasks = await Task.findAll({
            where: {
                photos: {
                    [Op.ne]: null, // Ensure tasks have photos
                }
            }
        });

        // Update each task's photos
        for (let task of tasks) {
            let updatedPhotos = task.photos.map(photoUrl => {
                if (photoUrl.startsWith(oldBaseUrl)) {
                    return photoUrl.replace(oldBaseUrl, newBaseUrl);
                }
                return photoUrl; // Leave unchanged if it doesn't match the old base URL
            });
            
            task.photos = updatedPhotos;
            await task.save();
        }
        console.log(`${tasks.length} tasks' photos updated successfully.`);
    } catch (error) {
        console.error('Error updating photo URLs:', error);
    }
}

// Example usage
updateProfilePhotoUrls('http://192.168.2.247', 'http://192.168.0.108');
//updateProfilePhotoUrls('http://192.168.0.108', 'http://192.168.2.247');