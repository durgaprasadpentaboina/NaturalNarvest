// End-to-end API smoke test. Run against a SEEDED database:
//   npm run seed && npm start   (in another terminal)   then   node tests/smoke.mjs
// Override the target with API_URL=https://your-api/api
const API = process.env.API_URL || 'http://localhost:5000/api';
let passed = 0;
let failed = 0;

const call = async (method, path, { token, body } = {}) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data };
};

const check = (name, condition, extra = '') => {
  if (condition) { passed += 1; console.log(`  ok   ${name}`); }
  else { failed += 1; console.log(`  FAIL ${name} ${extra}`); }
};
const section = (t) => console.log(`\n${t}`);

const stamp = Date.now();
const email = `tester${stamp}@example.com`;
const address = { fullName: 'Test Shopper', email, phone: '9876543210', house: '12A', street: 'Market Road', city: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', pincode: '440001', country: 'India' };

section('Health & auth');
check('health endpoint', (await call('GET', '/health')).status === 200);
let r = await call('POST', '/auth/register', { body: { name: 'T', email: 'bad', phone: '1', password: 'x' } });
check('register validation -> 422', r.status === 422, JSON.stringify(r.data));
r = await call('POST', '/auth/register', { body: { name: 'Test Shopper', email, phone: '9876543210', password: 'Secret123' } });
check('register -> 201 with token', r.status === 201 && r.data.token && !r.data.user.password, JSON.stringify(r.data));
check('new users are customers', r.data.user.role === 'customer');
const dup = await call('POST', '/auth/register', { body: { name: 'Test Shopper', email, phone: '9876543210', password: 'Secret123' } });
check('duplicate email -> 409', dup.status === 409);
const role = await call('POST', '/auth/register', { body: { name: 'Sneaky', email: `s${stamp}@example.com`, phone: '9876543210', password: 'Secret123', role: 'admin' } });
check('cannot self-assign admin role', role.data.user?.role === 'customer');
r = await call('POST', '/auth/login', { body: { email, password: 'wrong-pass1' } });
check('wrong password -> 401', r.status === 401);
r = await call('POST', '/auth/login', { body: { email, password: 'Secret123' } });
const token = r.data.token;
check('login -> token', r.status === 200 && Boolean(token));
r = await call('GET', '/auth/profile', { token });
check('profile with token', r.status === 200 && r.data.email === email);
check('profile without token -> 401', (await call('GET', '/auth/profile')).status === 401);
check('customer blocked from admin -> 403', (await call('GET', '/admin/stats', { token })).status === 403);

section('Catalogue, search, filters');
r = await call('GET', '/categories');
check('categories list (2: Pulses, Rice)', r.status === 200 && r.data.length === 2, String(r.data?.length));
const pulses = r.data.find((c) => c.slug === 'pulses');
check('category has types + counts', pulses?.types?.length > 3 && pulses.productCount > 3);
r = await call('GET', '/products?limit=60');
check('products list >= 20', r.data.total >= 20, String(r.data.total));
r = await call('GET', '/products?search=moong');
check('search "moong" returns moong products only', r.data.products.length >= 2 && r.data.products.every((p) => /moong/i.test(`${p.name} ${p.type} ${p.tags.join(' ')}`)));
r = await call('GET', '/products?search=zzzzqq');
check('no-results search is empty, not an error', r.status === 200 && r.data.products.length === 0);
r = await call('GET', '/products?search=rice');
check('search by category name', r.data.products.length >= 4);
r = await call('GET', '/products?search=organic');
check('search by farming method', r.data.products.length >= 3);
r = await call('GET', '/products?organic=true');
check('organic filter', r.data.products.length >= 3 && r.data.products.every((p) => p.isOrganic));
r = await call('GET', '/products?category=rice');
check('category filter by slug', r.data.products.length >= 4 && r.data.products.every((p) => p.category.slug === 'rice'));
r = await call('GET', '/products?minPrice=100&maxPrice=150');
check('price range filter', r.data.products.length > 0 && r.data.products.every((p) => p.finalPrice >= 100 && p.finalPrice <= 150));
r = await call('GET', '/products?rating=4');
check('rating filter', r.data.products.every((p) => p.rating >= 4));
r = await call('GET', '/products?inStock=true');
check('availability filter', r.data.products.every((p) => p.stock > 0));
r = await call('GET', '/products?weight=5000');
check('weight filter', r.status === 200 && r.data.total > 0);
const asc = (await call('GET', '/products?sort=price_asc&limit=60')).data.products.map((p) => p.finalPrice);
check('sort price low->high', asc.every((v, i) => i === 0 || v >= asc[i - 1]));
const desc = (await call('GET', '/products?sort=price_desc&limit=60')).data.products.map((p) => p.finalPrice);
check('sort price high->low', desc.every((v, i) => i === 0 || v <= desc[i - 1]));
const newest = (await call('GET', '/products?sort=newest&limit=60')).data.products.map((p) => +new Date(p.createdAt));
check('sort newest', newest.every((v, i) => i === 0 || v <= newest[i - 1]));
r = await call('GET', '/products?page=2&limit=8');
check('pagination', r.data.page === 2 && r.data.products.length === 8 && r.data.pages >= 3);
r = await call('GET', '/products?featured=true');
check('featured flag', r.data.products.length >= 4 && r.data.products.every((p) => p.isFeatured));
r = await call('GET', '/products?bestSeller=true');
check('bestseller flag', r.data.products.length >= 4);

const toor = (await call('GET', '/products/organic-toor-dal')).data;
check('product by slug (with related)', toor.name === 'Organic Toor Dal' && toor.related.length > 0 && toor.nutritionalInformation.protein > 0);
check('product by id', (await call('GET', `/products/${toor._id}`)).data.slug === 'organic-toor-dal');
check('unknown product -> 404', (await call('GET', '/products/does-not-exist')).status === 404);
r = await call('GET', `/products/${toor._id}/reviews`);
check('product reviews + breakdown', r.status === 200 && Array.isArray(r.data.reviews) && r.data.breakdown.length === 5);

section('Wishlist');
const moong = (await call('GET', '/products/premium-moong-dal')).data;
r = await call('POST', '/wishlist', { token, body: { productId: moong._id } });
check('add to wishlist', r.status === 201 && r.data.length === 1);
r = await call('POST', '/wishlist', { token, body: { productId: moong._id } });
check('wishlist add is idempotent', r.data.length === 1);
r = await call('GET', '/wishlist', { token });
check('get wishlist', r.data[0]?.slug === 'premium-moong-dal');
r = await call('DELETE', `/wishlist/${moong._id}`, { token });
check('remove from wishlist', r.status === 200 && r.data.length === 0);

section('Cart');
check('cart requires login', (await call('GET', '/cart')).status === 401);
r = await call('POST', '/cart', { token, body: { productId: toor._id, grams: 1000, quantity: 2 } });
check('add to cart', r.status === 201 && r.data.items.length === 1 && r.data.items[0].quantity === 2);
const expectedMrp = toor.price * 2;
check('cart subtotal/discount maths', r.data.totals.subtotal === expectedMrp && r.data.totals.discount === (toor.price - toor.discountPrice) * 2, JSON.stringify(r.data.totals));
check('flat shipping under threshold', r.data.totals.shipping === 49);
check('tax is 5% of discounted amount', Math.abs(r.data.totals.tax - (toor.discountPrice * 2) * 0.05) < 0.01);
r = await call('POST', '/cart', { token, body: { productId: toor._id, grams: 1000, quantity: 1 } });
check('same product+weight merges lines', r.data.items.length === 1 && r.data.items[0].quantity === 3);
check('free shipping over threshold', r.data.totals.shipping === 0, JSON.stringify(r.data.totals));
let line = r.data.items[0];
r = await call('PUT', `/cart/${line._id}`, { token, body: { quantity: 1 } });
check('decrease quantity', r.data.items[0].quantity === 1);
r = await call('PUT', `/cart/${line._id}`, { token, body: { grams: 500 } });
check('change weight reprices line', r.data.items[0].grams === 500 && r.data.items[0].price === Math.round(toor.discountPrice * 0.5), JSON.stringify(r.data.items[0]));
check('small cart pays shipping', r.data.totals.shipping === 49);
r = await call('POST', '/cart', { token, body: { productId: toor._id, grams: 123, quantity: 1 } });
check('invalid weight rejected', r.status === 400);
const pinto = (await call('GET', '/products/black-rice')).data; // 8 kg in stock
r = await call('POST', '/cart', { token, body: { productId: pinto._id, grams: 5000, quantity: 2 } });
check('cannot add more than stock', r.status === 400, JSON.stringify(r.data));
const sprout = (await call('GET', '/products/poha-flattened-rice')).data;
r = await call('POST', '/cart', { token, body: { productId: sprout._id, grams: 250, quantity: 1 } });
check('cannot add out-of-stock product', r.status === 400);
r = await call('DELETE', `/cart/${line._id}`, { token });
check('remove from cart', r.status === 200 && r.data.items.length === 0);

section('Checkout & orders');
r = await call('POST', '/orders', { token, body: { shippingAddress: address, paymentMethod: 'cod' } });
check('empty cart cannot check out', r.status === 400);
const stockBefore = (await call('GET', `/products/${toor._id}`)).data.stock;
await call('POST', '/cart', { token, body: { productId: toor._id, grams: 2000, quantity: 1 } });
await call('POST', '/cart', { token, body: { productId: moong._id, grams: 500, quantity: 2 } });
r = await call('POST', '/orders', { token, body: { shippingAddress: { ...address, pincode: '12' }, paymentMethod: 'cod' } });
check('bad PIN code -> 422', r.status === 422);
r = await call('POST', '/orders', { token, body: { shippingAddress: address, paymentMethod: 'cod', saveAddress: true } });
const order = r.data;
check('place COD order -> 201', r.status === 201 && order.orderNumber?.startsWith('NH-'), JSON.stringify(r.data).slice(0, 200));
check('order starts as "Order Placed" with history', order.orderStatus === 'Order Placed' && order.statusHistory.length === 1);
check('server computed totals', order.total > 0 && order.items.length === 2 && order.paymentStatus === 'Pending');
check('stock reserved (-2 kg)', (await call('GET', `/products/${toor._id}`)).data.stock === stockBefore - 2);
check('cart emptied after order', (await call('GET', '/cart', { token })).data.items.length === 0);
check('address saved to profile', (await call('GET', '/auth/profile', { token })).data.addresses.length === 1);
r = await call('GET', '/orders', { token });
check('my orders', r.data.length === 1 && r.data[0]._id === order._id);
r = await call('GET', `/orders/${order._id}`, { token });
check('order details', r.status === 200 && r.data.shippingAddress.pincode === '440001');

// second user must not see this order
const other = await call('POST', '/auth/register', { body: { name: 'Other User', email: `other${stamp}@example.com`, phone: '9876543211', password: 'Secret123' } });
check("other customer can't read the order", (await call('GET', `/orders/${order._id}`, { token: other.data.token })).status === 404);

await call('POST', '/cart', { token, body: { productId: toor._id, grams: 5000, quantity: 1 } });
const online = (await call('POST', '/orders', { token, body: { shippingAddress: address, paymentMethod: 'online' } })).data;
check('online placeholder order stays Pending', online.paymentMethod === 'online' && online.paymentStatus === 'Pending' && online.paymentProvider === 'placeholder');
r = await call('PUT', `/orders/${online._id}/cancel`, { token });
check('customer cancels early order', r.status === 200 && r.data.orderStatus === 'Cancelled');
check('cancel restores stock', (await call('GET', `/products/${toor._id}`)).data.stock === stockBefore - 2);
check('cannot change a cancelled order', (await call('PUT', `/orders/${online._id}/status`, { token, body: { status: 'Confirmed' } })).status === 403);

section('Reviews (before delivery)');
r = await call('POST', '/reviews', { token, body: { productId: toor._id, rating: 5, comment: 'Wonderful dal' } });
check('cannot review before delivery -> 403', r.status === 403);
check('review validation', (await call('POST', '/reviews', { token, body: { productId: toor._id, rating: 9, comment: 'x' } })).status === 422);

section('Admin');
r = await call('POST', '/auth/login', { body: { email: 'admin@naturalharvest.com', password: process.env.ADMIN_PASSWORD || 'ChangeMe@123' } });
const admin = r.data.token;
check('admin login', r.status === 200 && r.data.user.role === 'admin');
r = await call('GET', '/admin/stats', { token: admin });
check('dashboard stats', r.status === 200 && r.data.totalOrders > 50 && r.data.totalSales > 0 && r.data.daily.length === 30 && r.data.monthly.length === 12, JSON.stringify(r.data).slice(0, 200));
check('stats: top products + low stock + status split', r.data.topProducts.length > 0 && r.data.lowStockProducts.length > 0 && r.data.ordersByStatus.length > 0);

r = await call('POST', '/categories', { token: admin, body: { name: `Test Category ${stamp}`, description: 'temp' } });
check('create category', r.status === 201 && r.data.slug.startsWith('test-category'));
const cat = r.data;
check('duplicate category -> 409', (await call('POST', '/categories', { token: admin, body: { name: cat.name } })).status === 409);
r = await call('PUT', `/categories/${cat._id}`, { token: admin, body: { description: 'updated' } });
check('edit category', r.data.description === 'updated');

r = await call('POST', '/products', { token: admin, body: { name: `Test Lentil ${stamp}`, description: 'A test lentil', category: cat._id, price: 100, discountPrice: 150, stock: 50 } });
check('discount higher than price rejected', r.status === 422);
r = await call('POST', '/products', { token: admin, body: { name: `Test Lentil ${stamp}`, description: 'A test lentil', category: cat._id, price: 100, discountPrice: 80, stock: 50, isOrganic: true, images: ['https://example.com/a.jpg'], nutritionalInformation: { protein: 20, calories: 340 } } });
check('admin creates product', r.status === 201 && r.data.finalPrice === 80 && r.data.slug.startsWith('test-lentil'), JSON.stringify(r.data).slice(0, 200));
const prod = r.data;
check('customer cannot create product -> 403', (await call('POST', '/products', { token, body: { name: 'x' } })).status === 403);
r = await call('PUT', `/products/${prod._id}`, { token: admin, body: { price: 120, discountPrice: 0, stock: 9, isFeatured: true } });
check('admin edits price, stock, flags', r.status === 200 && r.data.finalPrice === 120 && r.data.stock === 9 && r.data.isFeatured === true, JSON.stringify(r.data).slice(0, 160));
check('category with products cannot be deleted', (await call('DELETE', `/categories/${cat._id}`, { token: admin })).status === 400);

r = await call('GET', '/admin/orders?search=Test Shopper', { token: admin });
check('admin order search by customer name', r.data.orders.some((o) => o._id === order._id));
r = await call('GET', `/admin/orders?search=${order.orderNumber}`, { token: admin });
check('admin order search by order number', r.data.total === 1);
r = await call('GET', '/admin/orders?status=Cancelled', { token: admin });
check('admin order filter by status', r.data.orders.length > 0 && r.data.orders.every((o) => o.orderStatus === 'Cancelled'));

for (const status of ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']) {
  r = await call('PUT', `/orders/${order._id}/status`, { token: admin, body: { status } });
  check(`status -> ${status}`, r.status === 200 && r.data.orderStatus === status, JSON.stringify(r.data).slice(0, 120));
}
r = await call('GET', `/orders/${order._id}`, { token });
check('customer sees full tracking timeline', r.data.statusHistory.length === 7 && r.data.orderStatus === 'Delivered');
check('COD marked Paid on delivery', r.data.paymentStatus === 'Paid');
check('invalid status -> 422', (await call('PUT', `/orders/${order._id}/status`, { token: admin, body: { status: 'Teleported' } })).status === 422);

section('Reviews (after delivery)');
r = await call('GET', `/reviews/eligibility/${toor._id}`, { token });
check('eligibility true after delivery', r.data.canReview === true);
const before = (await call('GET', `/products/${toor._id}`)).data;
r = await call('POST', '/reviews', { token, body: { productId: toor._id, rating: 1, comment: 'Test review, ignore' } });
check('create review', r.status === 201);
const after = (await call('GET', `/products/${toor._id}`)).data;
check('average rating + count recalculated', after.reviews === before.reviews + 1 && after.rating !== before.rating, `${before.rating}->${after.rating}`);
r = await call('POST', '/reviews', { token, body: { productId: toor._id, rating: 5, comment: 'Changed my mind, great.' } });
check('re-submitting edits instead of duplicating', (await call('GET', `/products/${toor._id}`)).data.reviews === before.reviews + 1);
r = await call('GET', '/reviews', { token: admin });
const mine = r.data.find((x) => x.comment.startsWith('Changed my mind'));
check('admin lists reviews', Boolean(mine));
check('featured reviews for home', (await call('GET', '/reviews/featured')).data.length > 0);
await call('DELETE', `/reviews/${mine._id}`, { token: admin });
check('admin deletes review and rating reverts', (await call('GET', `/products/${toor._id}`)).data.reviews === before.reviews);

r = await call('GET', '/admin/customers?search=tester', { token: admin });
check('admin customers list with stats', r.data.customers.length >= 1 && r.data.customers[0].orders >= 1, JSON.stringify(r.data).slice(0, 160));
const cust = r.data.customers[0];
check('customer detail + orders', (await call('GET', `/admin/customers/${cust._id}`, { token: admin })).data.orders.length >= 1);
r = await call('PUT', `/admin/customers/${cust._id}/active`, { token: admin, body: { isActive: false } });
check('deactivate customer', r.data.isActive === false);
check('deactivated customer blocked at login', (await call('POST', '/auth/login', { body: { email, password: 'Secret123' } })).status === 403);
await call('PUT', `/admin/customers/${cust._id}/active`, { token: admin, body: { isActive: true } });

r = await call('DELETE', `/products/${prod._id}`, { token: admin });
check('admin deletes product', r.status === 200);
check('deleted product -> 404', (await call('GET', `/products/${prod._id}`)).status === 404);
check('now category can be deleted', (await call('DELETE', `/categories/${cat._id}`, { token: admin })).status === 200);

section('Uploads, newsletter, contact');
r = await call('GET', '/uploads/status', { token: admin });
check('upload status reports Cloudinary config', r.status === 200 && typeof r.data.enabled === 'boolean');
check('newsletter subscribe', (await call('POST', '/newsletter', { body: { email: `news${stamp}@example.com` } })).status === 201);
check('newsletter invalid email -> 422', (await call('POST', '/newsletter', { body: { email: 'nope' } })).status === 422);
check('contact form', (await call('POST', '/contact', { body: { name: 'A', email: 'a@example.com', message: 'Do you deliver to Nagpur?' } })).status === 201);
check('admin sees contact message', (await call('GET', '/admin/messages', { token: admin })).data.length >= 1);
check('unknown route -> 404 JSON', (await call('GET', '/nope')).status === 404);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
