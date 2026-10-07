// Mirrors backend/utils/pricing.js so guest carts show the same numbers the server will charge.
// Logged-in carts use the totals returned by the API; the server is always the source of truth.
export const FREE_SHIPPING_THRESHOLD = 500;
export const FLAT_SHIPPING_FEE = 49;
export const TAX_RATE = 0.05;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const salePricePerKg = (p) => (p.discountPrice > 0 && p.discountPrice < p.price ? p.discountPrice : p.price);

export const priceForWeight = (product, grams) => ({
  mrp: Math.round((product.price * grams) / 1000),
  price: Math.round((salePricePerKg(product) * grams) / 1000),
});

export function calculateTotals(lines) {
  const subtotal = lines.reduce((s, l) => s + l.mrp * l.quantity, 0);
  const sale = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const shipping = sale === 0 || sale >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const tax = round2(sale * TAX_RATE);
  return { subtotal, discount: subtotal - sale, shipping, tax, total: round2(sale + shipping + tax) };
}

export const kgNeeded = (grams, quantity) => (grams * quantity) / 1000;
export const maxQuantityFor = (product, grams) => Math.max(0, Math.min(50, Math.floor((product.stock * 1000) / grams)));
