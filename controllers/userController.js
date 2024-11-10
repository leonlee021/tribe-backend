// controllers/userController.js

const { User, Review, TaskHide, Task, sequelize } = require('../models');  // Import sequelize
const bcrypt = require('bcrypt');
const path = require('path');
const admin = require('../firebaseAdmin');
const getAuthenticatedUserId = require('../utils/getAuthenticatedUserId'); // Import the utility function
const s3 = require('../awsConfig'); // AWS S3 instance
const { v4: uuidv4 } = require('uuid'); // For unique filenames

// Create or Update User Profile
exports.createOrUpdateUser = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const { uid, email } = req.user; // Retrieved from authenticateToken middleware

        // Input Validation
        if (!firstName || !lastName) {
            console.warn('Missing firstName or lastName in request body');
            return res.status(400).json({ error: 'First name and last name are required.' });
        }

        // Find the user in the database
        let user = await User.findOne({ where: { firebaseUid: uid } });

        if (!user) {
            // If user doesn't exist, create a new user
            user = await User.create({
                firebaseUid: uid,
                email,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                // ... any other fields as necessary
            });
            console.log(`User created with UID: ${uid}`);
            return res.status(201).json({ message: 'User profile created successfully', user });
        }

        // If user exists, update the profile
        user.firstName = firstName.trim();
        user.lastName = lastName.trim();
        await user.save();

        console.log(`User profile updated for UID: ${uid}`);
        return res.status(200).json({ message: 'User profile updated successfully', user });
    } catch (error) {
        console.error('Error creating/updating user profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Get All Users (Consider Protecting This Route)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePhotoUrl'],
            include: [
                {
                    model: Review,
                    as: 'reviewsReceived',
                    include: [
                        {
                            model: User,
                            as: 'reviewer',
                            attributes: ['firstName', 'lastName'],
                        },
                    ],
                },
            ],
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get Authenticated User Profile
exports.getUserProfile = async (req, res) => {
    try {
        const userId = await getAuthenticatedUserId(req);

        if (!userId) {
            console.error('Authenticated user ID is missing.');
            return res.status(401).json({ error: 'User authentication required.' });
        }

        const userProfile = await User.findOne({
            where: { id: userId },
            attributes: [
                'id', 'firstName', 'lastName', 'email', 'about', 'location', 
                'experience', 'age', 'gender', 'profilePhotoUrl', 'stripeCustomerId',
                'averageRating', 'ratingsCount', 'createdAt', 'updatedAt'
            ],
            include: [
                {
                    model: Review,
                    as: 'reviewsReceived',
                    include: [
                        {
                            model: User,
                            as: 'reviewer',
                            attributes: ['firstName', 'lastName'],
                        },
                    ],
                },
            ],
        });

        if (!userProfile) {
            console.error('User profile not found:', userId);
            return res.status(404).json({ error: 'User profile not found' });
        }

        // Generate a pre-signed URL for the profile photo if it exists
        if (userProfile.profilePhotoUrl) {
            const photoUrl = s3.getSignedUrl('getObject', {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: userProfile.profilePhotoUrl,
                Expires: 60 * 60 * 24, // 24 hours
            });
            userProfile.profilePhotoUrl = photoUrl;
        }

        res.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get User Profile by ID
exports.getUserProfileById = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await User.findByPk(userId, {
            attributes: [
                'id', 'firstName', 'lastName', 'about', 'location', 
                'experience', 'age', 'gender', 'averageRating', 'ratingsCount', 
                'profilePhotoUrl'
            ],
            include: [
                {
                    model: Review,
                    as: 'reviewsReceived',
                    include: [
                        {
                            model: User,
                            as: 'reviewer',
                            attributes: ['firstName', 'lastName'],
                        },
                    ],
                },
            ],
        });

        if (!user) {
            console.error('User not found with ID:', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a pre-signed URL for the profile photo if it exists
        if (user.profilePhotoUrl) {
            const photoUrl = s3.getSignedUrl('getObject', {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: user.profilePhotoUrl,
                Expires: 60 * 60 * 24, // 24 hours
            });
            user.profilePhotoUrl = photoUrl;
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile by ID:', error);
        res.status(500).json({ error: error.message });
    }
};


// Update Authenticated User Profile
exports.updateUserProfile = async (req, res) => {
    try {
        // Fetch the authenticated user's ID
        const userId = await getAuthenticatedUserId(req);

        if (!userId) {
            console.error('Authenticated user ID is missing.');
            return res.status(401).json({ error: 'User authentication required.' });
        }

        const { about, location, experience, age, gender } = req.body;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update fields if they are provided in the request
        user.about = about !== undefined ? about : user.about;
        user.location = location !== undefined ? location : user.location;
        user.experience = experience !== undefined ? experience : user.experience;
        user.age = age !== undefined ? age : user.age;
        user.gender = gender !== undefined ? gender : user.gender;

        await user.save();

        res.json({
            message: 'User profile updated successfully',
            user,
        });
    } catch (error) {
        console.error('Error updating user profile:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Upload Profile Photo for Authenticated User
// Upload Profile Photo for Authenticated User
exports.uploadProfilePhoto = async (req, res) => {
    try {
        const userId = await getAuthenticatedUserId(req);

        if (!userId) {
            console.error('Authenticated user ID is missing.');
            return res.status(401).json({ error: 'User authentication required.' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `profile_photos/${userId}/${uuidv4()}.${fileExtension}`;

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        s3.upload(params, async (err, data) => {
            if (err) {
                console.error('Error uploading to S3:', err);
                return res.status(500).json({ error: 'Error uploading file' });
            }

            // Update the user's profilePhotoUrl with the S3 object key, not a pre-signed URL
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            user.profilePhotoUrl = fileName; // Store S3 key
            await user.save();

            res.status(200).json({ message: 'Profile photo uploaded successfully.' });
        });
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Delete Authenticated User Account
// exports.deleteUserAccount = async (req, res) => {
//     try {
//         // Fetch the authenticated user's ID
//         const userId = await getAuthenticatedUserId(req);

//         if (!userId) {
//             console.error('Authenticated user ID is missing.');
//             return res.status(401).json({ error: 'User authentication required.' });
//         }

//         const user = await User.findByPk(userId);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         await user.destroy();
//         res.status(200).json({ message: 'User account deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting account:', error);
//         res.status(500).json({ error: 'Unable to delete account' });
//     }
// };

// Delete Account and Hide User's Tasks
exports.deleteAccount = async (req, res) => {
    try {
        // Fetch the authenticated user's ID
        const userId = await getAuthenticatedUserId(req);

        if (!userId) {
            console.error('Authenticated user ID is missing.');
            return res.status(401).json({ error: 'User authentication required.' });
        }

        // Start a transaction
        const transaction = await sequelize.transaction();

        try {
            // Find the user first
            const user = await User.findByPk(userId, { transaction });
            
            if (!user) {
                await transaction.rollback();
                return res.status(404).json({ error: 'User not found.' });
            }

            // Find all tasks created by the user
            const tasks = await Task.findAll({ where: { userId }, transaction });

            // Prepare TaskHide entries to hide all tasks created by the user
            const hideEntries = tasks.map(task => ({
                taskId: task.id,
                userId: userId,
            }));

            if (hideEntries.length > 0) {
                await TaskHide.bulkCreate(hideEntries, { transaction });
            }

            // If user has a Firebase account, delete it
            if (user.firebaseUid) {
                try {
                    await admin.auth().deleteUser(user.firebaseUid);
                } catch (firebaseError) {
                    console.error('Firebase user deletion error:', firebaseError);
                    // Continue if user doesn't exist in Firebase
                    if (firebaseError.code !== 'auth/user-not-found') {
                        throw firebaseError;
                    }
                }
            }

            // Instead of deleting, update the user record
            await User.update(
                {
                    email: null,
                    name: 'Deleted User',
                    firebaseUid: null,
                    isDeleted: true,
                    deletedAt: new Date(),
                    // Clear any other personal information you might have
                    phoneNumber: null,
                    profilePicture: null,
                    // If you store Firebase tokens, clear them
                    firebaseToken: null,
                    refreshToken: null,
                },
                {
                    where: { id: userId },
                    transaction
                }
            );

            // Commit the transaction
            await transaction.commit();

            // Clear any session cookies
            if (req.session) {
                req.session.destroy();
            }
            res.clearCookie('jwt'); // Adjust based on your auth setup

            res.status(200).json({ message: 'Account deleted successfully' });
        } catch (error) {
            // Rollback the transaction on error
            await transaction.rollback();
            console.error('Transaction error while deleting account:', error);
            res.status(500).json({ error: 'Failed to delete account due to a server error.' });
        }

    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updatePushToken = async (req, res) => {
    try {
      const userId = await getAuthenticatedUserId(req);
  
      if (!userId) {
        console.error('Authenticated user ID is missing.');
        return res.status(401).json({ error: 'User authentication required.' });
      }
  
      const { pushToken } = req.body;
  
      if (!pushToken) {
        return res.status(400).json({ error: 'Push token is required.' });
      }
  
      const user = await User.findByPk(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      user.pushToken = pushToken;
      await user.save();
  
      res.status(200).json({ message: 'Push token updated successfully.' });
    } catch (error) {
      console.error('Error updating push token:', error);
      res.status(500).json({ error: 'Failed to update push token.' });
    }
  };
  