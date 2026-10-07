import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Field from '../components/Field';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { authService, orderService, getErrorMessage, getFieldErrors } from '../services';
import { INDIAN_STATES } from '../utils/constants';
import { formatDate, formatMoney } from '../utils/format';

const BLANK = { label: 'Home', fullName: '', phone: '', house: '', street: '', city: '', district: '', state: '', pincode: '', country: 'India', isDefault: false };

function AddressModal({ initial, onClose, onSave }) {
  const [a, setA] = useState(initial);
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setA({ ...a, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    ['house', 'street', 'city', 'district', 'state'].forEach((k) => !String(a[k] || '').trim() && (v[k] = 'Required'));
    if (!/^\d{6}$/.test(a.pincode || '')) v.pincode = 'PIN code must be 6 digits';
    setErr(v);
    if (Object.keys(v).length) return;
    setBusy(true); await onSave(a); setBusy(false);
  };
  const f = (k, label, extra = {}) => <Field label={label} error={err[k]} required={k !== 'label'}>{(p) => <input {...p} value={a[k] || ''} onChange={set(k)} className={`input ${err[k] ? 'input-error' : ''}`} {...extra} />}</Field>;
  return (
    <Modal open onClose={onClose} title={initial._id ? 'Edit address' : 'Add address'} footer={<><button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button><button form="addr" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save address'}</button></>}>
      <form id="addr" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        {f('label', 'Label (Home, Work…)')}{f('house', 'House / Flat')}{f('street', 'Street')}{f('city', 'Village / City')}{f('district', 'District')}
        <Field label="State" error={err.state} required>{(p) => <select {...p} value={a.state} onChange={set('state')} className={`input ${err.state ? 'input-error' : ''}`}><option value="">Select state</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select>}</Field>
        {f('pincode', 'PIN code', { inputMode: 'numeric', maxLength: 6 })}
        <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm"><input type="checkbox" checked={a.isDefault} onChange={(e) => setA({ ...a, isDefault: e.target.checked })} className="h-4 w-4 accent-leaf-700" />Make default</label>
      </form>
    </Modal>
  );
}

export default function Profile() {
  useDocumentTitle('My profile');
  const { user, setUser } = useAuth();
  const wishlist = useWishlist();
  const toast = useToast();
  const orders = useAsync(() => orderService.mine(), []);
  const [form, setForm] = useState({ name: user.name, phone: user.phone });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwErr, setPwErr] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true); setErrors({});
    try { setUser(await authService.updateProfile(form)); toast.success('Profile updated.'); }
    catch (err) { setErrors(getFieldErrors(err)); toast.error(getErrorMessage(err)); } finally { setSaving(false); }
  };
  const saveAddresses = async (addresses, msg) => {
    try { setUser(await authService.updateProfile({ addresses })); toast.success(msg); return true; }
    catch (err) { toast.error(getErrorMessage(err)); return false; }
  };
  const saveAddress = async (a) => {
    let list = user.addresses.map((x) => ({ ...x }));
    list = a._id ? list.map((x) => (x._id === a._id ? a : x)) : [...list, a];
    if (a.isDefault) list = list.map((x) => ({ ...x, isDefault: x === a || x._id === a._id }));
    if (await saveAddresses(list, 'Address saved.')) setEditing(null);
  };
  const changePw = async (e) => {
    e.preventDefault(); setPwErr('');
    try { await authService.changePassword(pw); toast.success('Password updated.'); setPw({ currentPassword: '', newPassword: '' }); }
    catch (err) { setPwErr(getErrorMessage(err)); }
  };

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-4xl font-bold">Hello, {user.name.split(' ')[0]}</h1>
      <p className="text-bark-600">Member since {formatDate(user.createdAt, { month: 'long', year: 'numeric' })}</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="card p-6"><h2 className="text-xl font-bold">Account details</h2>
          <form onSubmit={saveProfile} className="mt-4 space-y-4">
            <Field label="Name" error={errors.name}>{(p) => <input {...p} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />}</Field>
            <Field label="Email" hint="Email cannot be changed.">{(p) => <input {...p} value={user.email} disabled className="input" />}</Field>
            <Field label="Phone" error={errors.phone}>{(p) => <input {...p} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />}</Field>
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </form></section>

        <section className="card p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Addresses</h2><button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(BLANK)}><Plus className="h-4 w-4" />Add</button></div>
          {user.addresses.length === 0 ? <p className="mt-4 text-bark-600">No saved addresses yet. Add one to speed up checkout.</p> : (
            <ul className="mt-4 space-y-3">{user.addresses.map((a) => (
              <li key={a._id} className="flex gap-3 rounded-xl bg-oat-100 p-4 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" />
                <div className="flex-1"><p className="font-semibold">{a.label}{a.isDefault && <span className="ml-2 rounded-full bg-leaf-700 px-2 py-0.5 text-xs text-oat-50">Default</span>}</p><p className="text-bark-700">{a.house}, {a.street}, {a.city}, {a.district}, {a.state} {a.pincode}</p></div>
                <button type="button" className="rounded-full p-1.5 hover:bg-oat-200" aria-label="Edit address" onClick={() => setEditing(a)}><Pencil className="h-4 w-4" /></button>
                <button type="button" className="rounded-full p-1.5 text-danger-600 hover:bg-danger-50" aria-label="Delete address" onClick={() => saveAddresses(user.addresses.filter((x) => x._id !== a._id), 'Address removed.')}><Trash2 className="h-4 w-4" /></button></li>))}</ul>)}
        </section>

        <section className="card p-6"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-bold"><Package className="h-5 w-5 text-leaf-600" />Recent orders</h2><Link to="/orders" className="link text-sm">View all</Link></div>
          {orders.loading ? <div className="skeleton mt-4 h-24" /> : !orders.data?.length ? <p className="mt-4 text-bark-600">You have not ordered yet.</p> : (
            <ul className="mt-4 divide-y divide-oat-200">{orders.data.slice(0, 3).map((o) => <li key={o._id} className="flex items-center justify-between gap-3 py-3 text-sm"><div><Link className="font-semibold hover:text-leaf-600" to={`/orders/${o._id}`}>{o.orderNumber}</Link><p className="text-bark-500">{formatDate(o.createdAt)} · {formatMoney(o.total)}</p></div><StatusBadge status={o.orderStatus} /></li>)}</ul>)}</section>

        <section className="card p-6"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-bold"><Heart className="h-5 w-5 text-leaf-600" />Wishlist</h2><Link to="/wishlist" className="link text-sm">Open</Link></div>
          {wishlist.items.length === 0 ? <p className="mt-4 text-bark-600">Nothing saved yet.</p> : <ul className="mt-4 space-y-2 text-sm">{wishlist.items.slice(0, 4).map((p) => <li key={p._id}><Link className="font-medium hover:text-leaf-600" to={`/products/${p.slug}`}>{p.name}</Link></li>)}</ul>}</section>

        <section className="card p-6 lg:col-span-2"><h2 className="text-xl font-bold">Change password</h2>
          <form onSubmit={changePw} className="mt-4 grid max-w-2xl gap-4 sm:grid-cols-2">
            {pwErr && <p role="alert" className="field-error sm:col-span-2">{pwErr}</p>}
            <Field label="Current password">{(p) => <input {...p} type="password" required autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} className="input" />}</Field>
            <Field label="New password" hint="At least 8 characters, including a number.">{(p) => <input {...p} type="password" required minLength={8} autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} className="input" />}</Field>
            <div><button className="btn btn-outline">Update password</button></div>
          </form></section>
      </div>
      {editing && <AddressModal initial={editing} onClose={() => setEditing(null)} onSave={saveAddress} />}
    </div>
  );
}
