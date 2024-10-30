// updatePasswords.js

const { User } = require('../models');  // Adjust the path to your models file
const bcrypt = require('bcrypt');

const updatePasswords = async () => {
    try {
        const users = await User.findAll();
        for (let user of users) {
            const hashedPassword = bcrypt.hashSync(user.password, 10);
            user.password = hashedPassword;
            await user.save();
            console.log(`Updated password for user with ID: ${user.id}`);
        }
        console.log('All passwords have been hashed and updated.');
    } catch (error) {
        console.error('Error updating passwords:', error);
    }
};

// Run the function
updatePasswords();
