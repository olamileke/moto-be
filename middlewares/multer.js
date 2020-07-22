const multer_package = require('multer');
const path = require('path');

// cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);

const fileFilter = (req, file, cb) => {
    const mimeType = file.mimetype.toLowerCase();
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

    if(!allowedTypes.includes(mimeType)) {
        return cb(null, false);
    }

    return cb(null, true);
}

const storage = multer_package.memoryStorage();
const multer = multer_package({ storage:storage, fileFilter:fileFilter }).single('image');

module.exports = multer;
