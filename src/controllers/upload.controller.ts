import { Request, Response } from 'express';
import { uploadFileToS3 } from '../services/s3.service';

/**
 * Handle image upload to AWS S3
 */
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
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

    const folder = (req.body.folder as string) || 'broadcasts';
    const s3Url = await uploadFileToS3(file.buffer, file.originalname, file.mimetype, folder);

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
  } catch (error: any) {
    console.error('Error uploading image to AWS S3:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image to AWS S3',
      error: error.message,
    });
  }
};
