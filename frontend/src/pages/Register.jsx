import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getErrorMessage, getFieldErrors } from '../services';

export default function Register() {
  useDocumentTitle('Create account');
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const from = useLocation().state?.from || '/';
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={from} replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!/^\+?[0-9\s-]{10,15}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit phone number';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) e.password = 'Use at least 8 characters with a letter and a number';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    return e;
  };
  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(); setErrors(e); setFormError('');
    if (Object.keys(e).length) return;
    setBusy(true);
    try { await register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password }); toast.success('Your account is ready. Welcome to NaturalHarvest.'); navigate(from, { replace: true }); }
    catch (err) { setErrors(getFieldErrors(err)); setFormError(getErrorMessage(err)); } finally { setBusy(false); }
  };
  return (
    <div className="container-page flex justify-center py-12 md:py-20">
      <form onSubmit={submit} className="card w-full max-w-lg space-y-5 p-7 sm:p-9" noValidate>
        <div><h1 className="text-3xl font-bold">Create your account</h1><p className="mt-1 text-bark-600">Save addresses, track orders and keep a wishlist.</p></div>
        {formError && <p role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700">{formError}</p>}
        <Field label="Full name" error={errors.name} required>{(p) => <input {...p} autoComplete="name" value={form.name} onChange={set('name')} className={`input ${errors.name ? 'input-error' : ''}`} />}</Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" error={errors.email} required>{(p) => <input {...p} type="email" autoComplete="email" value={form.email} onChange={set('email')} className={`input ${errors.email ? 'input-error' : ''}`} />}</Field>
          <Field label="Phone" error={errors.phone} required>{(p) => <input {...p} type="tel" autoComplete="tel" inputMode="numeric" value={form.phone} onChange={set('phone')} className={`input ${errors.phone ? 'input-error' : ''}`} />}</Field>
        </div>
        <Field label="Password" error={errors.password} hint="At least 8 characters, with a letter and a number." required>{(p) => <input {...p} type="password" autoComplete="new-password" value={form.password} onChange={set('password')} className={`input ${errors.password ? 'input-error' : ''}`} />}</Field>
        <Field label="Confirm password" error={errors.confirm} required>{(p) => <input {...p} type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} className={`input ${errors.confirm ? 'input-error' : ''}`} />}</Field>
        <button className="btn btn-primary btn-lg w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="text-center text-sm text-bark-600">Already registered? <Link to="/login" state={{ from }} className="link">Log in</Link></p>
      </form>
    </div>
  );
}
