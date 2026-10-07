import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { getStats, listCustomers, getCustomer, setCustomerActive, listMessages, markMessageRead } from '../controllers/adminController.js';
import { getAllOrders } from '../controllers/orderController.js';

const router = Router();
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/orders', getAllOrders);
router.get('/customers', listCustomers);
router.get('/customers/:id', param('id').isMongoId().withMessage('Invalid customer'), validate, getCustomer);
router.put('/customers/:id/active', param('id').isMongoId().withMessage('Invalid customer'), body('isActive').isBoolean().withMessage('isActive must be true or false'), validate, setCustomerActive);
router.get('/messages', listMessages);
router.put('/messages/:id/read', param('id').isMongoId().withMessage('Invalid message'), validate, markMessageRead);

export default router;
