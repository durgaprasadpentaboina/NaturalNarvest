import { Heart, ShoppingBasket, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import { LinesSkeleton } from '../components/Skeletons';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { formatPrice } from '../utils/format';
import { productImage, withFallback } from '../utils/images';
import { getErrorMessage } from '../services';

export default function Wishlist() {
  useDocumentTitle('Wishlist');
  const { user } = useAuth();
  const { items, loading, remove } = useWishlist();
  const { addItem } = useCart();
  const toast = useToast();

  const moveToCart = async (p) => {
    const pack = p.weightOptions.find((w) => w.grams === 500) || p.weightOptions[0];
    try { await addItem(p, pack.grams, 1); await remove(p._id); toast.success(`${p.name} (${pack.label}) moved to your cart.`, { action: { label: 'View cart', to: '/cart' } }); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  if (!user) return <EmptyState icon={Heart} title="Log in to see your wishlist" message="Saved products are kept in your account so they are there on any device." actionLabel="Log in" actionTo="/login" />;
  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="mb-8 text-4xl font-bold">Wishlist</h1>
      {loading ? <LinesSkeleton /> : items.length === 0 ? <EmptyState icon={Heart} title="Your wishlist is empty" message="Tap the heart on any product to save it for later." actionLabel="Browse products" actionTo="/products" /> : (
        <ul className="space-y-4">
          {items.map((p) => (
            <li key={p._id} className="card flex flex-wrap items-center gap-4 p-4">
              <Link to={`/products/${p.slug}`}><img src={productImage(p)} onError={withFallback} alt="" className="h-20 w-20 rounded-xl object-cover" /></Link>
              <div className="min-w-0 flex-1"><Link to={`/products/${p.slug}`} className="font-display text-lg font-semibold hover:text-leaf-600">{p.name}</Link><p className="text-sm text-bark-600">{formatPrice(p.finalPrice ?? p.price)} / kg{p.stock <= 0 && ' · Out of stock'}</p></div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-primary btn-sm" disabled={p.stock <= 0} onClick={() => moveToCart(p)}><ShoppingBasket className="h-4 w-4" />Move to cart</button>
                <button type="button" className="btn btn-ghost btn-sm text-danger-600" onClick={() => remove(p._id)} aria-label={`Remove ${p.name}`}><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
