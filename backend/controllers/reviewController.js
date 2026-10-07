import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/reviews   { productId, rating, comment }   (one review per customer per product; resubmitting edits it)
export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  if (!(await Product.exists({ _id: productId }))) throw new ApiError(404, 'Product not found.');

  const purchased = await Order.exists({ user: req.user._id, orderStatus: 'Delivered', 'items.product': productId });
  if (!purchased) throw new ApiError(403, 'You can review a product once an order containing it has been delivered.');

  const review = await Review.findOneAndUpdate(
    { user: req.user._id, product: productId },
    { rating, comment },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
  await Review.recalculate(productId);
  res.status(201).json(await review.populate('user', 'name'));
});

// GET /api/products/:id/reviews
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.id }).populate('user', 'name').sort({ createdAt: -1 }).lean();
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));
  res.json({ reviews, breakdown });
});

// GET /api/reviews/eligibility/:productId  -> can the logged-in user review this?
export const checkEligibility = asyncHandler(async (req, res) => {
  const [purchased, existing] = await Promise.all([
    Order.exists({ user: req.user._id, orderStatus: 'Delivered', 'items.product': req.params.productId }),
    Review.findOne({ user: req.user._id, product: req.params.productId }).lean(),
  ]);
  res.json({ canReview: Boolean(purchased), existing });
});

// GET /api/reviews/featured  (home page)
export const featuredReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ rating: { $gte: 4 } })
    .populate('user', 'name')
    .populate('product', 'name slug')
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
  res.json(reviews);
});

// GET /api/reviews  (admin)
export const listAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('user', 'name email')
    .populate('product', 'name slug')
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();
  res.json(reviews);
});

// DELETE /api/reviews/:id  (admin)
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found.');
  await review.deleteOne();
  await Review.recalculate(review.product);
  res.json({ message: 'Review deleted.' });
});
