import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getErrorMessage } from '../services';

export default function Login() {
  useDocumentTitle('Log in');
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const from = useLocation().state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={user.role === 'admin' && from === '/' ? '/admin' : from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try { const u = await login(form); toast.success(`Welcome back, ${u.name.split(' ')[0]}.`); navigate(u.role === 'admin' && from === '/' ? '/admin' : from, { replace: true }); }
    catch (err) { setError(getErrorMessage(err)); } finally { setBusy(false); }
  };
  return (
    <div className="container-page flex justify-center py-12 md:py-20">
      <form onSubmit={submit} className="card w-full max-w-md space-y-5 p-7 sm:p-9" noValidate>
        <div><h1 className="text-3xl font-bold">Log in</h1><p className="mt-1 text-bark-600">Welcome back. Your cart and orders are waiting.</p></div>
        {error && <p role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700">{error}</p>}
        <Field label="Email" required>{(p) => <input {...p} type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />}</Field>
        <Field label="Password" required>{(p) => (
          <div className="relative"><input {...p} type={show ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input pr-11" />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-bark-500" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>)}</Field>
        <button className="btn btn-primary btn-lg w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="text-center text-sm text-bark-600">New here? <Link to="/register" state={{ from }} className="link">Create an account</Link></p>
      </form>
    </div>
  );
}
