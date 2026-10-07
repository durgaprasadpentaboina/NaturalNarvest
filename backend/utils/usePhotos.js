// Links your own photos to products and categories.
// Put files in frontend/public/products/<slug>.jpg (and optionally <slug>-2.jpg) and
// frontend/public/categories/<slug>.jpg, then run:  npm run use-photos
// Accepts jpg, jpeg, png, webp, avif. Safe to run again whenever you add more photos.
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const pub = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/public');
const EXT = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
const find = (folder, name) => {
  const ext = EXT.find((e) => fs.existsSync(path.join(pub, folder, `${name}.${e}`)));
  return ext ? `/${folder}/${name}.${ext}` : null;
};

await connectDB();
let products = 0;
const missing = [];
for (const p of await Product.find()) {
  const imgs = [find('products', p.slug), find('products', `${p.slug}-2`), find('products', `${p.slug}-3`)].filter(Boolean);
  if (!imgs.length) { missing.push(p.slug); continue; }
  p.images = imgs;
  await p.save();
  products += 1;
}
for (const c of await Category.find()) {
  const img = find('categories', c.slug);
  if (img) { c.image = img; await c.save(); console.log('category photo ->', c.name, img); } else missing.push(`categories/${c.slug}`);
}
console.log(`Linked photos for ${products} products.`);
if (missing.length) console.log('Still waiting for photos named:\n  ' + missing.join('\n  '));
await mongoose.disconnect();
