const { Chat, Message, User, Task, Review } = require('../models');
const { Op } = require('sequelize');
const getAuthenticatedUserId = require('../utils/getAuthenticatedUserId'); // Import the utility function


module.exports = {
  // Submit a new review
  submitReview: async (req, res) => {
      try {
          const { chatId, rating, review } = req.body;

          // Fetch the authenticated user's ID
          const reviewerId = await getAuthenticatedUserId(req);

          if (!reviewerId) {
              console.error('Authenticated user ID is missing.');
              return res.status(401).json({ error: 'User authentication required.' });
          }

          // Validate input fields
          if (!chatId || !rating || !review) {
              return res.status(400).json({ error: 'Chat ID, rating, and review are required.' });
          }

          // Validate rating (assuming rating should be between 1 and 5)
          if (rating < 1 || rating > 5) {
              return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
          }

          // Fetch the chat to get the other user's ID
          const chat = await Chat.findByPk(chatId);

          if (!chat) {
              return res.status(404).json({ error: 'Chat not found.' });
          }

          // Determine the reviewed user (the other participant)
          const reviewedUserId =
              reviewerId === chat.requesterId ? chat.taskerId : chat.requesterId;

          // Prevent users from reviewing themselves
          if (reviewerId === reviewedUserId) {
              return res.status(400).json({ error: 'You cannot review yourself.' });
          }

          // Check if the user has already submitted a review for this chat
          const existingReview = await Review.findOne({
              where: {
                  chatId,
                  reviewerId,
              },
          });

          if (existingReview) {
              return res.status(400).json({ error: 'You have already submitted a review for this chat.' });
          }

          // Check if the chat is completed before allowing a review
          if (chat.status !== 'completed') {
              return res.status(400).json({ error: 'Cannot review a chat that is not completed.' });
          }

          // Create the review
          const newReview = await Review.create({
              rating,
              review,
              reviewerId,
              reviewedUserId,
              chatId,
          });

          res.status(201).json({ message: 'Review submitted successfully.', review: newReview });
      } catch (error) {
          console.error('Error submitting review:', error.message || error);
          res.status(500).json({ error: 'Internal server error.' });
      }
  },
}