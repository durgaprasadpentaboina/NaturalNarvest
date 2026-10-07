import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';

const router = Router();
router.use(protect);

router.get('/', getCart);
router.post(
  '/',
  [
    body('productId').isMongoId().withMessage('Invalid product'),
    body('grams').isInt({ min: 50 }).withMessage('Choose a pack size'),
    body('quantity').optional().isInt({ min: 1, max: 50 }).withMessage('Quantity must be between 1 and 50'),
  ],
  validate,
  addToCart
);
router.delete('/', clearCart);
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid cart item'),
    body('quantity').optional().isInt({ min: 1, max: 50 }).withMessage('Quantity must be between 1 and 50'),
    body('grams').optional().isInt({ min: 50 }).withMessage('Choose a pack size'),
  ],
  validate,
  updateCartItem
);
router.delete('/:id', param('id').isMongoId().withMessage('Invalid cart item'), validate, removeCartItem);

export default router;
