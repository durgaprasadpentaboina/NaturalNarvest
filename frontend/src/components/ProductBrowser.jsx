import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, SearchX, X } from 'lucide-react';
import { productService, categoryService } from '../services';
import useAsync from '../hooks/useAsync';
import { ProductGrid } from './ProductCard';
import { ProductGridSkeleton } from './Skeletons';
import EmptyState, { ErrorState } from './EmptyState';
import Pagination from './Pagination';
import Modal from './Modal';
import { SORT_OPTIONS, WEIGHT_OPTIONS } from '../utils/constants';

const KEYS = ['q', 'category', 'type', 'minPrice', 'maxPrice', 'rating', 'weight', 'organic', 'inStock', 'sort', 'page'];

function Filters({ params, set, categories, lockCategory }) {
  const [min, setMin] = useState(params.get('minPrice') || '');
  const [max, setMax] = useState(params.get('maxPrice') || '');
  useEffect(() => { setMin(params.get('minPrice') || ''); setMax(params.get('maxPrice') || ''); }, [params]);
  const group = 'border-b border-oat-200 py-5 first:pt-0 last:border-0';
  const title = 'mb-3 text-sm font-bold text-leaf-900';
  return (
    <div>
      {!lockCategory && (
        <fieldset className={group}>
          <legend className={title}>Category</legend>
          <div className="space-y-2">
            {[{ slug: '', name: 'All products' }, ...categories].map((c) => (
              <label key={c.slug} className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input type="radio" name="category" checked={(params.get('category') || '') === c.slug} onChange={() => set({ category: c.slug, type: '' })} className="h-4 w-4 accent-leaf-700" />{c.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset className={group}>
        <legend className={title}>Price per kg (₹)</legend>
        <div className="flex items-center gap-2">
          <input aria-label="Minimum price" type="number" min="0" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} className="input !px-3 !py-2" />
          <span className="text-bark-400">to</span>
          <input aria-label="Maximum price" type="number" min="0" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} className="input !px-3 !py-2" />
        </div>
        <button type="button" className="btn btn-outline btn-sm mt-3 w-full" onClick={() => set({ minPrice: min, maxPrice: max })}>Apply price</button>
      </fieldset>
      <fieldset className={group}>
        <legend className={title}>Rating</legend>
        <div className="flex flex-wrap gap-2">
          {[['', 'Any'], ['4', '4★ & up'], ['3', '3★ & up']].map(([v, l]) => (
            <button key={v} type="button" onClick={() => set({ rating: v })} aria-pressed={(params.get('rating') || '') === v} className={`chip ${(params.get('rating') || '') === v ? 'chip-active' : ''}`}>{l}</button>
          ))}
        </div>
      </fieldset>
      <fieldset className={group}>
        <legend className={title}>Pack size</legend>
        <div className="flex flex-wrap gap-2">
          {[{ grams: '', label: 'Any' }, ...WEIGHT_OPTIONS].map((w) => (
            <button key={w.grams} type="button" onClick={() => set({ weight: String(w.grams) })} aria-pressed={(params.get('weight') || '') === String(w.grams)} className={`chip ${(params.get('weight') || '') === String(w.grams) ? 'chip-active' : ''}`}>{w.label}</button>
          ))}
        </div>
      </fieldset>
      <fieldset className={group}>
        <legend className={title}>Show only</legend>
        <label className="mb-2 flex cursor-pointer items-center gap-2.5 text-sm"><input type="checkbox" checked={params.get('organic') === 'true'} onChange={(e) => set({ organic: e.target.checked ? 'true' : '' })} className="h-4 w-4 accent-leaf-700" />Organic</label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm"><input type="checkbox" checked={params.get('inStock') === 'true'} onChange={(e) => set({ inStock: e.target.checked ? 'true' : '' })} className="h-4 w-4 accent-leaf-700" />In stock</label>
      </fieldset>
    </div>
  );
}

export default function ProductBrowser({ lockCategory, extraParams = {}, types = [] }) {
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const cats = useAsync(() => categoryService.list(), []);
  const page = Number(params.get('page') || 1);

  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const query = {
    search: params.get('q') || undefined, category: lockCategory || params.get('category') || undefined, type: params.get('type') || undefined,
    minPrice: params.get('minPrice') || undefined, maxPrice: params.get('maxPrice') || undefined, rating: params.get('rating') || undefined,
    weight: params.get('weight') || undefined, organic: params.get('organic') || undefined, inStock: params.get('inStock') || undefined,
    sort: params.get('sort') || 'popularity', page, limit: 12, ...extraParams,
  };
  const { data, loading, error, reload } = useAsync(() => productService.list(query), [params.toString(), lockCategory]);

  const active = KEYS.filter((k) => !['sort', 'page', 'q'].includes(k) && params.get(k) && !(lockCategory && k === 'category'));
  const clearAll = () => { const n = new URLSearchParams(); if (params.get('q')) n.set('q', params.get('q')); setParams(n, { replace: true }); };

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <aside className="hidden lg:block"><div className="sticky top-32 card p-5"><Filters params={params} set={set} categories={cats.data || []} lockCategory={lockCategory} /></div></aside>
      <Modal open={drawer} onClose={() => setDrawer(false)} title="Filters" footer={<button type="button" className="btn btn-primary w-full" onClick={() => setDrawer(false)}>Show {data?.total ?? ''} products</button>}>
        <Filters params={params} set={set} categories={cats.data || []} lockCategory={lockCategory} />
      </Modal>

      <div>
        {types.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Product type">
            <button type="button" className={`chip ${!params.get('type') ? 'chip-active' : ''}`} onClick={() => set({ type: '' })}>All</button>
            {types.map((t) => <button key={t} type="button" className={`chip ${params.get('type') === t ? 'chip-active' : ''}`} onClick={() => set({ type: t })}>{t}</button>)}
          </div>
        )}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-bark-600" aria-live="polite">{loading ? 'Loading…' : `${data?.total ?? 0} product${data?.total === 1 ? '' : 's'}`}{params.get('q') && <> for “<strong>{params.get('q')}</strong>”</>}</p>
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-outline btn-sm lg:hidden" onClick={() => setDrawer(true)}><SlidersHorizontal className="h-4 w-4" />Filters{active.length > 0 && ` (${active.length})`}</button>
            <label className="sr-only" htmlFor="sort">Sort by</label>
            <select id="sort" value={params.get('sort') || 'popularity'} onChange={(e) => set({ sort: e.target.value })} className="input !w-auto !py-2 text-sm">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        {active.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {active.map((k) => <button key={k} type="button" className="chip" onClick={() => set({ [k]: '' })}>{k === 'category' ? params.get(k).replace(/-/g, ' ') : `${k}: ${params.get(k)}`}<X className="h-3.5 w-3.5" aria-label="Remove filter" /></button>)}
            <button type="button" className="link text-sm" onClick={clearAll}>Clear all</button>
          </div>
        )}
        {loading ? <ProductGridSkeleton /> : error ? <ErrorState message={error} onRetry={reload} /> : data.products.length === 0 ? (
          <EmptyState icon={SearchX} title="Nothing matches yet" message="Try a different spelling, or remove a filter or two to see more of the harvest." actionLabel={active.length ? 'Clear filters' : undefined} onAction={active.length ? clearAll : undefined} />
        ) : (<><ProductGrid products={data.products} /><Pagination page={data.page} pages={data.pages} onChange={(p) => { set({ page: String(p) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /></>)}
      </div>
    </div>
  );
}
