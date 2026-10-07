import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

const phoneRule = body('phone').trim().matches(/^\+?[0-9\s-]{10,15}$/).withMessage('Enter a valid phone number (10 digits)');

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Enter your full name'),
    body('email').trim().isEmail().withMessage('Enter a valid email address'),
    phoneRule,
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Za-z]/).withMessage('Password needs at least one letter')
      .matches(/\d/).withMessage('Password needs at least one number'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [body('email').trim().isEmail().withMessage('Enter a valid email address'), body('password').notEmpty().withMessage('Enter your password')],
  validate,
  login
);

router.get('/profile', protect, getProfile);

router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Enter your full name'),
    body('phone').optional().trim().matches(/^\+?[0-9\s-]{10,15}$/).withMessage('Enter a valid phone number'),
    body('addresses').optional().isArray({ max: 10 }).withMessage('Addresses must be a list'),
    body('addresses.*.pincode').optional().matches(/^\d{6}$/).withMessage('PIN code must be 6 digits'),
  ],
  validate,
  updateProfile
);

router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Enter your current password'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters').matches(/\d/).withMessage('New password needs at least one number'),
  ],
  validate,
  changePassword
);

export default router;
