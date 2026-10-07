// Seed catalogue: Pulses and Rice only. Prices are INR per 1 kg; stock is in kg.
// Product photos are NOT stored here: put <slug>.jpg files in frontend/public/products and run `npm run use-photos`.
// Nutrition values are typical averages for dry, uncooked product per 100 g (rounded) and are
// indicative only. Replace with your lab-tested figures before publishing a real catalogue.

export const categorySeed = [
  { name: 'Pulses', description: 'Dals, chickpeas, rajma and whole pulses that anchor an Indian kitchen.' },
  { name: 'Rice', description: 'Basmati, brown, red, black and everyday rice, sorted and cleaned.' },
];

const n = (calories, protein, carbohydrates, fiber, fat, iron, calcium) => ({
  servingSize: '100 g', calories, protein, carbohydrates, fiber, fat, iron, calcium,
});

export const productSeed = [
  {
    name: 'Organic Toor Dal', category: 'Pulses', type: 'Toor Dal', price: 210, discountPrice: 179, stock: 420,
    origin: 'Latur, Maharashtra', farmingMethod: 'Certified organic', isOrganic: true, isFeatured: true, isBestSeller: true,
    description: 'Split pigeon peas from rain-fed organic farms in Latur. Cooks soft and creamy, with the mellow, nutty flavour that sambar and everyday dal tadka depend on. Cleaned by hand-sieving and stone-checked before packing.',
    benefits: ['Good source of plant protein', 'Source of dietary fibre', 'Cooks in about 25 minutes after soaking'],
    tags: ['arhar', 'tur', 'pigeon pea', 'dal', 'sambar'], nutrition: n(343, 22, 63, 15, 1.5, 5.2, 73),
  },
  {
    name: 'Premium Moong Dal', category: 'Pulses', type: 'Moong Dal', price: 190, discountPrice: 164, stock: 380,
    origin: 'Ujjain, Madhya Pradesh', farmingMethod: 'Natural farming', isOrganic: false, isFeatured: true, isBestSeller: true,
    description: 'Skinned and split green gram with a clean, sweet taste. Light on the stomach and quick to cook, which makes it the usual choice for khichdi, dal and halwa.',
    benefits: ['Cooks in 15 to 20 minutes', 'Good source of plant protein', 'Mild flavour that suits every spice level'],
    tags: ['mung', 'green gram', 'yellow moong', 'khichdi'], nutrition: n(347, 24, 59, 8, 1.2, 3.9, 75),
  },
  {
    name: 'Organic Urad Dal', category: 'Pulses', type: 'Urad Dal', price: 220, discountPrice: 189, stock: 260,
    origin: 'Sagar, Madhya Pradesh', farmingMethod: 'Certified organic', isOrganic: true, isFeatured: true, isBestSeller: false,
    description: 'Skinned black gram split into ivory halves. It grinds to a fluffy batter for idli and dosa and simmers into a rich, silky dal makhani base.',
    benefits: ['Ferments well for idli and dosa batter', 'Good source of plant protein', 'Source of iron'],
    tags: ['black gram', 'idli', 'dosa', 'dal makhani'], nutrition: n(347, 24, 59, 4, 1.6, 3.8, 154),
  },
  {
    name: 'Chana Dal', category: 'Pulses', type: 'Chana Dal', price: 120, discountPrice: 104, stock: 540,
    origin: 'Bundelkhand, Uttar Pradesh', farmingMethod: 'Natural farming', isOrganic: false, isFeatured: false, isBestSeller: true,
    description: 'Split and polished Bengal gram with a firm bite and a naturally sweet, earthy flavour. Works in dals, chutneys, stuffed parathas and sweet puran poli.',
    benefits: ['Holds its shape when cooked', 'Source of dietary fibre', 'Good source of plant protein'],
    tags: ['bengal gram', 'channa', 'puran poli'], nutrition: n(372, 21, 60, 11, 5.6, 5.3, 56),
  },
  {
    name: 'Masoor Dal', category: 'Pulses', type: 'Masoor Dal', price: 130, discountPrice: 112, stock: 460,
    origin: 'Vidisha, Madhya Pradesh', farmingMethod: 'Natural farming', isOrganic: false, isFeatured: false, isBestSeller: true,
    description: 'Salmon-orange split red lentils that melt into a smooth dal in about 15 minutes, with no soaking. A weeknight staple.',
    benefits: ['No soaking needed', 'Cooks in about 15 minutes', 'Good source of plant protein'],
    tags: ['red lentil', 'masur', 'quick cooking'], nutrition: n(343, 25, 59, 11, 1.1, 7.6, 69),
  },
  {
    name: 'Whole Green Moong', category: 'Pulses', type: 'Moong Whole', price: 175, discountPrice: 149, stock: 310,
    origin: 'Bikaner, Rajasthan', farmingMethod: 'Natural farming', isOrganic: false, isFeatured: true, isBestSeller: false,
    description: 'Whole green gram with the skin on, grown in sandy Rajasthan soil. Cook it as a rustic curry, or soak it overnight and sprout it for salads.',
    benefits: ['Sprouts in 24 to 36 hours', 'Source of dietary fibre', 'Good source of plant protein'],
    tags: ['green gram', 'sabut moong', 'sprouts'], nutrition: n(347, 24, 63, 16, 1.2, 6.7, 132),
  },
  {
    name: 'Whole Urad (Black Gram)', category: 'Pulses', type: 'Urad Whole', price: 205, discountPrice: 178, stock: 190,
    origin: 'Sagar, Madhya Pradesh', farmingMethod: 'Natural farming', isOrganic: false, isFeatured: false, isBestSeller: false,
    description: 'Whole black gram with its glossy black skin. Slow-cooked overnight it becomes the dark, creamy heart of dal makhani.',
    benefits: ['Good source of plant protein', 'Source of dietary fibre', 'Slow-cooks to a creamy texture'],
    tags: ['sabut urad', 'black gram', 'dal makhani'], nutrition: n(341, 25, 59, 18, 1.6, 7.6, 138),
  },
  {
    name: 'Black Chickpeas (Kala Chana)', category: 'Pulses', type: 'Chickpeas', price: 140, discountPrice: 119, stock: 350,
    origin: 'Nashik, Maharashtra', farmingMethod: 'Natural farming', isOrganic: false, isFeatured: false, isBestSeller: true,
    description: 'Small, dark desi chickpeas with a nutty, robust flavour and a firm texture. Ideal for kala chana curry, sundal and sprouted chaat.',
    benefits: ['Source of dietary fibre', 'Good source of plant protein', 'Sprouts well'],
    tags: ['kala chana', 'desi chana', 'chickpea'], nutrition: n(364, 19, 61, 17, 6, 6.2, 105),
  },
  {
    name: 'White Chickpeas (Kabuli Chana)', category: 'Pulses', type: 'Chickpeas', price: 165, discountPrice: 142, stock: 400,
    origin: 'Kota, Rajasthan', farmingMethod: 'Natural farming', isOrganic: false, isFeatured: true, isBestSeller: true,
    description: 'Large, creamy Kabuli chickpeas, graded for size. They go tender in the pot for chole, hummus and salads.',
    benefits: ['Large, evenly graded beans', 'Source of dietary fibre', 'Good source of plant protein'],
    tags: ['kabuli', 'chole', 'garbanzo', 'hummus'], nutrition: n(364, 19, 61, 17, 6, 4.3, 105),
  },
  {
    name: 'Kidney Beans (Rajma)', category: 'Pulses', type: 'Rajma', price: 195, discountPrice: 169, stock: 280,
    origin: 'Bhaderwah, Jammu & Kashmir', farmingMethod: 'Hill farming, rain-fed', isOrganic: false, isFeatured: true, isBestSeller: true,
    description: 'Mountain-grown red rajma with thin skins and a soft, floury centre. Soak overnight and pressure cook for classic rajma chawal.',
    benefits: ['Source of dietary fibre', 'Good source of plant protein', 'Soft, floury texture'],
    tags: ['rajma', 'red kidney', 'chitra'], nutrition: n(333, 24, 60, 25, 0.8, 8.2, 143),
  },
  {
    name: 'Mixed Organic Pulses', category: 'Pulses', type: 'Mixed Pulses', price: 205, discountPrice: 179, stock: 230,
    origin: 'Madhya Pradesh and Maharashtra', farmingMethod: 'Certified organic', isOrganic: true, isFeatured: true, isBestSeller: true,
    description: 'A blend of organic toor, moong, masoor and chana dal, mixed in even parts. Cook it as one pot for a layered, panchmel-style dal.',
    benefits: ['Four dals in one pack', 'Good source of plant protein', 'Certified organic'],
    tags: ['panchmel', 'mixed dal', 'blend'], nutrition: n(351, 23, 61, 11, 2, 5.5, 68),
  },
  {
    name: 'Aged Basmati Rice', category: 'Rice', type: 'Basmati Rice', price: 180, discountPrice: 159, stock: 300,
    origin: 'Dehradun, Uttarakhand', farmingMethod: 'Natural farming', isOrganic: false, isFeatured: true, isBestSeller: true,
    description: 'Long, slender grains that cook up fluffy and separate, with the aroma basmati is known for. Good for biryani, pulao and everyday meals.',
    benefits: ['Long grains that stay separate', 'Cooks in about 15 minutes', 'Sorted and cleaned'],
    tags: ['basmati', 'biryani', 'pulao'], nutrition: n(350, 7.5, 78, 1, 0.6, 0.8, 10),
  },
  {
    name: 'Organic Basmati Rice', category: 'Rice', type: 'Basmati Rice', price: 220, discountPrice: 195, stock: 180,
    origin: 'Karnal, Haryana', farmingMethod: 'Certified organic', isOrganic: true, isFeatured: true, isBestSeller: false,
    description: 'Certified organic basmati with extra-long grains and a gentle, nutty aroma. Rinse well and soak for 20 minutes for the best texture.',
    benefits: ['Certified organic', 'Long, slender grains', 'Cooks in about 15 minutes'],
    tags: ['basmati', 'organic', 'biryani'], nutrition: n(350, 7.5, 78, 1, 0.6, 0.8, 10),
  },
  {
    name: 'Sona Masuri Rice', category: 'Rice', type: 'Sona Masuri', price: 70, discountPrice: 62, stock: 600,
    origin: 'Guntur, Andhra Pradesh', farmingMethod: 'Natural farming', isOrganic: false, isFeatured: false, isBestSeller: true,
    description: 'A light, medium-grain rice that cooks soft without getting sticky. A daily staple for South Indian meals.',
    benefits: ['Light and soft when cooked', 'Everyday value', 'Sorted and cleaned'],
    tags: ['sona masoori', 'daily rice'], nutrition: n(350, 6.8, 78, 1, 0.5, 0.7, 10),
  },
  {
    name: 'Brown Rice', category: 'Rice', type: 'Brown Rice', price: 110, discountPrice: 96, stock: 250,
    origin: 'Palakkad, Kerala', farmingMethod: 'Natural farming', isOrganic: true, isFeatured: false, isBestSeller: false,
    description: 'Whole-grain rice with the bran left on, giving a nutty flavour and a chewy bite.',
    benefits: ['Whole grain with the bran intact', 'Source of dietary fibre', 'Nutty flavour'],
    tags: ['whole grain', 'unpolished'], nutrition: n(362, 7.5, 76, 3.4, 2.7, 1.5, 23),
  },
  {
    name: 'Red Rice', category: 'Rice', type: 'Red Rice', price: 130, discountPrice: 114, stock: 180,
    origin: 'Wayanad, Kerala', farmingMethod: 'Natural farming', isOrganic: true, isFeatured: false, isBestSeller: false,
    description: 'Unpolished red rice with an earthy taste and a firm texture. Good with curries and in kanji.',
    benefits: ['Unpolished grain', 'Source of dietary fibre', 'Earthy flavour'],
    tags: ['matta', 'unpolished'], nutrition: n(350, 7.5, 75, 2.5, 2, 2.4, 20),
  },
  {
    name: 'Black Rice', category: 'Rice', type: 'Black Rice', price: 320, discountPrice: 279, stock: 8,
    origin: 'Manipur', farmingMethod: 'Natural farming', isOrganic: true, isFeatured: false, isBestSeller: false,
    description: 'A deep purple-black whole-grain rice with a mildly sweet, nutty flavour. Often used in puddings and bowls.',
    benefits: ['Whole grain', 'Source of dietary fibre', 'Striking colour'],
    tags: ['chak-hao', 'forbidden rice'], nutrition: n(356, 8.5, 75, 3.5, 3.5, 3.5, 20),
  },
  {
    name: 'Idli Rice (Parboiled)', category: 'Rice', type: 'Parboiled Rice', price: 65, discountPrice: 58, stock: 400,
    origin: 'Thanjavur, Tamil Nadu', farmingMethod: 'Natural farming', isOrganic: false, isFeatured: false, isBestSeller: false,
    description: 'Short, parboiled rice that grinds well with urad dal for soft idli and crisp dosa.',
    benefits: ['Grinds smoothly for batter', 'Everyday value', 'Sorted and cleaned'],
    tags: ['idli', 'dosa', 'parboiled'], nutrition: n(355, 7, 78, 1.5, 0.6, 1, 10),
  },
  {
    name: 'Poha (Flattened Rice)', category: 'Rice', type: 'Flattened Rice', price: 95, discountPrice: 84, stock: 0,
    origin: 'Indore, Madhya Pradesh', farmingMethod: 'Natural farming', isOrganic: false, isFeatured: false, isBestSeller: false,
    description: 'Thick, evenly flattened rice flakes that soften in minutes. Makes a light breakfast of poha with onion, peanuts and curry leaves.',
    benefits: ['Ready in about 10 minutes', 'Light and easy to cook', 'Sorted and cleaned'],
    tags: ['poha', 'aval', 'breakfast'], nutrition: n(346, 6.6, 77, 1.4, 1.2, 20, 20),
  },
  {
    name: 'Kolam Rice', category: 'Rice', type: 'Kolam Rice', price: 85, discountPrice: 74, stock: 320,
    origin: 'Nagpur, Maharashtra', farmingMethod: 'Natural farming', isOrganic: false, isFeatured: false, isBestSeller: false,
    description: 'Small, soft-cooking grains with a light aroma, popular for everyday meals, khichdi and pulao.',
    benefits: ['Soft, fluffy texture', 'Quick to cook', 'Sorted and cleaned'],
    tags: ['kolam', 'daily rice', 'khichdi'], nutrition: n(350, 7, 78, 1, 0.6, 0.8, 10),
  },
];
