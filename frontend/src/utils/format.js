const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatPrice = (n = 0) => inr.format(Math.round(n));
// Totals can include paise (tax), so show two decimals only when needed
export const formatMoney = (n = 0) => (Number.isInteger(n) ? inr.format(n) : inr2.format(n));

export const formatDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  d ? new Intl.DateTimeFormat('en-IN', opts).format(new Date(d)) : '';
export const formatDateTime = (d) =>
  d ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(d)) : '';

export const percentOff = (price, discountPrice) =>
  discountPrice && discountPrice < price ? Math.round(((price - discountPrice) / price) * 100) : 0;

export const kg = (n) => `${Number.isInteger(n) ? n : n.toFixed(1)} kg`;

export const deliveryWindow = (minDays = 3, maxDays = 6) => {
  const a = new Date();
  a.setDate(a.getDate() + minDays);
  const b = new Date();
  b.setDate(b.getDate() + maxDays);
  const fmt = { day: 'numeric', month: 'short' };
  return `${formatDate(a, fmt)} to ${formatDate(b, fmt)}`;
};

export const compactNumber = (n) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
