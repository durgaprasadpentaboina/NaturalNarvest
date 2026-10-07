import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import Field from '../components/Field';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';
import { publicService, getErrorMessage, getFieldErrors } from '../services';

export default function Contact() {
  useDocumentTitle('Contact us');
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErrors({});
    try { const r = await publicService.contact(form); toast.success(r.message); setForm({ name: '', email: '', subject: '', message: '' }); }
    catch (err) { setErrors(getFieldErrors(err)); toast.error(getErrorMessage(err)); } finally { setBusy(false); }
  };
  return (
    <div className="container-page grid gap-12 py-10 md:py-16 lg:grid-cols-[1fr_1.2fr]">
      <div><h1 className="text-4xl font-bold">Contact us</h1><p className="mt-3 max-w-md text-bark-600">Questions about an order, a bulk purchase or where a dal was grown? Write to us.</p>
        <ul className="mt-8 space-y-4">{[[Mail, 'hello@naturalharvest.in'], [Phone, '+91 98765 43210 (Mon to Sat, 9am to 6pm)'], [MapPin, 'Madhya Pradesh, India']].map(([I, t]) => <li key={t} className="flex gap-3"><I className="mt-0.5 h-5 w-5 text-leaf-600" />{t}</li>)}</ul></div>
      <form onSubmit={submit} noValidate className="card space-y-4 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name} required>{(p) => <input {...p} value={form.name} onChange={set('name')} className="input" />}</Field>
          <Field label="Email" error={errors.email} required>{(p) => <input {...p} type="email" value={form.email} onChange={set('email')} className="input" />}</Field>
        </div>
        <Field label="Subject">{(p) => <input {...p} value={form.subject} onChange={set('subject')} className="input" />}</Field>
        <Field label="Message" error={errors.message} required>{(p) => <textarea {...p} rows={5} value={form.message} onChange={set('message')} className="input" />}</Field>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
      </form>
    </div>
  );
}
