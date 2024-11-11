// scripts/deleteAllUsers.js
require('dotenv').config();
const { sequelize, User, Review, Task, TaskHide, Chat, Message, Offer, Cancellation, Notification } = require('../models');
const admin = require('../firebaseAdmin');
const { Op } = require('sequelize');

async function deleteAllUsers(shouldSoftDelete = true) {
    try {
        console.log('Testing database connection...');
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        const transaction = await sequelize.transaction();
        
        try {
            console.log('Starting user deletion process...');
            console.log(`Mode: ${shouldSoftDelete ? 'Soft Delete' : 'Permanent Delete'}`);

            const users = await User.findAll({
                transaction,
                where: shouldSoftDelete ? { isDeleted: false } : {}
            });

            console.log(`Found ${users.length} users to process`);

            for (const user of users) {
                console.log(`\nProcessing user ID: ${user.id}`);

                try {
                    if (user.firebaseUid) {
                        try {
                            await admin.auth().deleteUser(user.firebaseUid);
                            console.log(`Deleted Firebase user: ${user.firebaseUid}`);
                        } catch (firebaseError) {
                            console.log(`Firebase deletion error for user ${user.id}: ${firebaseError.message}`);
                        }
                    }

                    if (shouldSoftDelete) {
                        await User.update(
                            {
                                email: null,
                                firstName: 'Deleted',
                                lastName: 'User',
                                firebaseUid: null,
                                about: null,
                                location: null,
                                experience: null,
                                age: null,
                                gender: null,
                                profilePhotoUrl: null,
                                pushToken: null,
                                fcmToken: null,
                                stripeCustomerId: null,
                                isDeleted: true,
                                deletedAt: new Date()
                            },
                            {
                                where: { id: user.id },
                                transaction
                            }
                        );
                        console.log(`Soft deleted user ${user.id}`);
                    } else {
                        // First, find all chats the user is involved in
                        console.log(`Finding chats for user ${user.id}...`);
                        const userChats = await Chat.findAll({
                            where: {
                                [Op.or]: [
                                    { requesterId: user.id },
                                    { taskerId: user.id }
                                ]
                            },
                            transaction
                        });

                        // Delete messages for each chat
                        console.log(`Deleting messages for user ${user.id}...`);
                        for (const chat of userChats) {
                            await Message.destroy({
                                where: { chatId: chat.id },
                                transaction
                            });
                        }

                        // Now delete the chats
                        console.log(`Deleting chats for user ${user.id}...`);
                        await Chat.destroy({
                            where: {
                                [Op.or]: [
                                    { requesterId: user.id },
                                    { taskerId: user.id }
                                ]
                            },
                            transaction
                        });

                        // Delete notifications
                        console.log(`Deleting notifications for user ${user.id}...`);
                        await Notification.destroy({
                            where: { userId: user.id },
                            transaction
                        });

                        // Delete reviews
                        console.log(`Deleting reviews for user ${user.id}...`);
                        await Review.destroy({
                            where: {
                                [Op.or]: [
                                    { reviewerId: user.id },
                                    { reviewedUserId: user.id }
                                ]
                            },
                            transaction
                        });

                        // Delete offers
                        console.log(`Deleting offers for user ${user.id}...`);
                        await Offer.destroy({
                            where: { taskerId: user.id },
                            transaction
                        });

                        // Delete cancellations
                        console.log(`Deleting cancellations for user ${user.id}...`);
                        await Cancellation.destroy({
                            where: { canceledByUserId: user.id },
                            transaction
                        });

                        // Delete TaskHide entries
                        console.log(`Deleting task hide entries for user ${user.id}...`);
                        await TaskHide.destroy({
                            where: { userId: user.id },
                            transaction
                        });

                        // Delete tasks
                        console.log(`Deleting tasks for user ${user.id}...`);
                        await Task.destroy({
                            where: {
                                [Op.or]: [
                                    { userId: user.id },
                                    { taskerAcceptedId: user.id }
                                ]
                            },
                            transaction
                        });

                        // Finally delete the user
                        console.log(`Deleting user ${user.id}...`);
                        await User.destroy({
                            where: { id: user.id },
                            transaction
                        });

                        console.log(`Successfully deleted user ${user.id} and all related records`);
                    }
                } catch (error) {
                    console.error(`Error processing user ${user.id}:`, error);
                    throw error;
                }
            }

            await transaction.commit();
            console.log('\nUser deletion process completed successfully');

        } catch (error) {
            console.error('Error during deletion process:', error);
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Database connection or processing error:', error);
        throw error;
    } finally {
        try {
            await sequelize.close();
            console.log('Database connection closed.');
        } catch (error) {
            console.error('Error closing database connection:', error);
        }
    }
}

// Add safety confirmation with countdown
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

if (require.main === module) {
    const SOFT_DELETE = false;

    console.log('Starting script...');
    console.log('\n=== WARNING ===');
    console.log('This will PERMANENTLY DELETE all users and their related data!');
    console.log('This includes:');
    console.log('- All user profiles');
    console.log('- All messages and chats');
    console.log('- All reviews');
    console.log('- All tasks and offers');
    console.log('- All notifications');
    console.log('This action CANNOT be undone!\n');
    
    readline.question(
        `Type 'DELETE ALL USERS' to confirm: `, 
        async (answer) => {
            if (answer === 'DELETE ALL USERS') {
                console.log('\nStarting deletion in 5 seconds...');
                console.log('Press Ctrl+C to cancel');
                
                setTimeout(async () => {
                    try {
                        await deleteAllUsers(SOFT_DELETE);
                        console.log('Script completed successfully');
                        process.exit(0);
                    } catch (error) {
                        console.error('Script failed:', error);
                        process.exit(1);
                    }
                }, 5000);
            } else {
                console.log('Operation cancelled - Incorrect confirmation phrase');
                process.exit(0);
            }
            readline.close();
        }
    );
}

module.exports = deleteAllUsers;