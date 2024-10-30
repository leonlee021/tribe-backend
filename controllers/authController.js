const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.refreshAuthToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(403).json({ error: 'Refresh token is required' });
    }

    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Check if the refresh token exists in the database
        const user = await User.findByPk(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Generate a new access token
        const newAccessToken = jwt.sign(
            { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Optionally, issue a new refresh token (rotate tokens)
        const newRefreshToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        user.refreshToken = newRefreshToken;
        await user.save();

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
};
