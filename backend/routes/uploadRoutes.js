import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { uploadImages, uploadStatus } from '../controllers/uploadController.js';

const router = Router();
router.use(protect, adminOnly);

router.get('/status', uploadStatus);
router.post('/', upload.array('images', 8), uploadImages);

export default router;
