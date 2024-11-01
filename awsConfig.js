// awsConfig.js

const AWS = require('aws-sdk');

// Configure AWS with your access and secret key.
const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
};

// Initialize the S3 instance
const s3 = new AWS.S3(awsConfig);

module.exports = s3;
