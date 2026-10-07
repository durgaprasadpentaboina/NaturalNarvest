import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Boxes, CheckCircle2, Clock, IndianRupee, ShoppingBag, Users } from 'lucide-react';
import useAsync from '../../hooks/useAsync';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { adminService } from '../../services';
import { ErrorState } from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { compactNumber, formatDate, formatPrice } from '../../utils/format';

const Stat = ({ icon: Icon, label, value, tone = 'bg-leaf-100 text-leaf-700' }) => (
  <div className="card flex items-center gap-4 p-5"><span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}><Icon className="h-6 w-6" aria-hidden /></span><div><p className="text-sm text-bark-600">{label}</p><p className="font-display text-2xl font-bold">{value}</p></div></div>
);
const Chart = ({ title, children }) => <section className="card p-5"><h2 className="mb-4 text-lg font-bold">{title}</h2><div className="h-64" role="img" aria-label={title}><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div></section>;
const axis = { fontSize: 12, fill: '#6F533A' };
const tip = { contentStyle: { borderRadius: 12, border: '1px solid #EFE6CF', fontSize: 13 } };

export default function Dashboard() {
  useDocumentTitle('Admin dashboard');
  const { data, loading, error, reload } = useAsync(() => adminService.stats(), []);
  if (loading) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-24" />)}</div>;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const d = data;
  const daily = d.daily.map((x) => ({ ...x, label: x.date.slice(5) }));
  const monthly = d.monthly.map((x) => ({ ...x, label: x.month.slice(2) }));
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={IndianRupee} label="Total sales" value={formatPrice(d.totalSales)} tone="bg-turmeric-100 text-turmeric-700" />
        <Stat icon={ShoppingBag} label="Total orders" value={d.totalOrders} />
        <Stat icon={Users} label="Total customers" value={d.totalCustomers} />
        <Stat icon={Boxes} label="Total products" value={d.totalProducts} />
        <Stat icon={Clock} label="Pending orders" value={d.pendingOrders} tone="bg-turmeric-100 text-turmeric-700" />
        <Stat icon={CheckCircle2} label="Delivered orders" value={d.deliveredOrders} />
        <Stat icon={AlertTriangle} label={`Low stock (≤ ${d.lowStockThreshold} kg)`} value={d.lowStockCount} tone="bg-danger-50 text-danger-600" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Chart title="Daily sales (last 30 days)"><AreaChart data={daily}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3F7F57" stopOpacity={0.5} /><stop offset="95%" stopColor="#3F7F57" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#EFE6CF" vertical={false} /><XAxis dataKey="label" tick={axis} interval={4} /><YAxis tick={axis} tickFormatter={compactNumber} width={48} /><Tooltip {...tip} formatter={(v) => formatPrice(v)} /><Area type="monotone" dataKey="revenue" name="Sales" stroke="#27523A" strokeWidth={2} fill="url(#g)" /></AreaChart></Chart>
        <Chart title="Monthly revenue"><BarChart data={monthly}><CartesianGrid stroke="#EFE6CF" vertical={false} /><XAxis dataKey="label" tick={axis} /><YAxis tick={axis} tickFormatter={compactNumber} width={48} /><Tooltip {...tip} formatter={(v) => formatPrice(v)} /><Bar dataKey="revenue" name="Revenue" fill="#E7B93A" radius={[6, 6, 0, 0]} /></BarChart></Chart>
        <Chart title="Orders per day"><BarChart data={daily}><CartesianGrid stroke="#EFE6CF" vertical={false} /><XAxis dataKey="label" tick={axis} interval={4} /><YAxis tick={axis} allowDecimals={false} width={32} /><Tooltip {...tip} /><Bar dataKey="orders" name="Orders" fill="#3F7F57" radius={[4, 4, 0, 0]} /></BarChart></Chart>
        <Chart title="Orders by status"><BarChart data={d.ordersByStatus} layout="vertical" margin={{ left: 24 }}><CartesianGrid stroke="#EFE6CF" horizontal={false} /><XAxis type="number" tick={axis} allowDecimals={false} /><YAxis type="category" dataKey="status" tick={axis} width={110} /><Tooltip {...tip} /><Bar dataKey="count" name="Orders" fill="#8B6B4A" radius={[0, 6, 6, 0]} /></BarChart></Chart>
        <div className="xl:col-span-2"><Chart title="Top-selling products (units)"><BarChart data={d.topProducts} layout="vertical" margin={{ left: 24 }}><CartesianGrid stroke="#EFE6CF" horizontal={false} /><XAxis type="number" tick={axis} allowDecimals={false} /><YAxis type="category" dataKey="name" tick={axis} width={170} /><Tooltip {...tip} /><Bar dataKey="units" name="Units sold" fill="#27523A" radius={[0, 6, 6, 0]} /></BarChart></Chart></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card p-5"><div className="mb-3 flex justify-between"><h2 className="text-lg font-bold">Low stock</h2><Link to="/admin/products" className="link text-sm">Manage</Link></div>
          {d.lowStockProducts.length === 0 ? <p className="text-bark-600">Everything is well stocked.</p> : <ul className="divide-y divide-oat-100">{d.lowStockProducts.map((p) => <li key={p._id} className="flex justify-between py-2.5 text-sm"><Link to={`/admin/products/edit/${p._id}`} className="font-medium hover:text-leaf-600">{p.name}</Link><span className={p.stock === 0 ? 'font-bold text-danger-600' : 'font-semibold text-turmeric-700'}>{p.stock === 0 ? 'Out of stock' : `${p.stock} kg`}</span></li>)}</ul>}</section>
        <section className="card p-5"><div className="mb-3 flex justify-between"><h2 className="text-lg font-bold">Recent orders</h2><Link to="/admin/orders" className="link text-sm">All orders</Link></div>
          <ul className="divide-y divide-oat-100">{d.recentOrders.map((o) => <li key={o._id} className="flex items-center justify-between gap-3 py-2.5 text-sm"><div><p className="font-semibold">{o.orderNumber}</p><p className="text-bark-500">{o.user?.name} · {formatDate(o.createdAt)}</p></div><div className="text-right"><StatusBadge status={o.orderStatus} /><p className="mt-1 font-semibold">{formatPrice(o.total)}</p></div></li>)}</ul></section>
      </div>
    </div>
  );
}
