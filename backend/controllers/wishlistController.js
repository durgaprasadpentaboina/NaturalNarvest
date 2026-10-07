import User from '../models/User.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const load = async (userId) => {
  const user = await User.findById(userId).populate({ path: 'wishlist', populate: { path: 'category', select: 'name slug' } });
  return user.wishlist.filter(Boolean);
};

// GET /api/wishlist
export const getWishlist = asyncHandler(async (req, res) => res.json(await load(req.user._id)));

// POST /api/wishlist   { productId }
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!(await Product.exists({ _id: productId }))) throw new ApiError(404, 'Product not found.');
  await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: productId } });
  res.status(201).json(await load(req.user._id));
});

// DELETE /api/wishlist/:id   (product id)
export const removeFromWishlist = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.id } });
  res.json(await load(req.user._id));
});
