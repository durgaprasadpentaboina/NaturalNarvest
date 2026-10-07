import mongoose from 'mongoose';

export const ORDER_STATUSES = [
  'Order Placed',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    slug: String,
    image: String,
    weightLabel: { type: String, required: true },
    grams: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    mrp: { type: Number, required: true }, // per pack, before discount
    price: { type: Number, required: true }, // per pack, what the customer paid
    lineTotal: { type: Number }, // price x quantity, stored so reports can sum it directly
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    house: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    note: String,
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], validate: [(v) => v.length > 0, 'An order needs at least one item'] },
    shippingAddress: { type: shippingSchema, required: true },
    paymentMethod: { type: String, enum: ['cod', 'online'], required: true },
    paymentProvider: { type: String, default: 'cod' },
    paymentReference: { type: String, default: null },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: 'Order Placed', index: true },
    statusHistory: [historySchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    shipping: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    deliveredAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre('validate', function setOrderNumber(next) {
  this.items.forEach((i) => {
    i.lineTotal = i.price * i.quantity;
  });
  if (!this.orderNumber) {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
    this.orderNumber = `NH-${stamp}${rand}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
