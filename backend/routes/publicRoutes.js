import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import validate from '../middleware/validate.js';
import { subscribe, sendMessage } from '../controllers/publicController.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many requests. Please try again later.' } });

router.post('/newsletter', limiter, body('email').trim().isEmail().withMessage('Enter a valid email address'), validate, subscribe);
router.post(
  '/contact',
  limiter,
  [
    body('name').trim().notEmpty().withMessage('Enter your name'),
    body('email').trim().isEmail().withMessage('Enter a valid email address'),
    body('message').trim().isLength({ min: 10, max: 3000 }).withMessage('Write a message of at least 10 characters'),
  ],
  validate,
  sendMessage
);

export default router;
