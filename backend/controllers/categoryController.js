import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/categories
export const listCategories = asyncHandler(async (req, res) => {
  const [categories, counts, types] = await Promise.all([
    Category.find().sort({ createdAt: 1 }).lean(),
    Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Product.aggregate([{ $match: { type: { $ne: '' } } }, { $group: { _id: { category: '$category', type: '$type' } } }]),
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  const typeMap = new Map();
  types.forEach(({ _id }) => {
    const key = String(_id.category);
    typeMap.set(key, [...(typeMap.get(key) || []), _id.type]);
  });
  res.json(
    categories.map((c) => ({
      ...c,
      productCount: countMap.get(String(c._id)) || 0,
      types: (typeMap.get(String(c._id)) || []).sort(),
    }))
  );
});

// GET /api/categories/:id  (id or slug)
export const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findOne(/^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id });
  if (!category) throw new ApiError(404, 'Category not found.');
  res.json(category);
});

// POST /api/categories
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  const category = await Category.create({ name, description, image });
  res.status(201).json(category);
});

// PUT /api/categories/:id
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found.');
  ['name', 'description', 'image'].forEach((f) => {
    if (req.body[f] !== undefined) category[f] = req.body[f];
  });
  await category.save();
  res.json(category);
});

// DELETE /api/categories/:id
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found.');
  const inUse = await Product.countDocuments({ category: category._id });
  if (inUse > 0) throw new ApiError(400, `This category still has ${inUse} product${inUse === 1 ? '' : 's'}. Move or delete them first.`);
  await category.deleteOne();
  res.json({ message: 'Category deleted.' });
});
