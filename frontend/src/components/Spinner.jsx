import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Loading', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-16 text-leaf-700 ${className}`} role="status">
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      <span className="text-sm font-medium">{label}…</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <Spinner label="Loading" />
    </div>
  );
}
