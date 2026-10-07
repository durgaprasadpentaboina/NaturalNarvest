import { Minus, Plus } from 'lucide-react';

export default function QuantityStepper({ value, onChange, min = 1, max = 50, disabled = false, size = 'md', label = 'Quantity' }) {
  const small = size === 'sm';
  const btn = `flex items-center justify-center rounded-full text-leaf-900 transition hover:bg-leaf-100 disabled:opacity-40 disabled:hover:bg-transparent ${small ? 'h-8 w-8' : 'h-10 w-10'}`;
  return (
    <div className="inline-flex items-center rounded-full border border-oat-300 bg-white p-0.5" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={disabled || value <= min} aria-label="Decrease quantity">
        <Minus className="h-4 w-4" />
      </button>
      <span className={`min-w-[2.25rem] text-center font-semibold tabular-nums ${small ? 'text-sm' : 'text-base'}`} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label="Increase quantity">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
