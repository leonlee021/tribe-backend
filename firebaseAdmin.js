const admin = require('firebase-admin');
const serviceAccount = require('./mutually-39428-firebase-adminsdk-eueyz-bdf692c84f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
