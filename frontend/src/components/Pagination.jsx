import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const window = new Set([1, pages, page - 1, page, page + 1]);
  const list = [...window].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const withGaps = list.reduce((acc, n, i) => (i > 0 && n - list[i - 1] > 1 ? [...acc, '…', n] : [...acc, n]), []);

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>
      {withGaps.map((n, i) =>
        n === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-bark-400">…</span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`h-9 min-w-[2.25rem] rounded-full px-2 text-sm font-semibold transition ${n === page ? 'bg-leaf-800 text-oat-50' : 'text-leaf-800 hover:bg-leaf-100'}`}
          >
            {n}
          </button>
        )
      )}
      <button type="button" className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
