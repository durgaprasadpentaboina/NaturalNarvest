import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBasket,
  User,
} from 'lucide-react';

import Logo from './Logo';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const links = [
  ['/', 'Home'],
  ['/products', 'Shop'],
  ['/categories', 'Categories'],
  ['/about', 'Why NaturalHarvest'],
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, bump } = useCart();
  const wishlist = useWishlist();
  const navigate = useNavigate();

  const [menu, setMenu] = useState(false);
  const [bumping, setBumping] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuRef = useRef(null);

  /* --------------------------------
     Detect page scroll
  -------------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /* --------------------------------
     Cart bump animation
  -------------------------------- */
  useEffect(() => {
    if (!bump) return undefined;

    setBumping(true);

    const t = setTimeout(() => {
      setBumping(false);
    }, 500);

    return () => clearTimeout(t);
  }, [bump]);

  /* --------------------------------
     Close user menu outside click
  -------------------------------- */
  useEffect(() => {
    const close = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenu(false);
      }
    };

    document.addEventListener('mousedown', close);

    return () => {
      document.removeEventListener('mousedown', close);
    };
  }, []);

  const iconBtn =
    'relative flex h-11 w-11 items-center justify-center rounded-full text-leaf-900 transition-all duration-300 hover:bg-leaf-100 hover:scale-105';

  const badge =
    'absolute -right-0.5 -top-0.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-turmeric-400 px-1 text-[11px] font-bold text-leaf-950';

  return (
    <header
      className={`
        fixed left-1/2 z-40 w-[100%] -translate-x-1/2
        transition-all duration-500 ease-out
        ${
          scrolled
            ? 'top-4 rounded-2xl border border-white/40 bg-oat-50/75 shadow-2xl backdrop-blur-xl'
            : 'top-0 rounded-none border-b border-oat-200 bg-oat-50/95'
        }
      `}
    >
      <div
        className={`
          container-page flex items-center
          transition-all duration-500
          ${
            scrolled
              ? 'h-[76px] px-5 lg:px-7'
              : 'h-20 px-3'
          }
          gap-5 lg:gap-10
        `}
      >

        {/* Logo */}
        <div className="shrink-0 scale-105 lg:scale-110">
          <Logo />
        </div>

        {/* Navigation */}
        <nav
          className="hidden items-center gap-2 lg:flex"
          aria-label="Main"
        >
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `
                rounded-full px-4 py-2.5
                text-[15px] font-semibold
                transition-all duration-300
                ${
                  isActive
                    ? 'bg-leaf-100 text-leaf-900 shadow-sm'
                    : 'text-leaf-800 hover:bg-leaf-50 hover:text-leaf-950 hover:-translate-y-0.5'
                }
                `
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Search */}
        <div className="mx-auto hidden max-w-lg flex-1 md:block">
          <SearchBar />
        </div>

        {/* Right section */}
        <div className="ml-auto flex items-center gap-2 md:ml-0">

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className={iconBtn}
            aria-label={`Wishlist, ${wishlist.count} items`}
          >
            <Heart className="h-5 w-5" />

            {wishlist.count > 0 && (
              <span className={badge}>
                {wishlist.count}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className={`
              ${iconBtn}
              hidden md:flex
              ${bumping ? 'animate-bump' : ''}
            `}
            aria-label={`Cart, ${itemCount} items`}
          >
            <ShoppingBasket className="h-5 w-5" />

            {itemCount > 0 && (
              <span className={badge}>
                {itemCount}
              </span>
            )}
          </Link>

          {/* User */}
          <div
            className="relative hidden md:block"
            ref={menuRef}
          >
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setMenu((m) => !m)}
                  aria-haspopup="menu"
                  aria-expanded={menu}
                  className="
                    flex h-11 items-center gap-2
                    rounded-full
                    bg-leaf-800
                    pl-1.5 pr-4
                    text-sm font-semibold
                    text-oat-50
                    shadow-md
                    transition-all duration-300
                    hover:bg-leaf-700
                    hover:shadow-lg
                    hover:-translate-y-0.5
                  "
                >
                  <span
                    className="
                      flex h-9 w-9
                      items-center justify-center
                      rounded-full
                      bg-turmeric-400
                      text-leaf-950
                      font-bold
                    "
                  >
                    {user.name[0].toUpperCase()}
                  </span>

                  <span className="max-w-[8rem] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {menu && (
                  <div
                    role="menu"
                    className="
                      absolute right-0 mt-3
                      w-60
                      animate-fade-in
                      overflow-hidden
                      rounded-2xl
                      border border-white/50
                      bg-white/90
                      py-2
                      shadow-2xl
                      backdrop-blur-xl
                    "
                  >
                    {[
                      ['/profile', User, 'My profile'],
                      ['/orders', Package, 'My orders'],
                      ['/wishlist', Heart, 'Wishlist'],
                    ].map(([to, Icon, label]) => (
                      <Link
                        key={to}
                        to={to}
                        role="menuitem"
                        onClick={() => setMenu(false)}
                        className="
                          flex items-center gap-3
                          px-5 py-3
                          text-sm font-medium
                          transition
                          hover:bg-oat-100
                        "
                      >
                        <Icon className="h-4 w-4 text-leaf-600" />
                        {label}
                      </Link>
                    ))}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        role="menuitem"
                        onClick={() => setMenu(false)}
                        className="
                          flex items-center gap-3
                          px-5 py-3
                          text-sm font-medium
                          hover:bg-oat-100
                        "
                      >
                        <LayoutDashboard className="h-4 w-4 text-leaf-600" />
                        Admin dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setMenu(false);
                        navigate('/');
                      }}
                      className="
                        flex w-full items-center gap-3
                        border-t border-oat-200
                        px-5 py-3
                        text-left
                        text-sm font-medium
                        text-danger-600
                        hover:bg-danger-50
                      "
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn btn-ghost btn-sm"
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}