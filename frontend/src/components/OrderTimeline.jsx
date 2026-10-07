import { Check, X } from 'lucide-react';
import { TRACK_STEPS } from '../utils/constants';
import { formatDateTime } from '../utils/format';

export default function OrderTimeline({ order }) {
  const cancelled = order.orderStatus === 'Cancelled';
  const reached = new Map(order.statusHistory.map((h) => [h.status, h]));
  const currentIdx = TRACK_STEPS.indexOf(order.orderStatus);
  const steps = cancelled ? order.statusHistory.map((h) => h.status) : TRACK_STEPS;

  return (
    <ol className="relative space-y-0" aria-label="Order tracking">
      {steps.map((s, i) => {
        const done = cancelled ? true : i <= currentIdx;
        const isLast = i === steps.length - 1;
        const isCancel = s === 'Cancelled';
        const entry = reached.get(s);
        return (
          <li key={s} className="relative flex gap-4 pb-6 last:pb-0" aria-current={!cancelled && i === currentIdx ? 'step' : undefined}>
            {!isLast && <span className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 ${done && (cancelled || i < currentIdx) ? (isCancel ? 'bg-danger-500' : 'bg-leaf-500') : 'bg-oat-300'}`} aria-hidden />}
            <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isCancel ? 'bg-danger-500 text-white' : done ? 'bg-leaf-700 text-oat-50' : 'border-2 border-oat-300 bg-white'} ${!cancelled && i === currentIdx ? 'ring-4 ring-turmeric-300/60' : ''}`}>
              {isCancel ? <X className="h-4 w-4" /> : done && <Check className="h-4 w-4" />}
            </span>
            <div className="pt-1">
              <p className={`text-[15px] font-semibold ${done ? 'text-leaf-950' : 'text-bark-400'}`}>{s}</p>
              {entry && <p className="text-[13px] text-bark-500">{formatDateTime(entry.date)}{entry.note ? `, ${entry.note}` : ''}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
