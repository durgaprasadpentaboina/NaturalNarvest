import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, message, actionLabel, actionTo, onAction, className = '' }) {
  return (
    <div className={`mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center ${className}`}>
      {Icon && (
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-leaf-100 text-leaf-700">
          <Icon className="h-7 w-7" aria-hidden />
        </span>
      )}
      <h2 className="text-xl font-bold">{title}</h2>
      {message && <p className="mt-2 text-[15px] leading-relaxed text-bark-600">{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn btn-primary mt-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry, title = 'We could not load this' }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center" role="alert">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 text-danger-600">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1.5 text-[15px] text-bark-600">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-outline mt-5">
          Try again
        </button>
      )}
    </div>
  );
}
