import { Star } from 'lucide-react';

export default function RatingStars({ value = 0, count, size = 'h-4 w-4', showValue = false }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="inline-flex items-center gap-1.5" role="img" aria-label={`Rated ${value.toFixed(1)} out of 5${count !== undefined ? ` from ${count} reviews` : ''}`}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
          return (
            <span key={i} className={`relative inline-block ${size}`}>
              <Star className={`absolute inset-0 ${size} text-oat-300`} fill="currentColor" strokeWidth={0} />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: fill === 1 ? '100%' : '50%' }}>
                  <Star className={`${size} text-turmeric-500`} fill="currentColor" strokeWidth={0} />
                </span>
              )}
            </span>
          );
        })}
      </span>
      {showValue && <span className="text-sm font-semibold text-leaf-900">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="text-[13px] text-bark-500">({count})</span>}
    </span>
  );
}

export function RatingInput({ value, onChange }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          onClick={() => onChange(i)}
          className="rounded-md p-0.5 transition hover:scale-110"
        >
          <Star className={`h-7 w-7 ${i <= value ? 'text-turmeric-500' : 'text-oat-300'}`} fill="currentColor" strokeWidth={0} />
        </button>
      ))}
    </div>
  );
}
