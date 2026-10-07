import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Search, ShoppingBasket, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function MobileTabBar() {
  const { itemCount } = useCart();
  const tabs = [['/', Home, 'Home'], ['/categories', LayoutGrid, 'Categories'], ['/search', Search, 'Search'], ['/cart', ShoppingBasket, 'Cart'], ['/profile', User, 'Account']];
  return (
    <nav className="tabbar-safe fixed inset-x-0 bottom-0 z-40 border-t border-oat-200 bg-white/95 backdrop-blur md:hidden" aria-label="Mobile">
      <ul className="grid grid-cols-5">
        {tabs.map(([to, Icon, label]) => (
          <li key={to}>
            <NavLink to={to} end={to === '/'} className={({ isActive }) => `relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${isActive ? 'text-leaf-800' : 'text-bark-500'}`}>
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon className={`h-[22px] w-[22px] ${isActive ? 'stroke-[2.4]' : ''}`} />
                    {label === 'Cart' && itemCount > 0 && <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-turmeric-400 px-1 text-[10px] font-bold text-leaf-950">{itemCount}</span>}
                  </span>
                  {label}
                  {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-turmeric-500" />}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
