import { useId } from 'react';

// Label + control + error, wired for screen readers
export default function Field({ label, error, hint, children, className = '', required }) {
  const id = useId();
  const control = children({ id, 'aria-invalid': Boolean(error) || undefined, 'aria-describedby': error ? `${id}-err` : hint ? `${id}-hint` : undefined });
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="text-danger-500" aria-hidden> *</span>}
        </label>
      )}
      {control}
      {error ? (
        <p id={`${id}-err`} className="field-error" role="alert">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="hint">{hint}</p>
      ) : null}
    </div>
  );
}
