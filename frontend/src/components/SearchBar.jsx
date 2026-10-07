import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Search, X } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import { productService } from '../services';
import { formatPrice } from '../utils/format';
import { productImage, withFallback } from '../utils/images';

export default function SearchBar({ initialValue = '', autoFocus = false, large = false, onDone }) {
  const navigate = useNavigate();
  const listId = useId();
  const box = useRef(null);
  const [q, setQ] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const term = useDebounce(q.trim(), 250);

  useEffect(() => setQ(initialValue), [initialValue]);

  useEffect(() => {
    if (term.length < 2) { setResults([]); return undefined; }
    let live = true;
    setLoading(true);
    productService.list({ search: term, limit: 6 })
      .then((r) => live && setResults(r.products))
      .catch(() => live && setResults([]))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [term]);

  useEffect(() => {
    const onClick = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = (path) => { setOpen(false); onDone?.(); navigate(path); };
  const submit = (e) => {
    e.preventDefault();
    if (active >= 0 && results[active]) return go(`/products/${results[active].slug}`);
    if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
    return null;
  };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
    else if (e.key === 'Escape') setOpen(false);
  };
  const showPanel = open && term.length >= 2;

  return (
    <div ref={box} className="relative w-full">
      <form onSubmit={submit} role="search" className="relative">
        <Search className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-bark-500 ${large ? 'h-5 w-5' : 'h-4 w-4'}`} aria-hidden />
        <input
          type="search" value={q} autoFocus={autoFocus} autoComplete="off"
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)} onKeyDown={onKey}
          placeholder="Search dal, basmati, rajma…" aria-label="Search products"
          role="combobox" aria-expanded={showPanel} aria-controls={listId} aria-autocomplete="list"
          className={`w-full rounded-full border border-oat-300 bg-white pl-11 pr-10 text-leaf-950 shadow-soft transition placeholder:text-bark-400 focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200 ${large ? 'py-3.5 text-base' : 'py-2.5 text-sm'}`}
        />
        {loading ? <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-leaf-600" aria-hidden />
          : q && <button type="button" onClick={() => { setQ(''); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-bark-500 hover:bg-oat-100" aria-label="Clear search"><X className="h-4 w-4" /></button>}
      </form>

      {showPanel && (
        <div id={listId} role="listbox" className="absolute inset-x-0 top-full z-50 mt-2 animate-fade-in overflow-hidden rounded-2xl border border-oat-200 bg-white shadow-lift">
          {results.length === 0 && !loading ? (
            <p className="px-4 py-5 text-sm text-bark-600">No products match “{term}”. Try “dal”, “rice” or “organic”.</p>
          ) : (
            <>
              <ul>
                {results.map((p, i) => (
                  <li key={p._id} role="option" aria-selected={i === active}>
                    <Link to={`/products/${p.slug}`} onClick={() => { setOpen(false); onDone?.(); }}
                      className={`flex items-center gap-3 px-3 py-2.5 transition hover:bg-oat-100 ${i === active ? 'bg-oat-100' : ''}`}>
                      <img src={productImage(p)} onError={withFallback} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{p.name}</span>
                        <span className="block text-xs text-bark-500">{p.category?.name}</span>
                      </span>
                      <span className="text-sm font-bold text-leaf-800">{formatPrice(p.finalPrice)}<span className="text-xs font-normal text-bark-500">/kg</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => go(`/search?q=${encodeURIComponent(term)}`)} className="w-full border-t border-oat-200 bg-oat-50 px-4 py-3 text-left text-sm font-semibold text-leaf-700 hover:bg-oat-100">
                See all results for “{term}”
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
