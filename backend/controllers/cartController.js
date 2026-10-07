import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculateTotals, linePrices, kgNeeded } from '../utils/pricing.js';

const getOrCreateCart = async (userId) => (await Cart.findOne({ user: userId })) || Cart.create({ user: userId, items: [] });

async function buildResponse(userId) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) return { items: [], totals: calculateTotals([]) };

  // Drop lines whose product was deleted or whose weight option no longer exists
  const valid = cart.items.filter((i) => i.product && i.product.weightOptions.some((w) => w.grams === i.grams));
  if (valid.length !== cart.items.length) {
    cart.items = valid;
    await cart.save();
  }

  const items = valid.map((i) => {
    const p = i.product;
    const { mrp, price } = linePrices(p, i.grams);
    const option = p.weightOptions.find((w) => w.grams === i.grams);
    return {
      _id: i._id,
      grams: i.grams,
      weightLabel: option.label,
      quantity: i.quantity,
      mrp,
      price,
      inStock: kgNeeded(i.grams, i.quantity) <= p.stock,
      product: {
        _id: p._id, name: p.name, slug: p.slug, images: p.images, stock: p.stock,
        price: p.price, discountPrice: p.discountPrice, weightOptions: p.weightOptions, isOrganic: p.isOrganic,
      },
    };
  });
  return { items, totals: calculateTotals(items) };
}

const assertStock = (product, grams, quantity) => {
  if (kgNeeded(grams, quantity) > product.stock) {
    throw new ApiError(400, product.stock <= 0 ? `${product.name} is out of stock.` : `Only ${product.stock} kg of ${product.name} is available.`);
  }
};

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  res.json(await buildResponse(req.user._id));
});

// POST /api/cart   { productId, grams, quantity }
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, grams, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found.');
  if (!product.weightOptions.some((w) => w.grams === Number(grams))) throw new ApiError(400, 'That pack size is not available for this product.');

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((i) => String(i.product) === String(productId) && i.grams === Number(grams));
  const newQty = Math.min((existing?.quantity || 0) + Number(quantity), 50);
  assertStock(product, Number(grams), newQty);

  if (existing) existing.quantity = newQty;
  else cart.items.push({ product: productId, grams: Number(grams), quantity: newQty });
  await cart.save();
  res.status(201).json(await buildResponse(req.user._id));
});

// PUT /api/cart/:id   { quantity?, grams? }
export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.id);
  if (!item) throw new ApiError(404, 'That item is not in your cart.');
  const product = await Product.findById(item.product);
  if (!product) throw new ApiError(404, 'This product is no longer available.');

  const grams = req.body.grams !== undefined ? Number(req.body.grams) : item.grams;
  const quantity = req.body.quantity !== undefined ? Number(req.body.quantity) : item.quantity;
  if (!product.weightOptions.some((w) => w.grams === grams)) throw new ApiError(400, 'That pack size is not available for this product.');

  // Changing weight onto a line that already exists merges the two
  const twin = cart.items.find((i) => String(i._id) !== String(item._id) && String(i.product) === String(item.product) && i.grams === grams);
  const finalQty = Math.min(quantity + (twin ? twin.quantity : 0), 50);
  assertStock(product, grams, finalQty);

  if (twin) {
    twin.quantity = finalQty;
    cart.items = cart.items.filter((i) => String(i._id) !== String(item._id));
  } else {
    item.grams = grams;
    item.quantity = finalQty;
  }
  await cart.save();
  res.json(await buildResponse(req.user._id));
});

// DELETE /api/cart/:id
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.id);
  if (!item) throw new ApiError(404, 'That item is not in your cart.');
  cart.items = cart.items.filter((i) => String(i._id) !== String(item._id));
  await cart.save();
  res.json(await buildResponse(req.user._id));
});

// DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ items: [], totals: calculateTotals([]) });
});

export { buildResponse as buildCartResponse };
