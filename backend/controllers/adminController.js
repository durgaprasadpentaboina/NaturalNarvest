import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Message from '../models/Message.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { LOW_STOCK_THRESHOLD } from '../utils/pricing.js';
import { escapeRegex } from '../utils/slugify.js';

const TZ = 'Asia/Kolkata';

// GET /api/admin/stats
export const getStats = asyncHandler(async (req, res) => {
  const live = { orderStatus: { $ne: 'Cancelled' } };
  const since30 = new Date();
  since30.setDate(since30.getDate() - 29);
  since30.setHours(0, 0, 0, 0);
  const since12m = new Date();
  since12m.setMonth(since12m.getMonth() - 11, 1);
  since12m.setHours(0, 0, 0, 0);

  const [
    totals, totalOrders, totalCustomers, totalProducts, pendingOrders, deliveredOrders, lowStockCount,
    lowStockProducts, recentOrderDocs, statusRaw, topProducts, recentOrders,
  ] = await Promise.all([
    Order.aggregate([{ $match: live }, { $group: { _id: null, sales: { $sum: '$total' } } }]),
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.countDocuments({ orderStatus: { $in: ['Order Placed', 'Confirmed', 'Processing', 'Packed'] } }),
    Order.countDocuments({ orderStatus: 'Delivered' }),
    Product.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD } }),
    Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } }).select('name slug stock images').sort({ stock: 1 }).limit(8).lean(),
    Order.find({ ...live, createdAt: { $gte: since12m } }).select('createdAt total').lean(),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: live },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', units: { $sum: '$items.quantity' }, revenue: { $sum: '$items.lineTotal' } } },
      { $sort: { units: -1 } },
      { $limit: 6 },
    ]),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const topNames = new Map(
    (await Product.find({ _id: { $in: topProducts.map((p) => p._id) } }).select('name').lean()).map((p) => [String(p._id), p.name])
  );

  // Bucket orders by calendar day / month in the shop's timezone, filling gaps with zeros
  const fmtDay = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  const dailyMap = new Map();
  const monthlyMap = new Map();
  recentOrderDocs.forEach((o) => {
    const day = fmtDay.format(o.createdAt); // YYYY-MM-DD
    const month = day.slice(0, 7);
    const d = dailyMap.get(day) || { revenue: 0, orders: 0 };
    d.revenue += o.total;
    d.orders += 1;
    dailyMap.set(day, d);
    const m = monthlyMap.get(month) || { revenue: 0, orders: 0 };
    m.revenue += o.total;
    m.orders += 1;
    monthlyMap.set(month, m);
  });

  const daily = [];
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(since30);
    d.setDate(since30.getDate() + i);
    const key = fmtDay.format(d);
    daily.push({ date: key, revenue: Math.round(dailyMap.get(key)?.revenue || 0), orders: dailyMap.get(key)?.orders || 0 });
  }
  const monthly = [];
  for (let i = 0; i < 12; i += 1) {
    const d = new Date(since12m);
    d.setMonth(since12m.getMonth() + i, 1);
    const key = fmtDay.format(d).slice(0, 7);
    monthly.push({ month: key, revenue: Math.round(monthlyMap.get(key)?.revenue || 0), orders: monthlyMap.get(key)?.orders || 0 });
  }

  res.json({
    totalSales: Math.round(totals[0]?.sales || 0),
    totalOrders, totalCustomers, totalProducts, pendingOrders, deliveredOrders, lowStockCount,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    lowStockProducts, daily, monthly,
    ordersByStatus: statusRaw.map((s) => ({ status: s._id, count: s.count })),
    topProducts: topProducts.map((p) => ({ productId: p._id, name: topNames.get(String(p._id)) || 'Removed product', units: p.units, revenue: p.revenue })),
    recentOrders,
  });
});

// GET /api/admin/customers ?search=&page=&limit=
export const listCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = { role: 'customer' };
  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const [customers, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((pageNum - 1) * pageSize).limit(pageSize).lean(),
    User.countDocuments(query),
  ]);
  const stats = await Order.aggregate([
    { $match: { user: { $in: customers.map((c) => c._id) }, orderStatus: { $ne: 'Cancelled' } } },
    { $group: { _id: '$user', orders: { $sum: 1 }, spent: { $sum: '$total' } } },
  ]);
  const statMap = new Map(stats.map((s) => [String(s._id), s]));

  res.json({
    customers: customers.map((c) => ({
      _id: c._id, name: c.name, email: c.email, phone: c.phone, isActive: c.isActive, createdAt: c.createdAt,
      addresses: c.addresses || [],
      orders: statMap.get(String(c._id))?.orders || 0,
      spent: Math.round(statMap.get(String(c._id))?.spent || 0),
    })),
    total, page: pageNum, pages: Math.ceil(total / pageSize) || 1,
  });
});

// GET /api/admin/customers/:id
export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' }).lean();
  if (!customer) throw new ApiError(404, 'Customer not found.');
  delete customer.password;
  const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 }).limit(25).lean();
  res.json({ customer, orders });
});

// PUT /api/admin/customers/:id/active   { isActive }
export const setCustomerActive = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!customer) throw new ApiError(404, 'Customer not found.');
  customer.isActive = Boolean(req.body.isActive);
  await customer.save();
  res.json({ _id: customer._id, isActive: customer.isActive });
});

// GET /api/admin/messages
export const listMessages = asyncHandler(async (req, res) => {
  res.json(await Message.find().sort({ createdAt: -1 }).limit(200).lean());
});

// PUT /api/admin/messages/:id/read
export const markMessageRead = asyncHandler(async (req, res) => {
  const msg = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!msg) throw new ApiError(404, 'Message not found.');
  res.json(msg);
});
