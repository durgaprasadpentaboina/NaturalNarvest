import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, PackageSearch } from 'lucide-react';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { orderService, getErrorMessage } from '../services';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';
import EmptyState, { ErrorState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/Modal';
import { DetailSkeleton } from '../components/Skeletons';
import { formatDate, formatMoney } from '../utils/format';
import { withFallback } from '../utils/images';

export default function OrderDetail() {
  const { id } = useParams();
  const justPlaced = useLocation().state?.justPlaced;
  const { data: order, loading, error, status, reload } = useAsync(() => orderService.get(id), [id]);
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  useDocumentTitle(order ? `Order ${order.orderNumber}` : 'Order');

  if (loading) return <DetailSkeleton />;
  if (status === 404) return <EmptyState icon={PackageSearch} title="Order not found" message="We could not find that order on your account." actionLabel="My orders" actionTo="/orders" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const a = order.shippingAddress;
  const canCancel = ['Order Placed', 'Confirmed'].includes(order.orderStatus);

  const cancel = async () => {
    setBusy(true);
    try { await orderService.cancel(order._id); toast.success('Your order was cancelled.'); setConfirm(false); reload(); }
    catch (err) { toast.error(getErrorMessage(err)); } finally { setBusy(false); }
  };

  return (
    <div className="container-page py-8 md:py-12">
      {justPlaced && <div className="mb-8 flex items-start gap-3 rounded-2xl bg-leaf-100 p-5 text-leaf-900" role="status"><CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-leaf-600" /><div><p className="font-display text-lg font-bold">Thank you, your order is placed.</p><p className="text-sm">We have sent the details to {a.email}. You can follow it below.</p></div></div>}
      <Link to="/orders" className="link text-sm">← All orders</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">Order {order.orderNumber}</h1><StatusBadge status={order.orderStatus} /></div>
      <p className="mt-1 text-bark-600">Placed {formatDate(order.createdAt)}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <section className="card p-6"><h2 className="mb-5 text-xl font-bold">Tracking</h2><OrderTimeline order={order} /></section>
          <section className="card p-6"><h2 className="text-xl font-bold">Items</h2>
            <ul className="mt-4 divide-y divide-oat-200">
              {order.items.map((i) => (
                <li key={`${i.product}${i.grams}`} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <img src={i.image} onError={withFallback} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1"><Link to={`/products/${i.slug}`} className="font-semibold hover:text-leaf-600">{i.name}</Link><p className="text-sm text-bark-500">{i.weightLabel} × {i.quantity}</p>
                    {order.orderStatus === 'Delivered' && <Link to={`/products/${i.slug}#reviews`} className="link text-sm">Write a review</Link>}</div>
                  <p className="font-semibold tabular-nums">{formatMoney(i.price * i.quantity)}</p>
                </li>))}
            </ul></section>
        </div>
        <aside className="space-y-6">
          <section className="card p-6 text-[15px]"><h2 className="text-xl font-bold">Payment</h2>
            <p className="mt-3">{order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment'} <StatusBadge status={order.paymentStatus} /></p>
            <dl className="mt-4 space-y-1.5">
              {[['Subtotal', formatMoney(order.subtotal)], ['Discount', `−${formatMoney(order.discount)}`], ['Shipping', order.shipping ? formatMoney(order.shipping) : 'Free'], ['Tax', formatMoney(order.tax)]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-bark-600">{k}</dt><dd className="tabular-nums">{v}</dd></div>)}
              <div className="flex justify-between border-t border-oat-200 pt-3 text-lg font-bold"><dt>Total</dt><dd className="tabular-nums">{formatMoney(order.total)}</dd></div>
            </dl></section>
          <section className="card p-6 text-[15px]"><h2 className="text-xl font-bold">Shipping address</h2>
            <address className="mt-3 not-italic leading-relaxed text-bark-800"><strong>{a.fullName}</strong><br />{a.house}, {a.street}<br />{a.city}, {a.district}<br />{a.state} {a.pincode}, {a.country}<br />{a.phone}</address></section>
          {canCancel && <button type="button" className="btn btn-danger-outline w-full" onClick={() => setConfirm(true)}>Cancel order</button>}
        </aside>
      </div>
      <ConfirmDialog open={confirm} danger busy={busy} title="Cancel this order?" message="The items go back on the shelf and this cannot be undone." confirmLabel="Cancel order" onConfirm={cancel} onCancel={() => setConfirm(false)} />
    </div>
  );
}
