import User from '../models/User.js';
import Cart from '../models/Cart.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

const authPayload = (user) => ({ token: generateToken(user._id), user: user.toSafeObject() });

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, 'An account with this email already exists. Try logging in instead.');

  // Customers only: the admin role can never be self-assigned through the API.
  const user = await User.create({ name, email, phone, password, role: 'customer' });
  res.status(201).json(authPayload(user));
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  // Same message for unknown email and wrong password, so accounts cannot be probed.
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Incorrect email or password.');
  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated. Contact support.');
  res.json(authPayload(user));
});

// GET /api/auth/profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name slug images finalPrice price discountPrice');
  res.json({ ...user.toSafeObject(), wishlist: user.wishlist });
});

// PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, addresses } = req.body;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (Array.isArray(addresses)) {
    user.addresses = addresses;
    if (user.addresses.length && !user.addresses.some((a) => a.isDefault)) user.addresses[0].isDefault = true;
  }
  await user.save();
  res.json(user.toSafeObject());
});

// PUT /api/auth/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) throw new ApiError(400, 'Your current password is incorrect.');
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated.' });
});

// Used on logout/delete flows if ever needed
export const clearCartFor = (userId) => Cart.deleteOne({ user: userId });
