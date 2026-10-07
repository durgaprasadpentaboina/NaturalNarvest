import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileTabBar from '../components/MobileTabBar';

export default function MainLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0 }); }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-leaf-900 focus:px-4 focus:py-2 focus:text-oat-50">Skip to content</a>
      <Navbar />
      <main id="main" key={pathname} className="page-enter pb-safe flex-1 md:pb-0"><Outlet /></main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
