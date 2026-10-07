import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';

const col = 'space-y-2.5 text-sm text-leaf-100/80';
const a = 'transition hover:text-turmeric-300';

export default function Footer() {
  return (
    <footer className="mt-24 bg-leaf-900 text-oat-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-leaf-100/80">Pure from Nature, Healthy for Life. Pulses and rice from farmers we know by name.</p>
        </div>
        <div>
          <h3 className="mb-3 font-display text-base font-semibold text-oat-50">Shop</h3>
          <ul className={col}>
            {[['Pulses', 'pulses'], ['Rice', 'rice']].map(([n, s]) => <li key={s}><Link className={a} to={`/category/${s}`}>{n}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-base font-semibold text-oat-50">Help</h3>
          <ul className={col}>
            {[['/about', 'Why NaturalHarvest'], ['/faq', 'FAQ'], ['/contact', 'Contact us'], ['/orders', 'Track an order'], ['/wishlist', 'Wishlist']].map(([to, n]) => <li key={to}><Link className={a} to={to}>{n}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-base font-semibold text-oat-50">Get in touch</h3>
          <ul className={col}>
            <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" />hello@naturalharvest.in</li>
            <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" />+91 98765 43210</li>
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />Kamareddy, Telangana, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[13px] text-leaf-100/60">© {new Date().getFullYear()} NaturalHarvest. Nutrition values are typical averages and not medical advice.</div>
    </footer>
  );
}
