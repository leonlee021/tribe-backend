require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { admin, initializeFirebaseAdmin } = require('./config/firebaseAdmin');

initializeFirebaseAdmin();
// Initialize Firebase Admin SDK
// try {
//   const serviceAccount = require('./mutually-39428-firebase-adminsdk-eueyz-bdf692c84f.json');
  
//   if (!admin.apps.length) {
//       admin.initializeApp({
//           credential: admin.credential.cert(serviceAccount),
//           projectId: 'mutually-39428'
//       });
//       console.log('Firebase Admin SDK initialized successfully');
//   }
// } catch (error) {
//   console.error('Error initializing Firebase Admin SDK:', error);
// }


const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const offerRoutes = require('./routes/offerRoutes');
const cancellationRoutes = require('./routes/cancellationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

const allowedOrigins = ['exp://localhost:19000', 'your-production-app-url']; // Add your Expo app URL

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);
app.use('/chats', chatRoutes);
app.use('/reviews', reviewRoutes);
app.use('/payment', paymentRoutes);
app.use('/offers', offerRoutes);
app.use('/cancellations', cancellationRoutes);
app.use('/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Tribe API');
});

app.get('/test-db', async (req, res) => {
    try {
      await db.sequelize.authenticate();
      res.status(200).send('Database connection successful.');
    } catch (error) {
      console.error('Database connection failed:', error);
      res.status(500).send('Database connection failed.');
    }
  });

module.exports = app;
