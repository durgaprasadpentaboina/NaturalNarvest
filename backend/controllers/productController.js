import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/slugify.js';

const SORTS = {
  price_asc: { finalPrice: 1 },
  price_desc: { finalPrice: -1 },
  popularity: { reviews: -1, sold: -1 },
  rating: { rating: -1, reviews: -1 },
  newest: { createdAt: -1 },
  bestselling: { sold: -1 },
  featured: { isFeatured: -1, sold: -1 },
};

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v) && /^[a-f\d]{24}$/i.test(v);

const WRITABLE = [
  'name', 'description', 'category', 'type', 'brand', 'tags', 'price', 'discountPrice', 'images', 'weightOptions',
  'stock', 'origin', 'farmingMethod', 'isOrganic', 'isFeatured', 'isBestSeller', 'benefits',
  'nutritionalInformation', 'storageInstructions',
];

// GET /api/products
export const listProducts = asyncHandler(async (req, res) => {
  const {
    search, category, type, minPrice, maxPrice, rating, weight, organic, inStock, farmingMethod,
    featured, bestSeller, sort = 'popularity', page = 1, limit = 12,
  } = req.query;

  const query = {};

  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    const matchingCategories = await Category.find({ name: rx }).select('_id').lean();
    query.$or = [
      { name: rx }, { type: rx }, { brand: rx }, { farmingMethod: rx }, { tags: rx },
      ...(matchingCategories.length ? [{ category: { $in: matchingCategories.map((c) => c._id) } }] : []),
    ];
  }

  if (category) {
    const values = String(category).split(',').filter(Boolean);
    const ids = values.filter(isObjectId);
    const slugs = values.filter((v) => !isObjectId(v));
    const found = slugs.length ? await Category.find({ slug: { $in: slugs } }).select('_id').lean() : [];
    query.category = { $in: [...ids, ...found.map((c) => c._id)] };
  }
  if (type) query.type = new RegExp(`^${escapeRegex(type)}$`, 'i');
  if (farmingMethod) query.farmingMethod = new RegExp(escapeRegex(farmingMethod), 'i');

  if (minPrice || maxPrice) {
    query.finalPrice = {};
    if (minPrice) query.finalPrice.$gte = Number(minPrice);
    if (maxPrice) query.finalPrice.$lte = Number(maxPrice);
  }
  if (rating) query.rating = { $gte: Number(rating) };
  if (weight) query['weightOptions.grams'] = Number(weight);
  if (organic === 'true') query.isOrganic = true;
  if (inStock === 'true') query.stock = { $gt: 0 };
  if (featured === 'true') query.isFeatured = true;
  if (bestSeller === 'true') query.isBestSeller = true;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 60);

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(SORTS[sort] || SORTS.popularity)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Product.countDocuments(query),
  ]);

  res.json({ products, total, page: pageNum, pages: Math.ceil(total / pageSize) || 1 });
});

// GET /api/products/:id   (ObjectId or slug)
export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne(isObjectId(id) ? { _id: id } : { slug: id }).populate('category', 'name slug');
  if (!product) throw new ApiError(404, 'We could not find that product.');

  const related = await Product.find({ category: product.category._id, _id: { $ne: product._id } })
    .populate('category', 'name slug')
    .sort({ sold: -1 })
    .limit(4)
    .lean();

  res.json({ ...product.toObject(), related });
});

// POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  const data = {};
  WRITABLE.forEach((f) => {
    if (req.body[f] !== undefined) data[f] = req.body[f];
  });
  if (!(await Category.exists({ _id: data.category }))) throw new ApiError(400, 'Selected category does not exist.');
  const product = await Product.create(data);
  res.status(201).json(await product.populate('category', 'name slug'));
});

// PUT /api/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');
  if (req.body.category && !(await Category.exists({ _id: req.body.category }))) {
    throw new ApiError(400, 'Selected category does not exist.');
  }
  WRITABLE.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });
  await product.save(); // re-runs slug + finalPrice hooks and validators
  res.json(await product.populate('category', 'name slug'));
});

// DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');
  await Promise.all([product.deleteOne(), Review.deleteMany({ product: product._id })]);
  res.json({ message: 'Product deleted.' });
});
