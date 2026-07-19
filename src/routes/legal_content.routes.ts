import { Router } from 'express';
import { getLegalContent, updateLegalContent } from '../controllers/legal_content.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Public route to fetch legal content
router.get('/legal/:type', getLegalContent);

// Admin route to update legal content
router.put('/admin/legal/:type', authenticate, requireAdmin, updateLegalContent);

export default router;
