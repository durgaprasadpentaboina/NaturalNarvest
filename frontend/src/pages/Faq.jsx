import { ChevronDown } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const FAQS = [
  ['How long does delivery take?', 'Most orders arrive in 3 to 6 days. The product page shows an estimated window for today.'],
  ['What does delivery cost?', 'Delivery is free on orders of ₹500 or more after discounts. Below that, a flat ₹49 applies.'],
  ['Can I pay on delivery?', 'Yes. Cash on delivery is available on every order. Online payment is being added.'],
  ['How do I track my order?', 'Open My orders after logging in. Each order has a step-by-step tracking timeline.'],
  ['Can I cancel an order?', 'Yes, from the order page while it is still Order Placed or Confirmed. After that, please contact us.'],
  ['What does "organic" mean here?', 'Products marked Organic come from farms that follow organic practices and carry the Organic tag. Other products are grown with natural farming methods.'],
  ['How should I store pulses?', 'Keep them in an airtight container in a cool, dry place away from sunlight. Each product page lists specific storage tips.'],
  ['When can I review a product?', 'Once an order that includes the product has been delivered.'],
];

export default function Faq() {
  useDocumentTitle('FAQ');
  return (
    <div className="container-page max-w-3xl py-10 md:py-16">
      <h1 className="text-4xl font-bold">Frequently asked questions</h1>
      <div className="mt-8 divide-y divide-oat-200 rounded-2xl border border-oat-200 bg-white">
        {FAQS.map(([q, a]) => (
          <details key={q} className="group p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold"><span>{q}</span><ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" /></summary><p className="mt-3 leading-relaxed text-bark-700">{a}</p></details>
        ))}
      </div>
    </div>
  );
}
