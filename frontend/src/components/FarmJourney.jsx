import { Home, PackageCheck, Sprout, Droplets, ClipboardCheck } from 'lucide-react';
import Reveal from './Reveal';

const STEPS = [
  [Sprout, 'Farm', 'Grown in rain-fed fields by farmers we buy from directly.'],
  [ClipboardCheck, 'Quality check', 'Every lot is checked for size, colour, moisture and foreign matter.'],
  [Droplets, 'Cleaning', 'Hand-sieved and stone-checked, with no polish or colour added.'],
  [PackageCheck, 'Packaging', 'Sealed in food-grade packs in small batches.'],
  [Home, 'Customer', 'Dispatched to your door, usually within a few days.'],
];

export default function FarmJourney() {
  return (
    <Reveal>
      <ol className="relative grid gap-8 md:grid-cols-5 md:gap-4">
        <span className="absolute left-[1.65rem] top-6 h-[calc(100%-3rem)] w-0.5 origin-top scale-y-0 bg-leaf-300 transition-transform duration-[1600ms] group-[.is-visible]:scale-y-100 md:hidden" aria-hidden />
        <span className="absolute left-[10%] top-[1.65rem] hidden h-0.5 w-[80%] origin-left scale-x-0 bg-leaf-300 transition-transform duration-[1600ms] group-[.is-visible]:scale-x-100 md:block" aria-hidden />
        {STEPS.map(([Icon, title, text]) => (
          <li key={title} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
            <span className="relative z-10 flex h-[3.4rem] w-[3.4rem] shrink-0 items-center justify-center rounded-full bg-leaf-800 text-turmeric-300 shadow-soft"><Icon className="h-6 w-6" aria-hidden /></span>
            <div><h3 className="text-base font-bold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-bark-600">{text}</p></div>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
