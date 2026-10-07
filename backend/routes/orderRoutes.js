import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { ORDER_STATUSES } from '../models/Order.js';
import {
  createOrder, getMyOrders, getOrder, cancelMyOrder, updateOrderStatus, updatePaymentStatus,
} from '../controllers/orderController.js';

const router = Router();
router.use(protect);

const idRule = param('id').isMongoId().withMessage('Invalid order id');

router.post(
  '/',
  [
    body('paymentMethod').isIn(['cod', 'online']).withMessage('Choose a payment method'),
    body('shippingAddress.fullName').trim().notEmpty().withMessage('Enter your name'),
    body('shippingAddress.email').trim().isEmail().withMessage('Enter a valid email address'),
    body('shippingAddress.phone').trim().matches(/^\+?[0-9\s-]{10,15}$/).withMessage('Enter a valid phone number'),
    body('shippingAddress.house').trim().notEmpty().withMessage('House / flat is required'),
    body('shippingAddress.street').trim().notEmpty().withMessage('Street is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('Village / city is required'),
    body('shippingAddress.district').trim().notEmpty().withMessage('District is required'),
    body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
    body('shippingAddress.pincode').matches(/^\d{6}$/).withMessage('PIN code must be 6 digits'),
  ],
  validate,
  createOrder
);
router.get('/', getMyOrders);
router.get('/:id', idRule, validate, getOrder);
router.put('/:id/cancel', idRule, validate, cancelMyOrder);

router.put(
  '/:id/status',
  adminOnly,
  idRule,
  [body('status').isIn(ORDER_STATUSES).withMessage(`Status must be one of: ${ORDER_STATUSES.join(', ')}`), body('note').optional().isString().isLength({ max: 300 })],
  validate,
  updateOrderStatus
);
router.put(
  '/:id/payment',
  adminOnly,
  idRule,
  [body('paymentStatus').isIn(['Pending', 'Paid', 'Failed', 'Refunded']).withMessage('Invalid payment status')],
  validate,
  updatePaymentStatus
);

export default router;
