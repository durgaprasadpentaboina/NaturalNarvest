import { PLACEHOLDER_IMG } from './constants';

export const productImage = (product, index = 0) => product?.images?.[index] || PLACEHOLDER_IMG;

// onError handler: swap in the placeholder once, avoiding loops
export const withFallback = (e) => {
  if (e.currentTarget.dataset.fallback) return;
  e.currentTarget.dataset.fallback = '1';
  e.currentTarget.src = PLACEHOLDER_IMG;
};
