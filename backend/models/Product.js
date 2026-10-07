import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';
import { salePricePerKg } from '../utils/pricing.js';

const DEFAULT_WEIGHTS = [
  { label: '250 g', grams: 250 },
  { label: '500 g', grams: 500 },
  { label: '1 kg', grams: 1000 },
  { label: '2 kg', grams: 2000 },
  { label: '5 kg', grams: 5000 },
];

const weightSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    grams: { type: Number, required: true, min: 50 },
  },
  { _id: false }
);

const nutritionSchema = new mongoose.Schema(
  {
    servingSize: { type: String, default: '100 g' },
    calories: { type: Number, min: 0, default: 0 }, // kcal
    protein: { type: Number, min: 0, default: 0 }, // g
    carbohydrates: { type: Number, min: 0, default: 0 }, // g
    fiber: { type: Number, min: 0, default: 0 }, // g
    fat: { type: Number, min: 0, default: 0 }, // g
    iron: { type: Number, min: 0, default: 0 }, // mg
    calcium: { type: Number, min: 0, default: 0 }, // mg
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 120 },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: [true, 'Category is required'], index: true },
    type: { type: String, trim: true, default: '' }, // e.g. "Red Lentils", "Toor Dal"
    brand: { type: String, trim: true, default: 'NaturalHarvest' },
    tags: [{ type: String, trim: true, lowercase: true }],
    // Prices are per 1 kg, in INR
    price: { type: Number, required: [true, 'Price is required'], min: [1, 'Price must be greater than 0'] },
    discountPrice: {
      type: Number,
      min: 0,
      default: 0,
      validate: {
        validator(value) {
          return !value || value < this.price;
        },
        message: 'Discount price must be lower than the regular price',
      },
    },
    finalPrice: { type: Number, index: true }, // derived: what the customer pays per kg
    images: [{ type: String }],
    weightOptions: { type: [weightSchema], default: DEFAULT_WEIGHTS },
    stock: { type: Number, required: [true, 'Stock is required'], min: [0, 'Stock cannot be negative'], default: 0 }, // in kg
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 }, // number of reviews
    sold: { type: Number, default: 0, min: 0 }, // units sold, drives "best selling"
    origin: { type: String, trim: true, default: '' },
    farmingMethod: { type: String, trim: true, default: 'Natural farming' },
    isOrganic: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    benefits: [{ type: String, trim: true }],
    nutritionalInformation: { type: nutritionSchema, default: () => ({}) },
    storageInstructions: {
      type: String,
      default: 'Store in a cool, dry place in an airtight container, away from direct sunlight.',
    },
  },
  { timestamps: true }
);

productSchema.pre('validate', async function prepare(next) {
  if (!this.slug || this.isModified('name')) {
    const base = slugify(this.name);
    let candidate = base;
    let n = 1;
    // keep slugs unique without clobbering our own document
    // eslint-disable-next-line no-await-in-loop
    while (await this.constructor.exists({ slug: candidate, _id: { $ne: this._id } })) {
      n += 1;
      candidate = `${base}-${n}`;
    }
    this.slug = candidate;
  }
  this.finalPrice = salePricePerKg(this);
  next();
});

productSchema.index({ name: 'text', brand: 'text', type: 'text' });

export { DEFAULT_WEIGHTS };
export default mongoose.model('Product', productSchema);
