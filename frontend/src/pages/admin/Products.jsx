import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import useAsync from '../../hooks/useAsync';
import useDebounce from '../../hooks/useDebounce';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { productService, categoryService, getErrorMessage } from '../../services';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { ErrorState } from '../../components/EmptyState';
import { formatPrice } from '../../utils/format';
import { productImage, withFallback } from '../../utils/images';

function StockCell({ product, onSaved }) {
  const toast = useToast();
  const [v, setV] = useState(product.stock);
  const [busy, setBusy] = useState(false);
  useEffect(() => setV(product.stock), [product.stock]);
  const save = async () => {
    setBusy(true);
    try { await productService.update(product._id, { stock: Number(v) }); toast.success(`Stock for ${product.name} set to ${v} kg.`); onSaved(); }
    catch (err) { toast.error(getErrorMessage(err)); setV(product.stock); } finally { setBusy(false); }
  };
  return (
    <div className="flex items-center gap-1.5">
      <label className="sr-only" htmlFor={`s-${product._id}`}>Stock in kg for {product.name}</label>
      <input id={`s-${product._id}`} type="number" min="0" value={v} onChange={(e) => setV(e.target.value)} className={`input !w-20 !px-2 !py-1.5 text-sm ${product.stock <= 20 ? '!border-turmeric-500' : ''}`} />
      <span className="text-xs text-bark-500">kg</span>
      {Number(v) !== product.stock && <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={save}>{busy ? '…' : 'Save'}</button>}
    </div>
  );
}

export default function Products() {
  useDocumentTitle('Manage products');
  const toast = useToast();
  const [q, setQ] = useState(''); const [cat, setCat] = useState(''); const [page, setPage] = useState(1);
  const [del, setDel] = useState(null); const [busy, setBusy] = useState(false);
  const term = useDebounce(q, 300);
  const cats = useAsync(() => categoryService.list(), []);
  const { data, loading, error, reload } = useAsync(() => productService.list({ search: term || undefined, category: cat || undefined, page, limit: 12, sort: 'newest' }), [term, cat, page]);
  useEffect(() => setPage(1), [term, cat]);

  const remove = async () => {
    setBusy(true);
    try { await productService.remove(del._id); toast.success(`${del.name} deleted.`); setDel(null); reload(); }
    catch (err) { toast.error(getErrorMessage(err)); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">Products</h1><Link to="/admin/products/add" className="btn btn-primary"><Plus className="h-4 w-4" />Add product</Link></div>
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[14rem] flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-bark-500" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" className="input pl-10" /></div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category" className="input !w-auto"><option value="">All categories</option>{cats.data?.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}</select>
      </div>
      {error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="table-wrap"><table className="table">
          <thead><tr><th>Product</th><th>Category</th><th>Price / kg</th><th>Stock</th><th>Flags</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {loading ? Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="skeleton h-10" /></td></tr>) : data.products.length === 0 ? <tr><td colSpan={6} className="py-10 text-center text-bark-600">No products found.</td></tr> : data.products.map((p) => (
              <tr key={p._id}>
                <td><div className="flex items-center gap-3"><img src={productImage(p)} onError={withFallback} alt="" className="h-11 w-11 rounded-lg object-cover" /><span className="font-semibold">{p.name}</span></div></td>
                <td>{p.category?.name}</td>
                <td>{formatPrice(p.finalPrice)}{p.discountPrice > 0 && <span className="ml-1.5 text-xs text-bark-400 line-through">{formatPrice(p.price)}</span>}</td>
                <td><StockCell product={p} onSaved={reload} /></td>
                <td><div className="flex flex-wrap gap-1 text-[11px] font-semibold">{p.isOrganic && <span className="rounded-full bg-leaf-100 px-2 py-0.5 text-leaf-800">Organic</span>}{p.isFeatured && <span className="rounded-full bg-turmeric-100 px-2 py-0.5 text-turmeric-700">Featured</span>}{p.isBestSeller && <span className="rounded-full bg-oat-200 px-2 py-0.5 text-bark-700">Best seller</span>}</div></td>
                <td><div className="flex justify-end gap-1"><Link to={`/admin/products/edit/${p._id}`} className="rounded-full p-2 hover:bg-leaf-100" aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" /></Link><button type="button" onClick={() => setDel(p)} className="rounded-full p-2 text-danger-600 hover:bg-danger-50" aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" /></button></div></td>
              </tr>))}
          </tbody></table></div>)}
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
      <ConfirmDialog open={!!del} danger busy={busy} title="Delete product?" message={`“${del?.name}” and its reviews will be removed permanently. Past orders keep their own copy of the details.`} confirmLabel="Delete" onConfirm={remove} onCancel={() => setDel(null)} />
    </div>
  );
}
