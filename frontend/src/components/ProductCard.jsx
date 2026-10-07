import { Link } from 'react-router-dom';
import { Heart, Leaf, ShoppingBasket } from 'lucide-react';
import RatingStars from './RatingStars';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, percentOff } from '../utils/format';
import { productImage, withFallback } from '../utils/images';
import { getErrorMessage } from '../services';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const saved = wishlist.has(product._id);
  const sale = product.finalPrice ?? product.price;
  const off = percentOff(product.price, product.discountPrice);
  const outOfStock = product.stock <= 0;
  const defaultPack = product.weightOptions?.find((w) => w.grams === 500) || product.weightOptions?.[0];

  const quickAdd = async () => {
    try {
      await addItem(product, defaultPack.grams, 1);
      toast.success(`${product.name} (${defaultPack.label}) added to your cart.`, { action: { label: 'View cart', to: '/cart' } });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-oat-100">
        <Link to={`/products/${product.slug}`} aria-label={product.name} className="block">
          <img
            src={productImage(product)}
            alt={product.name}
            loading="lazy"
            onError={withFallback}
            className={`aspect-square w-full object-cover transition duration-500 ease-out group-hover:scale-[1.06] ${outOfStock ? 'opacity-60 grayscale' : ''}`}
          />
        </Link>
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {off > 0 && !outOfStock && <span className="rounded-full bg-turmeric-400 px-2.5 py-1 text-xs font-bold text-leaf-950">{off}% off</span>}
          {product.isOrganic && (
            <span className="inline-flex items-center gap-1 rounded-full bg-leaf-800 px-2.5 py-1 text-xs font-semibold text-oat-50">
              <Leaf className="h-3 w-3" aria-hidden /> Organic
            </span>
          )}
          {outOfStock && <span className="rounded-full bg-bark-700 px-2.5 py-1 text-xs font-semibold text-oat-50">Out of stock</span>}
        </div>
        <button
          type="button"
          onClick={() => wishlist.toggle(product)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-leaf-800 shadow-soft transition hover:scale-110 hover:bg-white"
        >
          <Heart className={`h-[18px] w-[18px] transition ${saved ? 'fill-danger-500 text-danger-500' : ''}`} />
        </button>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-[13px] text-bark-500">{product.category?.name}{product.type && product.type !== product.category?.name ? `, ${product.type}` : ''}</p>
        <h3 className="mt-0.5 font-display text-[1.05rem] font-semibold leading-snug">
          <Link to={`/products/${product.slug}`} className="hover:text-leaf-600">{product.name}</Link>
        </h3>
        <div className="mt-1.5"><RatingStars value={product.rating} count={product.reviews} size="h-3.5 w-3.5" /></div>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-leaf-900">{formatPrice(sale)}</span>
          <span className="text-[13px] text-bark-500">/ kg</span>
          {off > 0 && <span className="text-sm text-bark-400 line-through">{formatPrice(product.price)}</span>}
        </p>
        <button type="button" onClick={quickAdd} disabled={outOfStock} className="btn btn-outline btn-sm mt-3 w-full">
          <ShoppingBasket className="h-4 w-4" aria-hidden />
          {outOfStock ? 'Out of stock' : `Add ${defaultPack?.label}`}
        </button>
      </div>
    </article>
  );
}

export function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => <ProductCard key={p._id} product={p} />)}
    </div>
  );
}
