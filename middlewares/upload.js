// middlewares/upload.js

const multer = require('multer');

// Set storage to memory storage
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only JPEG and PNG images are allowed'));
    }
};

// Multer instance for profile photos
const uploadProfilePhoto = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter: fileFilter,
});

// Multer instance for task photos
const uploadTaskPhotos = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter: fileFilter,
});

module.exports = { uploadProfilePhoto, uploadTaskPhotos };
