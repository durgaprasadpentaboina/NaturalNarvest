import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 shrink-0 text-leaf-500" aria-hidden />,
  error: <XCircle className="h-5 w-5 shrink-0 text-danger-500" aria-hidden />,
  info: <Info className="h-5 w-5 shrink-0 text-turmeric-500" aria-hidden />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (type, message, options = {}) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-3), { id, type, message, action: options.action }]);
      setTimeout(() => dismiss(id), options.duration || 4500);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (m, o) => push('success', m, o),
      error: (m, o) => push('error', m, { duration: 6000, ...o }),
      info: (m, o) => push('info', m, o),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6" aria-live="polite" role="status">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto flex w-full max-w-sm animate-slide-in items-start gap-3 rounded-2xl border border-oat-200 bg-white p-3.5 pr-3 shadow-lift">
            {ICONS[t.type]}
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-leaf-950">{t.message}</p>
              {t.action && (
                <Link to={t.action.to} onClick={() => dismiss(t.id)} className="link mt-1 inline-block text-[13px]">
                  {t.action.label}
                </Link>
              )}
            </div>
            <button type="button" onClick={() => dismiss(t.id)} className="rounded-full p-1 text-bark-500 hover:bg-oat-100" aria-label="Dismiss message">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
