import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBasket, Trash2, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import QuantityStepper from '../components/QuantityStepper';
import EmptyState from '../components/EmptyState';
import { LinesSkeleton } from '../components/Skeletons';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { formatMoney, formatPrice } from '../utils/format';
import { FREE_SHIPPING_THRESHOLD, maxQuantityFor } from '../utils/pricing';
import { productImage, withFallback } from '../utils/images';
import { getErrorMessage } from '../services';

export function Summary({ totals, children }) {
  const row = 'flex justify-between py-1.5 text-[15px]';
  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold">Order summary</h2>
      <dl className="mt-4">
        <div className={row}><dt className="text-bark-700">Subtotal</dt><dd className="tabular-nums">{formatMoney(totals.subtotal)}</dd></div>
        <div className={row}><dt className="text-bark-700">Discount</dt><dd className="tabular-nums text-leaf-700">−{formatMoney(totals.discount)}</dd></div>
        <div className={row}><dt className="text-bark-700">Shipping</dt><dd className="tabular-nums">{totals.shipping === 0 ? 'Free' : formatMoney(totals.shipping)}</dd></div>
        <div className={row}><dt className="text-bark-700">Tax (5% GST)</dt><dd className="tabular-nums">{formatMoney(totals.tax)}</dd></div>
        <div className="mt-2 flex justify-between border-t border-oat-200 pt-4 text-lg font-bold"><dt>Grand Total</dt><dd className="tabular-nums">{formatMoney(totals.total)}</dd></div>
      </dl>
      {children}
    </div>
  );
}

export default function Cart() {
  useDocumentTitle('Your cart');
  const { items, totals, loading, updateItem, removeItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const run = async (fn) => { try { await fn(); } catch (err) { toast.error(getErrorMessage(err)); } };
  const sale = totals.subtotal - totals.discount;
  const remaining = FREE_SHIPPING_THRESHOLD - sale;
  const blocked = items.some((i) => !i.inStock);

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="mb-8 text-4xl font-bold">Your cart</h1>
      {loading ? <LinesSkeleton /> : items.length === 0 ? <EmptyState icon={ShoppingBasket} title="Your cart is empty" message="Add a few dals or a bag of rice and they will wait for you here." actionLabel="Start shopping" actionTo="/products" /> : (
        <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
          <div>
            <div className={`mb-5 flex items-center gap-3 rounded-2xl p-4 text-sm ${remaining > 0 ? 'bg-turmeric-100' : 'bg-leaf-100'}`}><Truck className="h-5 w-5 shrink-0" />{remaining > 0 ? <p>Add <strong>{formatPrice(remaining)}</strong> more for free delivery.</p> : <p>You have free delivery on this order.</p>}</div>
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={i._id} className="card flex flex-wrap gap-4 p-4 sm:flex-nowrap">
                  <Link to={`/products/${i.product.slug}`} className="shrink-0"><img src={productImage(i.product)} onError={withFallback} alt="" className="h-24 w-24 rounded-xl object-cover" /></Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3"><Link to={`/products/${i.product.slug}`} className="font-display text-lg font-semibold leading-snug hover:text-leaf-600">{i.product.name}</Link><button type="button" onClick={() => run(() => removeItem(i._id))} className="rounded-full p-2 text-bark-500 hover:bg-danger-50 hover:text-danger-600" aria-label={`Remove ${i.product.name}`}><Trash2 className="h-4 w-4" /></button></div>
                    {!i.inStock && <p className="mt-1 text-sm font-medium text-danger-600">Only {i.product.stock} kg available. Lower the quantity or pack size.</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <label className="sr-only" htmlFor={`w-${i._id}`}>Pack size</label>
                      <select id={`w-${i._id}`} value={i.grams} onChange={(e) => run(() => updateItem(i._id, { grams: Number(e.target.value) }))} className="input !w-auto !py-2 text-sm">
                        {i.product.weightOptions.map((w) => <option key={w.grams} value={w.grams} disabled={maxQuantityFor(i.product, w.grams) < 1}>{w.label}</option>)}
                      </select>
                      <QuantityStepper size="sm" value={i.quantity} max={Math.max(1, maxQuantityFor(i.product, i.grams))} onChange={(q) => run(() => updateItem(i._id, { quantity: q }))} />
                      <p className="ml-auto text-right"><span className="block font-bold tabular-nums">{formatMoney(i.price * i.quantity)}</span>{i.mrp > i.price && <span className="text-sm text-bark-400 line-through">{formatMoney(i.mrp * i.quantity)}</span>}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <Summary totals={totals}>
              <button type="button" className="btn btn-primary btn-lg mt-6 w-full" disabled={blocked} onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
              <Link to="/products" className="link mt-4 block text-center text-sm">Continue shopping</Link>
            </Summary>
          </aside>
        </div>
      )}
    </div>
  );
}
