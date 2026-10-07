import mongoose from 'mongoose';
import Product from './Product.js';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    rating: { type: Number, required: [true, 'Rating is required'], min: [1, 'Rating must be 1 to 5'], max: [5, 'Rating must be 1 to 5'] },
    comment: { type: String, required: [true, 'Please write a short comment'], trim: true, minlength: [3, 'Comment is too short'], maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Recalculate the product's average rating and review count
reviewSchema.statics.recalculate = async function recalculate(productId) {
  const ratings = await this.find({ product: productId }).select('rating').lean();
  const count = ratings.length;
  const avg = count ? ratings.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  await Product.findByIdAndUpdate(productId, { rating: Math.round(avg * 10) / 10, reviews: count });
};

export default mongoose.model('Review', reviewSchema);
