import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cartService } from '../services';
import { useAuth } from './AuthContext';
import { calculateTotals, kgNeeded, maxQuantityFor, priceForWeight } from '../utils/pricing';

const CartContext = createContext(null);
const GUEST_KEY = 'nh_guest_cart';

const snapshot = (p) => ({
  _id: p._id, name: p.name, slug: p.slug, images: p.images, stock: p.stock, price: p.price,
  discountPrice: p.discountPrice, weightOptions: p.weightOptions, isOrganic: p.isOrganic,
});

const readGuest = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
  } catch {
    return [];
  }
};
const writeGuest = (lines) => localStorage.setItem(GUEST_KEY, JSON.stringify(lines));

// Guest lines -> same shape the API returns, so the UI has one code path
const normalizeGuest = (lines) =>
  lines
    .filter((l) => l.product?.weightOptions?.some((w) => w.grams === l.grams))
    .map((l) => {
      const { mrp, price } = priceForWeight(l.product, l.grams);
      return {
        _id: l.id, product: l.product, grams: l.grams, quantity: l.quantity, mrp, price,
        weightLabel: l.product.weightOptions.find((w) => w.grams === l.grams).label,
        inStock: kgNeeded(l.grams, l.quantity) <= l.product.stock,
      };
    });

const EMPTY = { items: [], totals: calculateTotals([]) };

export function CartProvider({ children }) {
  const { user, initializing } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [bump, setBump] = useState(0);
  const mergedFor = useRef(null);

  const setFromGuest = useCallback((lines) => {
    const items = normalizeGuest(lines);
    setCart({ items, totals: calculateTotals(items) });
  }, []);

  const refresh = useCallback(async () => {
    if (user) setCart(await cartService.get());
    else setFromGuest(readGuest());
  }, [user, setFromGuest]);

  // Load the right cart whenever the session changes; merge the guest cart on login
  useEffect(() => {
    if (initializing) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (user) {
          const guest = readGuest();
          if (guest.length && mergedFor.current !== user._id) {
            mergedFor.current = user._id;
            // eslint-disable-next-line no-restricted-syntax
            for (const l of guest) {
              try {
                // eslint-disable-next-line no-await-in-loop
                await cartService.add({ productId: l.product._id, grams: l.grams, quantity: l.quantity });
              } catch {
                /* skip lines that are no longer purchasable */
              }
            }
            localStorage.removeItem(GUEST_KEY);
          }
          if (!cancelled) setCart(await cartService.get());
        } else {
          mergedFor.current = null;
          if (!cancelled) setFromGuest(readGuest());
        }
      } catch {
        if (!cancelled) setCart(EMPTY);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, initializing, setFromGuest]);

  const addItem = useCallback(
    async (product, grams, quantity = 1) => {
      if (user) {
        setCart(await cartService.add({ productId: product._id, grams, quantity }));
      } else {
        const lines = readGuest();
        const id = `${product._id}-${grams}`;
        const existing = lines.find((l) => l.id === id);
        const nextQty = Math.min((existing?.quantity || 0) + quantity, 50);
        if (nextQty > maxQuantityFor(product, grams)) {
          throw new Error(product.stock <= 0 ? `${product.name} is out of stock.` : `Only ${product.stock} kg of ${product.name} is available.`);
        }
        if (existing) existing.quantity = nextQty;
        else lines.push({ id, product: snapshot(product), grams, quantity: nextQty });
        writeGuest(lines);
        setFromGuest(lines);
      }
      setBump((b) => b + 1);
    },
    [user, setFromGuest]
  );

  const updateItem = useCallback(
    async (id, patch) => {
      if (user) {
        setCart(await cartService.update(id, patch));
        return;
      }
      let lines = readGuest();
      const line = lines.find((l) => l.id === id);
      if (!line) return;
      const grams = patch.grams ?? line.grams;
      const quantity = patch.quantity ?? line.quantity;
      const twin = lines.find((l) => l.id !== id && l.product._id === line.product._id && l.grams === grams);
      const finalQty = Math.min(quantity + (twin?.quantity || 0), 50);
      if (finalQty > maxQuantityFor(line.product, grams)) throw new Error(`Only ${line.product.stock} kg of ${line.product.name} is available.`);
      if (twin) {
        twin.quantity = finalQty;
        lines = lines.filter((l) => l.id !== id);
      } else {
        line.grams = grams;
        line.quantity = finalQty;
        line.id = `${line.product._id}-${grams}`;
      }
      writeGuest(lines);
      setFromGuest(lines);
    },
    [user, setFromGuest]
  );

  const removeItem = useCallback(
    async (id) => {
      if (user) {
        setCart(await cartService.remove(id));
        return;
      }
      const lines = readGuest().filter((l) => l.id !== id);
      writeGuest(lines);
      setFromGuest(lines);
    },
    [user, setFromGuest]
  );

  const clearLocal = useCallback(() => setCart(EMPTY), []);

  const value = useMemo(
    () => ({
      items: cart.items,
      totals: cart.totals,
      itemCount: cart.items.reduce((n, i) => n + i.quantity, 0),
      loading, bump, addItem, updateItem, removeItem, refresh, clearLocal,
    }),
    [cart, loading, bump, addItem, updateItem, removeItem, refresh, clearLocal]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
