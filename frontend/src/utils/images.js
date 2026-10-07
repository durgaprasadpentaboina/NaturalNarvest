
import { PLACEHOLDER_IMG } from './constants';

const imageMap = {
  'Masoor Dal': '/products/toor-dal.jpg',
  'Sona Masuri Rice': '/products/normalrice.jpg',
  'Kidney Beans (Rajma)': '/products/Chickpeas.jpg',
  'Kolam Rice': '/products/normalrice.jpg',
  'Black Rice': '/products/blackrice.jpg',
  'Mixed Organic Pulses': '/products/greengram.jpg',
  'Idli Rice (Parboiled)': '/products/normalrice.jpg',
  'Poha (Flattened Rice)': '/products/normalrice.jpg',
  'White Chickpeas (Kabuli Chana)': '/products/Chickpeas.jpg',
  'Organic Basmati Rice': '/products/basmathi.jpg',
  'Black Chickpeas (Kala Chana)': '/products/blackgram.jpg',
  'Brown Rice': '/products/brown.jpg',
  'Toor Dal': '/products/toor-dal.jpg',
  'Green Gram': '/products/greengram.jpg',
  'Yellow Moong Dal': '/products/yellow-moong-dal.jpg',
};

export const productImage = (product, index = 0) => {
  if (product?.name && imageMap[product.name]) {
    return imageMap[product.name];
  }

  const image = product?.images?.[index];

  if (image && image.startsWith('/products/')) {
    const filename = image.split('/').pop();

    const existingImages = [
      'basmathi.jpg',
      'blackgram.jpg',
      'blackrice.jpg',
      'brown.jpg',
      'Chickpeas.jpg',
      'greengram.jpg',
      'normalrice.jpg',
      'toor-dal.jpg',
      'yellow-moong-dal.jpg',
    ];

    if (existingImages.includes(filename)) {
      return `/products/${filename}`;
    }
  }

  return PLACEHOLDER_IMG;
};

// onError handler: swap in the placeholder once, avoiding loops
export const withFallback = (e) => {
  if (e.currentTarget.dataset.fallback) return;

  e.currentTarget.dataset.fallback = '1';
  e.currentTarget.src = PLACEHOLDER_IMG;
};
