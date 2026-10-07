import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { createReview, checkEligibility, featuredReviews, listAllReviews, deleteReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/featured', featuredReviews);
router.get('/eligibility/:productId', protect, param('productId').isMongoId().withMessage('Invalid product'), validate, checkEligibility);
router.post(
  '/',
  protect,
  [
    body('productId').isMongoId().withMessage('Invalid product'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1 to 5'),
    body('comment').trim().isLength({ min: 3, max: 1000 }).withMessage('Write a short comment (3 to 1000 characters)'),
  ],
  validate,
  createReview
);
router.get('/', protect, adminOnly, listAllReviews);
router.delete('/:id', protect, adminOnly, param('id').isMongoId().withMessage('Invalid review'), validate, deleteReview);

export default router;
