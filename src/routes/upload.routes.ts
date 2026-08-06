import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = Router();

// POST /api/upload/image (Admin only)
router.post('/image', authenticate, requireAdmin, upload.single('image'), uploadImage);

// POST /api/upload/feedback-image (Authenticated Users, routes to feedbacks/ folder)
router.post(
  '/feedback-image',
  authenticate,
  upload.single('image'),
  (req, res, next) => {
    req.body.folder = 'feedbacks';
    next();
  },
  uploadImage
);

export default router;
