import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { orderService } from '../services';
import StatusBadge from '../components/StatusBadge';
import EmptyState, { ErrorState } from '../components/EmptyState';
import { LinesSkeleton } from '../components/Skeletons';
import { formatDate, formatMoney } from '../utils/format';
import { withFallback } from '../utils/images';

export default function Orders() {
  useDocumentTitle('My orders');
  const { data, loading, error, reload } = useAsync(() => orderService.mine(), []);
  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="mb-8 text-4xl font-bold">My orders</h1>
      {loading ? <LinesSkeleton /> : error ? <ErrorState message={error} onRetry={reload} /> : data.length === 0 ? <EmptyState icon={PackageOpen} title="No orders yet" message="When you place an order it will show up here with live tracking." actionLabel="Start shopping" actionTo="/products" /> : (
        <ul className="space-y-4">
          {data.map((o) => (
            <li key={o._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><Link to={`/orders/${o._id}`} className="font-display text-lg font-bold hover:text-leaf-600">{o.orderNumber}</Link><p className="text-sm text-bark-500">Placed {formatDate(o.createdAt)} · {o.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment'}</p></div>
                <StatusBadge status={o.orderStatus} />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex -space-x-3">{o.items.slice(0, 5).map((i) => <img key={`${i.product}${i.grams}`} src={i.image} onError={withFallback} alt={i.name} title={i.name} className="h-12 w-12 rounded-full border-2 border-white object-cover" />)}{o.items.length > 5 && <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-oat-200 text-xs font-bold">+{o.items.length - 5}</span>}</div>
                <p className="text-sm text-bark-600">{o.items.length} item{o.items.length > 1 ? 's' : ''} · to {o.shippingAddress.city}, {o.shippingAddress.state}</p>
                <div className="text-right"><p className="text-lg font-bold">{formatMoney(o.total)}</p><Link to={`/orders/${o._id}`} className="link text-sm">View & track</Link></div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
