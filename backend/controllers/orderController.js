import Order, { ORDER_STATUSES } from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculateTotals, linePrices, kgNeeded } from '../utils/pricing.js';
import { createPayment } from '../utils/paymentGateway.js';
import { escapeRegex } from '../utils/slugify.js';

const CUSTOMER_CANCELLABLE = ['Order Placed', 'Confirmed'];

async function restoreStock(order) {
  await Promise.all(
    order.items.map((i) =>
      Product.updateOne({ _id: i.product }, { $inc: { stock: kgNeeded(i.grams, i.quantity), sold: -i.quantity } })
    )
  );
}

// POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, saveAddress } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) throw new ApiError(400, 'Your cart is empty. Add something before checking out.');

  const lines = [];
  for (const item of cart.items) {
    const p = item.product;
    if (!p) throw new ApiError(400, 'An item in your cart is no longer available. Please review your cart.');
    const option = p.weightOptions.find((w) => w.grams === item.grams);
    if (!option) throw new ApiError(400, `${p.name} is no longer sold in that pack size.`);
    if (kgNeeded(item.grams, item.quantity) > p.stock) {
      throw new ApiError(400, p.stock <= 0 ? `${p.name} just went out of stock.` : `Only ${p.stock} kg of ${p.name} is left. Please reduce the quantity.`);
    }
    const { mrp, price } = linePrices(p, item.grams);
    lines.push({
      product: p._id, name: p.name, slug: p.slug, image: p.images?.[0] || '',
      weightLabel: option.label, grams: item.grams, quantity: item.quantity, mrp, price,
    });
  }

  // Reserve stock. The conditional update keeps two shoppers from buying the last kilo.
  const reserved = [];
  try {
    for (const l of lines) {
      const kg = kgNeeded(l.grams, l.quantity);
      // eslint-disable-next-line no-await-in-loop
      const result = await Product.updateOne({ _id: l.product, stock: { $gte: kg } }, { $inc: { stock: -kg, sold: l.quantity } });
      if (result.modifiedCount !== 1) throw new ApiError(409, `${l.name} just sold out. Please update your cart.`);
      reserved.push(l);
    }
  } catch (err) {
    await Promise.all(reserved.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: kgNeeded(l.grams, l.quantity), sold: -l.quantity } })));
    throw err;
  }

  try {
    const totals = calculateTotals(lines);
    const order = new Order({
      user: req.user._id,
      items: lines,
      shippingAddress: { ...shippingAddress, country: shippingAddress.country || 'India' },
      paymentMethod,
      ...totals,
      statusHistory: [{ status: 'Order Placed', note: 'We received your order.' }],
    });
    const payment = await createPayment(order, paymentMethod);
    order.paymentProvider = payment.provider;
    order.paymentReference = payment.reference;
    order.paymentStatus = payment.status;
    await order.save();

    cart.items = [];
    await cart.save();

    if (saveAddress) {
      const user = await User.findById(req.user._id);
      const a = shippingAddress;
      const dup = user.addresses.some((x) => x.house === a.house && x.street === a.street && x.pincode === a.pincode);
      if (!dup) {
        user.addresses.push({ ...a, label: 'Home', isDefault: user.addresses.length === 0 });
        await user.save();
      }
    }

    res.status(201).json({ ...order.toObject(), payment: { clientPayload: payment.clientPayload } });
  } catch (err) {
    await restoreStock({ items: lines });
    throw err;
  }
});

// GET /api/orders   (current user's orders)
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json(orders);
});

// GET /api/orders/:id   (owner or admin)
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) throw new ApiError(404, 'Order not found.');
  const ownerId = String(order.user._id || order.user);
  if (req.user.role !== 'admin' && ownerId !== String(req.user._id)) throw new ApiError(404, 'Order not found.');
  res.json(order);
});

// PUT /api/orders/:id/cancel   (customer, while still early in the pipeline)
export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new ApiError(404, 'Order not found.');
  if (!CUSTOMER_CANCELLABLE.includes(order.orderStatus)) {
    throw new ApiError(400, 'This order is already being prepared and can no longer be cancelled online. Please contact support.');
  }
  await applyStatus(order, 'Cancelled', 'Cancelled by customer.');
  res.json(order);
});

async function applyStatus(order, status, note) {
  if (order.orderStatus === 'Cancelled') throw new ApiError(400, 'This order was cancelled and cannot be changed.');
  if (order.orderStatus === 'Delivered') throw new ApiError(400, 'This order was already delivered.');
  if (order.orderStatus === status) throw new ApiError(400, `Order is already ${status}.`);

  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || '', date: new Date() });

  if (status === 'Delivered') {
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'cod') order.paymentStatus = 'Paid';
  }
  if (status === 'Cancelled') {
    order.cancelledAt = new Date();
    if (order.paymentStatus === 'Paid') order.paymentStatus = 'Refunded';
    await restoreStock(order);
  }
  await order.save();
}

// PUT /api/orders/:id/status   (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found.');
  await applyStatus(order, status, note);
  res.json(await order.populate('user', 'name email phone'));
});

// PUT /api/orders/:id/payment   (admin)
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found.');
  order.paymentStatus = req.body.paymentStatus;
  await order.save();
  res.json(await order.populate('user', 'name email phone'));
});

// GET /api/orders/admin/all  (admin) ?status=&payment=&search=&from=&to=&page=&limit=
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, payment, search, from, to, page = 1, limit = 15 } = req.query;
  const query = {};
  if (status && ORDER_STATUSES.includes(status)) query.orderStatus = status;
  if (payment) query.paymentStatus = payment;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }
  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    const users = await User.find({ $or: [{ name: rx }, { email: rx }, { phone: rx }] }).select('_id').lean();
    query.$or = [{ orderNumber: rx }, { 'shippingAddress.fullName': rx }, { 'shippingAddress.phone': rx }, { user: { $in: users.map((u) => u._id) } }];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 15, 1), 100);
  const [orders, total] = await Promise.all([
    Order.find(query).populate('user', 'name email phone').sort({ createdAt: -1 }).skip((pageNum - 1) * pageSize).limit(pageSize).lean(),
    Order.countDocuments(query),
  ]);
  res.json({ orders, total, page: pageNum, pages: Math.ceil(total / pageSize) || 1 });
});
