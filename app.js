require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes'); 
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const offerRoutes = require('./routes/offerRoutes');
const cancellationRoutes = require('./routes/cancellationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);
app.use('/chats', chatRoutes);
app.use('/auth', authRoutes); 
app.use('/reviews', reviewRoutes);
app.use('/payment', paymentRoutes);
app.use('/offers', offerRoutes);
app.use('/cancellations', cancellationRoutes);
app.use('/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Tribe API');
});

module.exports = app;
