// Single source of truth for price maths. Prices on a Product are per 1 kg.
export const FREE_SHIPPING_THRESHOLD = 500; // INR, applied on the discounted subtotal
export const FLAT_SHIPPING_FEE = 49;
export const TAX_RATE = 0.05; // 5% GST on packaged goods
export const LOW_STOCK_THRESHOLD = 20; // kg

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const salePricePerKg = (product) =>
  product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
    ? product.discountPrice
    : product.price;

export const linePrices = (product, grams) => ({
  mrp: Math.round((product.price * grams) / 1000),
  price: Math.round((salePricePerKg(product) * grams) / 1000),
});

export function calculateTotals(lines) {
  const subtotal = lines.reduce((s, l) => s + l.mrp * l.quantity, 0);
  const sale = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const discount = subtotal - sale;
  const shipping = sale === 0 || sale >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const tax = round2(sale * TAX_RATE);
  const total = round2(sale + shipping + tax);
  return { subtotal, discount, shipping, tax, total };
}

export const kgNeeded = (grams, quantity) => (grams * quantity) / 1000;
