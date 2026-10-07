import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import useAsync from '../../hooks/useAsync';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { reviewService, getErrorMessage } from '../../services';
import { useToast } from '../../context/ToastContext';
import RatingStars from '../../components/RatingStars';
import { ConfirmDialog } from '../../components/Modal';
import { ErrorState } from '../../components/EmptyState';
import { formatDate } from '../../utils/format';

export default function Reviews() {
  useDocumentTitle('Manage reviews');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => reviewService.all(), []);
  const [del, setDel] = useState(null); const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    try { await reviewService.remove(del._id); toast.success('Review deleted. The product rating was recalculated.'); setDel(null); reload(); } catch (err) { toast.error(getErrorMessage(err)); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reviews</h1>
      {error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="table-wrap"><table className="table"><thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Comment</th><th>Date</th><th><span className="sr-only">Delete</span></th></tr></thead>
          <tbody>{loading ? <tr><td colSpan={6}><div className="skeleton h-9" /></td></tr> : data.length === 0 ? <tr><td colSpan={6} className="py-10 text-center text-bark-600">No reviews yet.</td></tr> : data.map((r) => (
            <tr key={r._id}><td>{r.product ? <Link className="font-semibold hover:text-leaf-600" to={`/products/${r.product.slug}`}>{r.product.name}</Link> : 'Removed product'}</td><td>{r.user?.name}<span className="block text-xs text-bark-500">{r.user?.email}</span></td><td><RatingStars value={r.rating} /></td><td className="max-w-sm">{r.comment}</td><td>{formatDate(r.createdAt)}</td>
              <td><button type="button" className="rounded-full p-2 text-danger-600 hover:bg-danger-50" aria-label="Delete review" onClick={() => setDel(r)}><Trash2 className="h-4 w-4" /></button></td></tr>))}</tbody></table></div>)}
      <ConfirmDialog open={!!del} danger busy={busy} title="Delete this review?" message="It will disappear from the product page and the average rating will be recalculated." confirmLabel="Delete" onConfirm={remove} onCancel={() => setDel(null)} />
    </div>
  );
}
