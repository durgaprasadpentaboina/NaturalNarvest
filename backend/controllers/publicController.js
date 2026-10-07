import Subscriber from '../models/Subscriber.js';
import Message from '../models/Message.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/newsletter
export const subscribe = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const existing = await Subscriber.findOne({ email });
  if (existing) return res.json({ message: 'You are already subscribed. Thank you!' });
  await Subscriber.create({ email });
  res.status(201).json({ message: 'You are subscribed. Look out for seasonal harvest news.' });
});

// POST /api/contact
export const sendMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  await Message.create({ name, email, subject, message });
  res.status(201).json({ message: 'Thanks for writing. We usually reply within one working day.' });
});
