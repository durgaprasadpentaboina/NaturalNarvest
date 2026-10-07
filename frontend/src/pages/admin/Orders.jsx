import { useEffect, useState } from 'react';
import { Eye, Search } from 'lucide-react';
import useAsync from '../../hooks/useAsync';
import useDebounce from '../../hooks/useDebounce';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { adminService, orderService, getErrorMessage } from '../../services';
import { useToast } from '../../context/ToastContext';
import Modal, { ConfirmDialog } from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import OrderTimeline from '../../components/OrderTimeline';
import Pagination from '../../components/Pagination';
import { ErrorState } from '../../components/EmptyState';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../utils/constants';
import { formatDate, formatMoney } from '../../utils/format';

function OrderModal({ id, onClose, onChanged }) {
  const toast = useToast();
  const { data: o, loading, error, setData } = useAsync(() => orderService.get(id), [id]);
  const [status, setStatus] = useState(''); const [note, setNote] = useState(''); const [busy, setBusy] = useState(false); const [cancel, setCancel] = useState(false);
  useEffect(() => { if (o) setStatus(o.orderStatus); }, [o?.orderStatus]);
  const final = o && ['Delivered', 'Cancelled'].includes(o.orderStatus);

  const apply = async (s) => {
    setBusy(true);
    try { setData(await orderService.updateStatus(id, { status: s, note })); setNote(''); setCancel(false); toast.success(`Order marked ${s}.`); onChanged(); }
    catch (err) { toast.error(getErrorMessage(err)); } finally { setBusy(false); }
  };
  const pay = async (ps) => {
    try { setData(await orderService.updatePayment(id, ps)); toast.success(`Payment marked ${ps}.`); onChanged(); } catch (err) { toast.error(getErrorMessage(err)); }
  };
  return (
    <Modal open onClose={onClose} size="lg" title={o ? `Order ${o.orderNumber}` : 'Order'}>
      {loading ? <div className="skeleton h-64" /> : error ? <ErrorState message={error} /> : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-5 text-sm">
            <section><h3 className="mb-1 font-bold">Customer</h3><p>{o.user?.name} · {o.user?.email}<br />{o.shippingAddress.phone}</p></section>
            <section><h3 className="mb-1 font-bold">Ship to</h3><address className="not-italic">{o.shippingAddress.fullName}<br />{o.shippingAddress.house}, {o.shippingAddress.street}<br />{o.shippingAddress.city}, {o.shippingAddress.district}<br />{o.shippingAddress.state} {o.shippingAddress.pincode}</address></section>
            <section><h3 className="mb-2 font-bold">Items</h3><ul className="divide-y divide-oat-200 rounded-xl bg-white">{o.items.map((i) => <li key={i.product + i.grams} className="flex justify-between gap-3 p-3"><span>{i.name} <span className="text-bark-500">{i.weightLabel} × {i.quantity}</span></span><span className="font-semibold">{formatMoney(i.price * i.quantity)}</span></li>)}</ul>
              <p className="mt-2 flex justify-between font-bold"><span>Total ({o.paymentMethod === 'cod' ? 'COD' : 'Online'})</span><span>{formatMoney(o.total)}</span></p></section>
            <section><h3 className="mb-1 font-bold">Payment</h3><div className="flex items-center gap-2"><StatusBadge status={o.paymentStatus} />
              <label className="sr-only" htmlFor="ps">Payment status</label><select id="ps" value={o.paymentStatus} onChange={(e) => pay(e.target.value)} className="input !w-auto !py-1.5 text-sm">{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div></section>
          </div>
          <div className="space-y-5">
            <OrderTimeline order={o} />
            {!final ? (
              <div className="rounded-2xl bg-white p-4"><h3 className="mb-2 text-sm font-bold">Update status</h3>
                <label className="sr-only" htmlFor="st">Status</label>
                <select id="st" value={status} onChange={(e) => setStatus(e.target.value)} className="input">{ORDER_STATUSES.filter((s) => s !== 'Cancelled').map((s) => <option key={s}>{s}</option>)}</select>
                <label className="sr-only" htmlFor="note">Note</label>
                <input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note for the timeline" className="input mt-2" maxLength={300} />
                <div className="mt-3 flex gap-2"><button type="button" className="btn btn-primary btn-sm" disabled={busy || status === o.orderStatus} onClick={() => apply(status)}>Update</button><button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setCancel(true)}>Cancel order</button></div></div>
            ) : <p className="rounded-xl bg-oat-200 p-3 text-sm">This order is {o.orderStatus.toLowerCase()} and can no longer change.</p>}
          </div>
          <ConfirmDialog open={cancel} danger busy={busy} title="Cancel this order?" message="Stock is returned to the shelf and the customer sees the order as cancelled." confirmLabel="Cancel order" onConfirm={() => apply('Cancelled')} onCancel={() => setCancel(false)} />
        </div>)}
    </Modal>
  );
}

export default function Orders() {
  useDocumentTitle('Manage orders');
  const [f, setF] = useState({ search: '', status: '', payment: '', from: '', to: '' });
  const [page, setPage] = useState(1); const [open, setOpen] = useState(null);
  const term = useDebounce(f.search, 300);
  const { data, loading, error, reload } = useAsync(() => adminService.orders({ search: term || undefined, status: f.status || undefined, payment: f.payment || undefined, from: f.from || undefined, to: f.to || undefined, page, limit: 12 }), [term, f.status, f.payment, f.from, f.to, page]);
  useEffect(() => setPage(1), [term, f.status, f.payment, f.from, f.to]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="relative xl:col-span-2"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-bark-500" /><input value={f.search} onChange={set('search')} placeholder="Order no., customer name, email or phone" aria-label="Search orders" className="input pl-10" /></div>
        <select value={f.status} onChange={set('status')} aria-label="Filter by status" className="input"><option value="">All statuses</option>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select value={f.payment} onChange={set('payment')} aria-label="Filter by payment" className="input"><option value="">All payments</option>{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <div className="flex items-center gap-2"><input type="date" value={f.from} onChange={set('from')} aria-label="From date" className="input !px-2" /><span className="text-bark-400">–</span><input type="date" value={f.to} onChange={set('to')} aria-label="To date" className="input !px-2" /></div>
      </div>
      {error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="table-wrap"><table className="table">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th><th><span className="sr-only">View</span></th></tr></thead>
          <tbody>{loading ? Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton h-9" /></td></tr>) : data.orders.length === 0 ? <tr><td colSpan={7} className="py-10 text-center text-bark-600">No orders match these filters.</td></tr> : data.orders.map((o) => (
            <tr key={o._id}><td className="font-semibold">{o.orderNumber}</td><td>{o.user?.name || o.shippingAddress.fullName}<span className="block text-xs text-bark-500">{o.user?.email}</span></td><td>{formatDate(o.createdAt)}</td><td className="tabular-nums">{formatMoney(o.total)}</td><td><StatusBadge status={o.paymentStatus} /></td><td><StatusBadge status={o.orderStatus} /></td>
              <td><button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(o._id)}><Eye className="h-4 w-4" />View</button></td></tr>))}</tbody></table></div>)}
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
      {open && <OrderModal id={open} onClose={() => setOpen(null)} onChanged={reload} />}
    </div>
  );
}
