import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { wishlistService, getErrorMessage } from '../services';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    wishlistService
      .get()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  const ids = useMemo(() => new Set(items.map((p) => p._id)), [items]);
  const has = useCallback((id) => ids.has(id), [ids]);

  const toggle = useCallback(
    async (product) => {
      if (!user) {
        toast.info('Log in to save products to your wishlist.', { action: { label: 'Log in', to: '/login' } });
        return false;
      }
      const wasSaved = ids.has(product._id);
      // optimistic update, rolled back if the API call fails
      setItems((cur) => (wasSaved ? cur.filter((p) => p._id !== product._id) : [...cur, product]));
      try {
        const next = wasSaved ? await wishlistService.remove(product._id) : await wishlistService.add(product._id);
        setItems(next);
        toast.success(wasSaved ? 'Removed from your wishlist.' : 'Saved to your wishlist.', wasSaved ? undefined : { action: { label: 'View wishlist', to: '/wishlist' } });
      } catch (err) {
        setItems((cur) => (wasSaved ? [...cur, product] : cur.filter((p) => p._id !== product._id)));
        toast.error(getErrorMessage(err));
      }
      return !wasSaved;
    },
    [user, ids, toast]
  );

  const remove = useCallback(
    async (productId) => {
      const prev = items;
      setItems((cur) => cur.filter((p) => p._id !== productId));
      try {
        setItems(await wishlistService.remove(productId));
      } catch (err) {
        setItems(prev);
        toast.error(getErrorMessage(err));
      }
    },
    [items, toast]
  );

  const value = useMemo(() => ({ items, loading, has, toggle, remove, count: items.length }), [items, loading, has, toggle, remove]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
