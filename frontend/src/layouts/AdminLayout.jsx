import { NavLink, Outlet, Link } from 'react-router-dom';
import { BarChart3, Boxes, ExternalLink, FolderTree, Inbox, MessageSquareText, ShoppingBag, Users } from 'lucide-react';
import { LogoMark } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const NAV = [
  ['/admin', BarChart3, 'Dashboard', true], ['/admin/products', Boxes, 'Products'], ['/admin/orders', ShoppingBag, 'Orders'],
  ['/admin/customers', Users, 'Customers'], ['/admin/categories', FolderTree, 'Categories'], ['/admin/reviews', MessageSquareText, 'Reviews'], ['/admin/messages', Inbox, 'Messages'],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const item = ({ isActive }) => `flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-turmeric-400 text-leaf-950' : 'text-leaf-100 hover:bg-white/10'}`;
  return (
    <div className="min-h-screen bg-oat-100 lg:flex">
      <aside className="bg-leaf-900 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block lg:px-5 lg:py-6">
          <Link to="/admin" className="flex items-center gap-2.5 font-display text-lg font-bold text-oat-50"><LogoMark className="h-8 w-8" />Admin</Link>
          <div className="flex items-center gap-3 text-sm lg:mt-6 lg:flex-col lg:items-start lg:gap-1">
            <Link to="/" className="inline-flex items-center gap-1.5 text-leaf-200 hover:text-white"><ExternalLink className="h-3.5 w-3.5" />View shop</Link>
            <button type="button" onClick={logout} className="text-leaf-200 hover:text-white">Log out ({user?.name.split(' ')[0]})</button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3" aria-label="Admin">
          {NAV.map(([to, Icon, label, end]) => <NavLink key={to} to={to} end={end} className={item}><Icon className="h-[18px] w-[18px]" />{label}</NavLink>)}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
    </div>
  );
}
