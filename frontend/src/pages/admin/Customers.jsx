import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import useAsync from '../../hooks/useAsync';
import useDebounce from '../../hooks/useDebounce';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { adminService, getErrorMessage } from '../../services';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { ErrorState } from '../../components/EmptyState';
import { formatDate, formatMoney, formatPrice } from '../../utils/format';

function CustomerModal({ id, onClose }) {
  const { data, loading } = useAsync(() => adminService.customer(id), [id]);
  const c = data?.customer;
  return (
    <Modal open onClose={onClose} title={c?.name || 'Customer'} size="md">
      {loading ? <div className="skeleton h-40" /> : (
        <div className="space-y-5 text-sm">
          <p>{c.email} · {c.phone}<br /><span className="text-bark-500">Joined {formatDate(c.createdAt)}</span></p>
          <section><h3 className="mb-2 font-bold">Addresses</h3>{c.addresses?.length ? <ul className="space-y-1.5">{c.addresses.map((a) => <li key={a._id}>{a.label}: {a.house}, {a.street}, {a.city}, {a.state} {a.pincode}</li>)}</ul> : <p className="text-bark-600">None saved.</p>}</section>
          <section><h3 className="mb-2 font-bold">Orders ({data.orders.length})</h3>{data.orders.length ? <ul className="divide-y divide-oat-200 rounded-xl bg-white">{data.orders.map((o) => <li key={o._id} className="flex items-center justify-between gap-3 p-3"><span><strong>{o.orderNumber}</strong> <span className="text-bark-500">{formatDate(o.createdAt)}</span></span><span className="flex items-center gap-3"><StatusBadge status={o.orderStatus} />{formatMoney(o.total)}</span></li>)}</ul> : <p className="text-bark-600">No orders yet.</p>}</section>
        </div>)}
    </Modal>
  );
}

export default function Customers() {
  useDocumentTitle('Manage customers');
  const toast = useToast();
  const [q, setQ] = useState(''); const [page, setPage] = useState(1); const [open, setOpen] = useState(null);
  const term = useDebounce(q, 300);
  const { data, loading, error, reload } = useAsync(() => adminService.customers({ search: term || undefined, page, limit: 15 }), [term, page]);
  useEffect(() => setPage(1), [term]);
  const toggle = async (c) => {
    try { await adminService.setCustomerActive(c._id, !c.isActive); toast.success(`${c.name} ${c.isActive ? 'deactivated' : 'reactivated'}.`); reload(); } catch (err) { toast.error(getErrorMessage(err)); }
  };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customers</h1>
      <div className="relative max-w-md"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-bark-500" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or phone" aria-label="Search customers" className="input pl-10" /></div>
      {error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="table-wrap"><table className="table">
          <thead><tr><th>Customer</th><th>Phone</th><th>Joined</th><th>Orders</th><th>Spent</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>{loading ? Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton h-9" /></td></tr>) : data.customers.length === 0 ? <tr><td colSpan={7} className="py-10 text-center text-bark-600">No customers found.</td></tr> : data.customers.map((c) => (
            <tr key={c._id}><td><p className="font-semibold">{c.name}</p><p className="text-xs text-bark-500">{c.email}</p></td><td>{c.phone}</td><td>{formatDate(c.createdAt)}</td><td>{c.orders}</td><td className="tabular-nums">{formatPrice(c.spent)}</td>
              <td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.isActive ? 'bg-leaf-100 text-leaf-800' : 'bg-danger-50 text-danger-700'}`}>{c.isActive ? 'Active' : 'Deactivated'}</span></td>
              <td><div className="flex justify-end gap-2"><button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(c._id)}>View</button><button type="button" className={`btn btn-sm ${c.isActive ? 'btn-danger-outline' : 'btn-outline'}`} onClick={() => toggle(c)}>{c.isActive ? 'Deactivate' : 'Reactivate'}</button></div></td></tr>))}</tbody></table></div>)}
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
      {open && <CustomerModal id={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
