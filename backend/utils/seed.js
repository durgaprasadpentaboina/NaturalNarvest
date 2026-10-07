import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Cart from '../models/Cart.js';
import { categorySeed, productSeed } from './seedProducts.js';
import { calculateTotals, linePrices } from './pricing.js';
import { slugify } from './slugify.js';

const args = new Set(process.argv.slice(2));

// Small deterministic PRNG so repeated seeds look the same
let state = 20240611;
const rand = () => {
  state = (state * 1664525 + 1013904223) % 4294967296;
  return state / 4294967296;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (a, b) => a + Math.floor(rand() * (b - a + 1));

const CUSTOMERS = [
  ['Ananya Reddy', 'ananya@example.com', '9876500001', 'Hyderabad', 'Hyderabad', 'Telangana', '500081'],
  ['Rahul Sharma', 'rahul@example.com', '9876500002', 'Indore', 'Indore', 'Madhya Pradesh', '452001'],
  ['Priya Nair', 'priya@example.com', '9876500003', 'Kochi', 'Ernakulam', 'Kerala', '682016'],
  ['Vikram Singh', 'vikram@example.com', '9876500004', 'Jaipur', 'Jaipur', 'Rajasthan', '302017'],
  ['Meera Iyer', 'meera@example.com', '9876500005', 'Chennai', 'Chennai', 'Tamil Nadu', '600028'],
  ['Arjun Patil', 'arjun@example.com', '9876500006', 'Pune', 'Pune', 'Maharashtra', '411045'],
  ['Sneha Gupta', 'sneha@example.com', '9876500007', 'Lucknow', 'Lucknow', 'Uttar Pradesh', '226010'],
  ['Kiran Das', 'kiran@example.com', '9876500008', 'Bengaluru', 'Bengaluru Urban', 'Karnataka', '560034'],
];

const COMMENTS = {
  5: [
    'Cooks soft in no time and tastes far fresher than supermarket packs. Will reorder.',
    'Clean, evenly sized grains with no stones or dust. The flavour is noticeably better.',
    'Packed neatly and arrived quickly. We have switched our whole kitchen to NaturalHarvest.',
    'Lovely aroma while cooking. My mother-in-law approved, which is rare.',
    'Great value for the quality. The 2 kg pack is the sweet spot for our family.',
  ],
  4: [
    'Very good quality. Took a little longer to cook than I expected, but the taste is worth it.',
    'Fresh and clean. Packaging could be slightly sturdier, otherwise perfect.',
    'Good grains and honest pricing. Delivery took three days.',
  ],
  3: ['Decent quality, though a few split grains were mixed in. Fair for the price.'],
};

async function destroy() {
  await Promise.all([Order.deleteMany(), Review.deleteMany(), Cart.deleteMany(), Product.deleteMany(), Category.deleteMany(), User.deleteMany()]);
  console.log('All collections cleared.');
}

async function run() {
  if (process.env.NODE_ENV === 'production' && !args.has('--force')) {
    throw new Error('Refusing to seed with NODE_ENV=production. Re-run with --force if you are sure; this wipes the database.');
  }
  await connectDB();
  await destroy();
  if (args.has('--destroy')) return;

  // Admin
  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'NaturalHarvest Admin',
    email: process.env.ADMIN_EMAIL || 'admin@naturalharvest.com',
    phone: '9000000000',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe@123',
    role: 'admin',
  });

  // Customers
  const customers = [];
  for (const [name, email, phone, city, district, state_, pincode] of CUSTOMERS) {
    customers.push(
      // eslint-disable-next-line no-await-in-loop
      await User.create({
        name, email, phone, password: 'Customer@123',
        addresses: [{ label: 'Home', fullName: name, phone, house: `${between(2, 90)}, Green Park Residency`, street: 'Lake View Road', city, district, state: state_, pincode, isDefault: true }],
      })
    );
  }

  // Categories + products
  const categories = {};
  for (const c of categorySeed) categories[c.name] = await Category.create({ ...c, image: `/categories/${slugify(c.name)}.jpg` });

  const products = [];
  for (const p of productSeed) {
    const slug = slugify(p.name);
    // eslint-disable-next-line no-await-in-loop
    products.push(
      await Product.create({
        name: p.name, description: p.description, category: categories[p.category]._id, type: p.type, tags: p.tags,
        price: p.price, discountPrice: p.discountPrice, stock: p.stock, origin: p.origin, farmingMethod: p.farmingMethod,
        isOrganic: p.isOrganic, isFeatured: p.isFeatured, isBestSeller: p.isBestSeller, benefits: p.benefits,
        nutritionalInformation: p.nutrition, images: [`/products/${slug}.jpg`],
        sold: between(40, 380),
      })
    );
  }

  // Historic orders so the dashboard has something to chart
  const statusFlow = ['Order Placed', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const orderCount = 70;
  const deliveredPairs = []; // [customer, product] eligible for reviews

  for (let i = 0; i < orderCount; i += 1) {
    const customer = pick(customers);
    const daysAgo = Math.floor(Math.pow(rand(), 1.4) * 75);
    const createdAt = new Date(Date.now() - daysAgo * 86400000 - between(0, 20) * 3600000);

    const chosen = new Set();
    const lines = [];
    const lineCount = between(1, 3);
    while (lines.length < lineCount) {
      const p = pick(products);
      if (chosen.has(String(p._id))) continue;
      chosen.add(String(p._id));
      const opt = pick(p.weightOptions.slice(1, 4));
      const quantity = between(1, 3);
      lines.push({
        product: p._id, name: p.name, slug: p.slug, image: p.images[0], weightLabel: opt.label, grams: opt.grams,
        quantity, ...linePrices(p, opt.grams),
      });
    }
    const totals = calculateTotals(lines);

    // Older orders are delivered; recent ones sit earlier in the pipeline
    let target;
    if (daysAgo > 8) target = rand() < 0.07 ? 'Cancelled' : 'Delivered';
    else if (daysAgo > 4) target = pick(['Shipped', 'Out for Delivery', 'Delivered', 'Packed']);
    else target = pick(['Order Placed', 'Confirmed', 'Processing', 'Packed']);

    const steps = target === 'Cancelled' ? ['Order Placed', 'Cancelled'] : statusFlow.slice(0, statusFlow.indexOf(target) + 1);
    const statusHistory = steps.map((status, idx) => ({ status, date: new Date(createdAt.getTime() + idx * 9 * 3600000), note: '' }));
    const a = customer.addresses[0];
    const method = rand() < 0.75 ? 'cod' : 'online';

    const order = await Order.create({
      user: customer._id, items: lines,
      shippingAddress: { fullName: customer.name, email: customer.email, phone: customer.phone, house: a.house, street: a.street, city: a.city, district: a.district, state: a.state, pincode: a.pincode, country: 'India' },
      paymentMethod: method, paymentProvider: method === 'cod' ? 'cod' : 'placeholder',
      paymentStatus: target === 'Delivered' && method === 'cod' ? 'Paid' : 'Pending',
      orderStatus: target, statusHistory, ...totals,
      deliveredAt: target === 'Delivered' ? statusHistory.at(-1).date : undefined,
      cancelledAt: target === 'Cancelled' ? statusHistory.at(-1).date : undefined,
    });
    await Order.updateOne({ _id: order._id }, { $set: { createdAt, updatedAt: statusHistory.at(-1).date } }, { timestamps: false });
    if (target === 'Delivered') lines.forEach((l) => deliveredPairs.push([customer, l.product]));
  }

  // Reviews: only customers whose order was delivered, one per customer per product
  const seen = new Set();
  for (const [customer, productId] of deliveredPairs) {
    const key = `${customer._id}-${productId}`;
    if (seen.has(key) || rand() < 0.35) continue;
    seen.add(key);
    const rating = rand() < 0.65 ? 5 : rand() < 0.8 ? 4 : 3;
    const review = await Review.create({ user: customer._id, product: productId, rating, comment: pick(COMMENTS[rating]) });
    await Review.updateOne({ _id: review._id }, { $set: { createdAt: new Date(Date.now() - between(1, 60) * 86400000) } }, { timestamps: false });
  }
  await Promise.all(products.map((p) => Review.recalculate(p._id)));

  console.log(`Seeded ${categorySeed.length} categories, ${products.length} products, ${customers.length} customers, ${orderCount} orders, ${seen.size} reviews.`);
  console.log(`Admin login:    ${admin.email}  /  ${process.env.ADMIN_PASSWORD || 'ChangeMe@123'}`);
  console.log('Demo customers: ananya@example.com (and 7 others)  /  Customer@123');
}

run()
  .then(() => mongoose.disconnect())
  .catch(async (err) => {
    console.error('Seed failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  });
