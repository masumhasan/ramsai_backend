"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const s3_service_1 = require("../services/s3.service");
/**
 * Handle image upload to AWS S3
 */
const uploadImage = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, message: 'No image file provided' });
            return;
        }
        if (!file.mimetype.startsWith('image/')) {
            res.status(400).json({ success: false, message: 'Uploaded file must be an image' });
            return;
        }
        const folder = req.body.folder || 'broadcasts';
        const s3Url = await (0, s3_service_1.uploadFileToS3)(file.buffer, file.originalname, file.mimetype, folder);
        res.status(200).json({
            success: true,
            message: 'Image successfully uploaded to AWS S3 bucket',
            data: {
                url: s3Url,
                filename: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
            },
        });
    }
    catch (error) {
        console.error('Error uploading image to AWS S3:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image to AWS S3',
            error: error.message,
        });
    }
};
exports.uploadImage = uploadImage;
