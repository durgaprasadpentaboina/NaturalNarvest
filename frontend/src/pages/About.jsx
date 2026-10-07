import { Link } from 'react-router-dom';
import { Droplets, HandHeart, Leaf, PackageCheck, ShieldCheck, Sprout, Recycle, Wheat } from 'lucide-react';
import FarmJourney from '../components/FarmJourney';
import Reveal from '../components/Reveal';
import useDocumentTitle from '../hooks/useDocumentTitle';

const PILLARS = [
  [Leaf, 'Naturally grown', 'Rain-fed fields and crop rotation. Our organic range is grown without synthetic pesticides.'],
  [HandHeart, 'Farmer sourced', 'We buy straight from farmers and cooperatives, and print the region on each pack.'],
  [Droplets, 'No unnecessary processing', 'No polish, no added colour, no preservatives. Pulses look like pulses.'],
  [ShieldCheck, 'Quality checked', 'Size, moisture, colour and foreign matter are checked on every lot.'],
  [PackageCheck, 'Hygienically packed', 'Cleaned, then sealed in food-grade packs in small batches.'],
  [Recycle, 'Sustainable farming', 'Pulses fix nitrogen in the soil, which is why they sit at the heart of crop rotation, and we buy rice from farms that rotate crops too.'],
  [Sprout, 'Fresh products', 'Current-season stock with a short time between harvest and your shelf.'],
  [Wheat, 'Healthy nutrition', 'Plant protein and fibre, with clear nutrition facts on every product page.'],
];

export default function About() {
  useDocumentTitle('Why NaturalHarvest?');
  return (
    <div>
      <section className="bg-leaf-900 py-16 text-oat-50 md:py-24"><div className="container-page max-w-4xl"><h1 className="!text-oat-50 text-4xl font-extrabold md:text-6xl">Why NaturalHarvest?</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-leaf-100/90">Pulses are the quiet backbone of the Indian kitchen. We think they should taste fresh, look honest and come from people you can trace.</p></div></section>
      <section className="container-page mt-16"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map(([Icon, t, d], i) => <Reveal key={t} delay={(i % 4) * 70} className="rounded-2xl bg-oat-100 p-6"><Icon className="h-8 w-8 text-leaf-700" aria-hidden /><h2 className="mt-4 text-lg font-bold">{t}</h2><p className="mt-1.5 text-[15px] leading-relaxed text-bark-600">{d}</p></Reveal>)}</div></section>
      <section className="container-page mt-24"><h2 className="mb-10 text-3xl font-bold md:text-4xl">The journey of every grain</h2><FarmJourney /></section>
      <section className="container-page mt-24 text-center"><h2 className="text-3xl font-bold">Taste the difference</h2><Link to="/products" className="btn btn-primary btn-lg mt-6">Shop the harvest</Link></section>
    </div>
  );
}
