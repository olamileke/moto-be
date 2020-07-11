const multer_package = require('multer');
const path = require('path');

const fileStorage = multer_package.diskStorage({
    destination: (req, file, cb) => {
        const url = req.url;

        if(url.includes('vehicles')) {
            cb(null, path.join('images', 'vehicles'))
        }

        if(url.includes('users')) {
            cb(null, path.join('images', 'users'))
        }
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    const mimeType = file.mimetype.toLowerCase();
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

    if(!allowedTypes.includes(mimeType)) {
        return cb(null, false);
    }

    return cb(null, true);
}

const multer = multer_package({ storage:fileStorage, fileFilter:fileFilter }).single('image');

module.exports = multer;
