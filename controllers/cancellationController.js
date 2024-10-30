// controllers/cancellationController.js
const { Cancellation } = require('../models');

// Fetch cancellations where the tasker canceled the task
exports.getCancellationsByTasker = async (req, res) => {
  const { userId } = req.params;
  try {
    const cancellations = await Cancellation.findAll({
      where: {
        canceledByUserId: userId,
        canceledByRole: 'tasker', // Filter by tasker role
      },
    });
    res.status(200).json({ cancellations });
  } catch (error) {
    console.error('Error fetching cancellations by tasker:', error);
    res.status(500).json({ error: 'Failed to fetch cancellations by tasker.' });
  }
};
