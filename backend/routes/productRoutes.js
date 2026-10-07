import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { getProductReviews } from '../controllers/reviewController.js';

const router = Router();

const productRules = (isCreate) => {
  const opt = (chain) => (isCreate ? chain : chain.optional());
  return [
    opt(body('name').trim().notEmpty().withMessage('Product name is required')),
    opt(body('description').trim().notEmpty().withMessage('Description is required')),
    opt(body('category').isMongoId().withMessage('Choose a valid category')),
    opt(body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')),
    body('discountPrice').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Discount price must be a positive number'),
    opt(body('stock').isFloat({ min: 0 }).withMessage('Stock must be 0 or more')),
    body('images').optional().isArray({ max: 10 }).withMessage('Images must be a list of URLs'),
    body('weightOptions').optional().isArray({ min: 1 }).withMessage('Add at least one weight option'),
    body('weightOptions.*.grams').optional().isInt({ min: 50 }).withMessage('Weight must be at least 50 g'),
  ];
};

router.get('/', listProducts);
router.get('/:id/reviews', param('id').isMongoId().withMessage('Invalid product id'), validate, getProductReviews);
router.get('/:id', getProduct);

router.post('/', protect, adminOnly, productRules(true), validate, createProduct);
router.put('/:id', protect, adminOnly, param('id').isMongoId().withMessage('Invalid product id'), productRules(false), validate, updateProduct);
router.delete('/:id', protect, adminOnly, param('id').isMongoId().withMessage('Invalid product id'), validate, deleteProduct);

export default router;
