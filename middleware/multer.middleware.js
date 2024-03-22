const fs = require('fs');
const path = require('path');
const multer = require("multer");

// Multer middleware for handling file uploads
const upload = () => {
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                const folderName = req.query.folderName || 'defaultFolder';
                const uploadPath = path.join('bucketFolder', folderName);
                fs.mkdirSync(uploadPath, { recursive: true });
                cb(null, uploadPath);
            },
            filename: function (req, file, cb) {
                cb(null, Date.now() + path.extname(file.originalname));
            }
        }),
        limits: { fileSize: 10000000 }, // Limit file size to 10MB
        fileFilter: function (req, file, cb) {
            cb(null, true); // Accept all files, you can add file type validation here
        }
    });
}

module.exports = upload;
