import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { listCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';

const router = Router();
const idRule = param('id').isMongoId().withMessage('Invalid category id');

router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', protect, adminOnly, [body('name').trim().notEmpty().withMessage('Category name is required')], validate, createCategory);
router.put('/:id', protect, adminOnly, idRule, [body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty')], validate, updateCategory);
router.delete('/:id', protect, adminOnly, idRule, validate, deleteCategory);

export default router;
