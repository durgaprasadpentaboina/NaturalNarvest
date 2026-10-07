import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';

const router = Router();
router.use(protect);

router.get('/', getWishlist);
router.post('/', body('productId').isMongoId().withMessage('Invalid product'), validate, addToWishlist);
router.delete('/:id', param('id').isMongoId().withMessage('Invalid product'), validate, removeFromWishlist);

export default router;
