import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, Leaf, MapPin, PackageSearch, Snowflake, Sprout, Truck, Check } from 'lucide-react';
import { DetailSkeleton } from '../components/Skeletons';
import EmptyState, { ErrorState } from '../components/EmptyState';
import RatingStars, { RatingInput } from '../components/RatingStars';
import QuantityStepper from '../components/QuantityStepper';
import NutritionCard from '../components/NutritionCard';
import { ProductGrid } from '../components/ProductCard';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productService, reviewService, getErrorMessage } from '../services';
import { deliveryWindow, formatDate, formatMoney, percentOff } from '../utils/format';
import { maxQuantityFor, priceForWeight } from '../utils/pricing';
import { productImage, withFallback } from '../utils/images';

function Reviews({ product, onChanged }) {
  const { user } = useAuth();
  const toast = useToast();
  const reviews = useAsync(() => productService.reviews(product._id), [product._id, product.reviews]);
  const elig = useAsync(() => (user ? reviewService.eligibility(product._id) : Promise.resolve(null)), [product._id, user?._id]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (elig.data?.existing) { setRating(elig.data.existing.rating); setComment(elig.data.existing.comment); } }, [elig.data]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await reviewService.create({ productId: product._id, rating, comment }); toast.success('Thanks, your review is live.'); onChanged(); elig.reload(); }
    catch (err) { toast.error(getErrorMessage(err)); } finally { setBusy(false); }
  };
  const list = reviews.data?.reviews || [];
  const max = Math.max(1, ...(reviews.data?.breakdown || []).map((b) => b.count));

  return (
    <section id="reviews" className="scroll-mt-32">
      <h2 className="text-2xl font-bold">Customer reviews</h2>
      <div className="mt-6 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <div>
          <p className="font-display text-5xl font-extrabold">{product.rating ? product.rating.toFixed(1) : '–'}</p>
          <RatingStars value={product.rating} count={product.reviews} />
          <ul className="mt-4 space-y-1.5">
            {(reviews.data?.breakdown || []).map((b) => (
              <li key={b.star} className="flex items-center gap-2 text-sm"><span className="w-8 tabular-nums">{b.star} ★</span><span className="h-2 flex-1 overflow-hidden rounded-full bg-oat-200"><span className="block h-full bg-turmeric-400" style={{ width: `${(b.count / max) * 100}%` }} /></span><span className="w-6 text-right text-bark-500">{b.count}</span></li>
            ))}
          </ul>
          <div className="mt-6 rounded-2xl bg-oat-100 p-4">
            {!user ? <p className="text-sm text-bark-700"><Link className="link" to="/login">Log in</Link> to review products you have received.</p>
              : elig.data?.canReview ? (
                <form onSubmit={submit} className="space-y-3">
                  <p className="text-sm font-semibold">{elig.data.existing ? 'Update your review' : 'Write a review'}</p>
                  <RatingInput value={rating} onChange={setRating} />
                  <label htmlFor="rc" className="sr-only">Your comment</label>
                  <textarea id="rc" required minLength={3} rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="input" placeholder="How did it cook and taste?" />
                  <button className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Saving…' : 'Post review'}</button>
                </form>
              ) : <p className="text-sm text-bark-700">You can review this product after an order containing it has been delivered.</p>}
          </div>
        </div>
        <div>
          {reviews.loading ? <div className="skeleton h-32" /> : list.length === 0 ? <p className="rounded-2xl bg-oat-100 p-6 text-bark-700">No reviews yet. Be the first once your order arrives.</p> : (
            <ul className="divide-y divide-oat-200">
              {list.map((r) => (
                <li key={r._id} className="py-5 first:pt-0"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><RatingStars value={r.rating} /><span className="font-semibold">{r.user?.name}</span><span className="text-sm text-bark-500">{formatDate(r.createdAt)}</span></div><p className="mt-2 leading-relaxed">{r.comment}</p></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, loading, error, status, reload } = useAsync(() => productService.get(id), [id]);
  const { addItem } = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const [img, setImg] = useState(0);
  const [grams, setGrams] = useState(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  useDocumentTitle(product?.name);

  useEffect(() => {
    if (!product) return;
    setImg(0); setQty(1);
    const first = product.weightOptions.find((w) => w.grams === 1000 && maxQuantityFor(product, w.grams) > 0) || product.weightOptions.find((w) => maxQuantityFor(product, w.grams) > 0) || product.weightOptions[0];
    setGrams(first.grams);
  }, [product?._id]);

  if (loading) return <DetailSkeleton />;
  if (status === 404) return <EmptyState icon={PackageSearch} title="Product not found" message="This product may have been removed or the link is wrong." actionLabel="Browse products" actionTo="/products" />;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;

  const out = product.stock <= 0;
  const { mrp, price } = priceForWeight(product, grams || 1000);
  const off = percentOff(product.price, product.discountPrice);
  const maxQty = Math.max(1, maxQuantityFor(product, grams || 1000));
  const lowStock = !out && product.stock <= 20;
  const saved = wishlist.has(product._id);

  const add = async (thenCheckout) => {
    setBusy(true);
    try {
      await addItem(product, grams, qty);
      if (thenCheckout) navigate('/checkout');
      else toast.success(`${product.name} added to your cart.`, { action: { label: 'View cart', to: '/cart' } });
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setBusy(false); }
  };

  return (
    <div className="container-page py-8 md:py-12">
      <nav className="mb-6 text-sm text-bark-500" aria-label="Breadcrumb"><Link to="/products" className="hover:text-leaf-700">Shop</Link> / <Link to={`/category/${product.category.slug}`} className="hover:text-leaf-700">{product.category.name}</Link> / <span className="text-leaf-900">{product.name}</span></nav>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="overflow-hidden rounded-3xl bg-oat-100"><img src={productImage(product, img)} onError={withFallback} alt={product.name} className="aspect-square w-full object-cover" /></div>
          {product.images.length > 1 && <div className="mt-3 flex gap-3">{product.images.map((src, i) => <button key={src} type="button" onClick={() => setImg(i)} aria-label={`Show image ${i + 1}`} aria-pressed={i === img} className={`overflow-hidden rounded-xl border-2 transition ${i === img ? 'border-leaf-700' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={src} onError={withFallback} alt="" className="h-20 w-20 object-cover" /></button>)}</div>}
        </div>

        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm text-bark-600"><Link className="font-semibold text-leaf-700 hover:underline" to={`/category/${product.category.slug}`}>{product.category.name}</Link>{product.type && <span>· {product.type}</span>}{product.isOrganic && <span className="inline-flex items-center gap-1 rounded-full bg-leaf-800 px-2.5 py-0.5 text-xs font-semibold text-oat-50"><Leaf className="h-3 w-3" />Organic</span>}</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight">{product.name}</h1>
          <a href="#reviews" className="mt-3 inline-block"><RatingStars value={product.rating} count={product.reviews} showValue /></a>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-4xl font-extrabold text-leaf-900">{formatMoney(price * qty)}</span>
            {off > 0 && <><span className="text-lg text-bark-400 line-through">{formatMoney(mrp * qty)}</span><span className="rounded-full bg-turmeric-400 px-2.5 py-0.5 text-sm font-bold">{off}% off</span></>}
          </div>
          <p className="mt-1 text-sm text-bark-500">{formatMoney(product.finalPrice)} per kg. Inclusive of discount; GST added at checkout.</p>

          <fieldset className="mt-6">
            <legend className="label">Pack size</legend>
            <div className="flex flex-wrap gap-2">
              {product.weightOptions.map((w) => { const can = maxQuantityFor(product, w.grams) > 0; return (
                <button key={w.grams} type="button" disabled={!can} aria-pressed={grams === w.grams} onClick={() => { setGrams(w.grams); setQty(1); }} className={`chip min-w-[4.5rem] justify-center disabled:cursor-not-allowed disabled:opacity-40 ${grams === w.grams ? 'chip-active' : ''}`}>{w.label}</button>); })}
            </div>
          </fieldset>

          <p className={`mt-5 flex items-center gap-2 text-sm font-semibold ${out ? 'text-danger-600' : lowStock ? 'text-turmeric-700' : 'text-leaf-700'}`} role="status">
            <span className={`h-2.5 w-2.5 rounded-full ${out ? 'bg-danger-500' : lowStock ? 'bg-turmeric-500' : 'bg-leaf-500'}`} />
            {out ? 'Out of stock' : lowStock ? `Only ${product.stock} kg left` : `In stock (${product.stock} kg available)`}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <QuantityStepper value={qty} onChange={(v) => setQty(Math.min(Math.max(1, v), maxQty))} max={maxQty} disabled={out} />
            <button type="button" className="btn btn-primary btn-lg flex-1 sm:flex-none" onClick={() => add(false)} disabled={out || busy}>Add to Cart</button>
            <button type="button" className="btn btn-accent btn-lg flex-1 sm:flex-none" onClick={() => add(true)} disabled={out || busy}>Buy Now</button>
            <button type="button" className="btn btn-outline btn-lg !px-4" onClick={() => wishlist.toggle(product)} aria-pressed={saved} aria-label={saved ? 'Remove from wishlist' : 'Add to Wishlist'}><Heart className={`h-5 w-5 ${saved ? 'fill-danger-500 text-danger-500' : ''}`} /><span className="hidden sm:inline">{saved ? 'Saved' : 'Add to Wishlist'}</span></button>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-oat-100 p-4 text-sm"><Truck className="mt-0.5 h-5 w-5 shrink-0 text-leaf-700" /><p><strong>Estimated delivery: {deliveryWindow()}.</strong> Free over ₹500, otherwise ₹49. Cash on delivery available.</p></div>

          <p className="mt-6 leading-relaxed text-bark-800">{product.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" /><div><dt className="text-bark-500">Origin</dt><dd className="font-semibold">{product.origin || 'India'}</dd></div></div>
            <div className="flex gap-2.5"><Sprout className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" /><div><dt className="text-bark-500">Farming method</dt><dd className="font-semibold">{product.farmingMethod}</dd></div></div>
          </dl>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <div className="space-y-8">
          {product.benefits?.length > 0 && <section><h2 className="text-2xl font-bold">Product benefits</h2><ul className="mt-4 space-y-2.5">{product.benefits.map((b) => <li key={b} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-leaf-600" />{b}</li>)}</ul></section>}
          <section><h2 className="text-2xl font-bold">Storage instructions</h2><p className="mt-3 flex gap-3 leading-relaxed"><Snowflake className="mt-1 h-5 w-5 shrink-0 text-leaf-600" />{product.storageInstructions}</p></section>
        </div>
        <NutritionCard info={product.nutritionalInformation} name={product.name} />
      </div>

      <div className="mt-16"><Reviews product={product} onChanged={reload} /></div>
      {product.related?.length > 0 && <section className="mt-16"><h2 className="mb-6 text-2xl font-bold">You may also like</h2><ProductGrid products={product.related} /></section>}
      {formatDate(product.updatedAt) && null}
    </div>
  );
}
