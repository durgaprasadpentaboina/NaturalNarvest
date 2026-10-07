import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, CreditCard, ShoppingBasket } from 'lucide-react';
import Field from '../components/Field';
import EmptyState from '../components/EmptyState';
import { Summary } from './Cart';
import { LinesSkeleton } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { orderService, getErrorMessage, getFieldErrors } from '../services';
import { INDIAN_STATES } from '../utils/constants';
import { formatMoney } from '../utils/format';
import { productImage, withFallback } from '../utils/images';

const BLANK = { house: '', street: '', city: '', district: '', state: '', pincode: '', country: 'India' };

export default function Checkout() {
  useDocumentTitle('Checkout');
  const { user } = useAuth();
  const { items, totals, loading, refresh, clearLocal } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [contact, setContact] = useState({ fullName: user.name, email: user.email, phone: user.phone });
  const [addr, setAddr] = useState(user.addresses?.find((a) => a.isDefault) || user.addresses?.[0] || BLANK);
  const [savedIdx, setSavedIdx] = useState(user.addresses?.length ? 0 : -1);
  const [save, setSave] = useState(!user.addresses?.length);
  const [method, setMethod] = useState('cod');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { refresh().catch(() => {}); }, []); // eslint-disable-line

  const pick = (i) => { setSavedIdx(i); setAddr(i >= 0 ? user.addresses[i] : BLANK); setSave(i < 0); };
  const setA = (k) => (e) => setAddr({ ...addr, [k]: e.target.value });
  const setC = (k) => (e) => setContact({ ...contact, [k]: e.target.value });

  if (!loading && items.length === 0) return <EmptyState icon={ShoppingBasket} title="Nothing to check out" message="Your cart is empty. Add something first." actionLabel="Browse products" actionTo="/products" />;

  const validate = () => {
    const e = {};
    if (contact.fullName.trim().length < 2) e.fullName = 'Enter your name';
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) e.email = 'Enter a valid email address';
    if (!/^\+?[0-9\s-]{10,15}$/.test(contact.phone)) e.phone = 'Enter a valid phone number';
    ['house', 'street', 'city', 'district', 'state'].forEach((k) => { if (!String(addr[k] || '').trim()) e[k] = 'Required'; });
    if (!/^\d{6}$/.test(addr.pincode || '')) e.pincode = 'PIN code must be 6 digits';
    return e;
  };

  const place = async (ev) => {
    ev.preventDefault();
    const e = validate(); setErrors(e); setFormError('');
    if (Object.keys(e).length) { document.querySelector('[aria-invalid="true"]')?.focus(); return; }
    setBusy(true);
    try {
      const { house, street, city, district, state, pincode, country } = addr;
      const order = await orderService.create({ paymentMethod: method, saveAddress: save, shippingAddress: { ...contact, house, street, city, district, state, pincode, country: country || 'India' } });
      clearLocal();
      toast.success(`Order ${order.orderNumber} placed. Thank you!`);
      navigate(`/orders/${order._id}`, { state: { justPlaced: true } });
    } catch (err) {
      const fe = getFieldErrors(err);
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k.replace('shippingAddress.', ''), v])));
      setFormError(getErrorMessage(err)); refresh().catch(() => {});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally { setBusy(false); }
  };

  const inp = (k, src, setter) => (p) => <input {...p} value={src[k] || ''} onChange={setter(k)} className={`input ${errors[k] ? 'input-error' : ''}`} />;
  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="mb-8 text-4xl font-bold">Checkout</h1>
      {formError && <p role="alert" className="mb-6 rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700">{formError}</p>}
      <form onSubmit={place} noValidate className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <section className="card p-6"><h2 className="text-xl font-bold">Customer information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name" error={errors.fullName} className="sm:col-span-2" required>{inp('fullName', contact, setC)}</Field>
              <Field label="Email" error={errors.email} required>{(p) => <input {...p} type="email" value={contact.email} onChange={setC('email')} className={`input ${errors.email ? 'input-error' : ''}`} />}</Field>
              <Field label="Phone" error={errors.phone} required>{(p) => <input {...p} type="tel" value={contact.phone} onChange={setC('phone')} className={`input ${errors.phone ? 'input-error' : ''}`} />}</Field>
            </div></section>

          <section className="card p-6"><h2 className="text-xl font-bold">Shipping address</h2>
            {user.addresses?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Saved addresses">
                {user.addresses.map((a, i) => <button key={a._id} type="button" aria-pressed={savedIdx === i} onClick={() => pick(i)} className={`chip ${savedIdx === i ? 'chip-active' : ''}`}>{a.label}: {a.street}, {a.city}</button>)}
                <button type="button" aria-pressed={savedIdx === -1} onClick={() => pick(-1)} className={`chip ${savedIdx === -1 ? 'chip-active' : ''}`}>New address</button>
              </div>)}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="House / Flat" error={errors.house} required>{inp('house', addr, setA)}</Field>
              <Field label="Street" error={errors.street} required>{inp('street', addr, setA)}</Field>
              <Field label="Village / City" error={errors.city} required>{inp('city', addr, setA)}</Field>
              <Field label="District" error={errors.district} required>{inp('district', addr, setA)}</Field>
              <Field label="State" error={errors.state} required>{(p) => <select {...p} value={addr.state || ''} onChange={setA('state')} className={`input ${errors.state ? 'input-error' : ''}`}><option value="">Select state</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select>}</Field>
              <Field label="PIN code" error={errors.pincode} required>{(p) => <input {...p} inputMode="numeric" maxLength={6} value={addr.pincode || ''} onChange={setA('pincode')} className={`input ${errors.pincode ? 'input-error' : ''}`} />}</Field>
              <Field label="Country" className="sm:col-span-2">{(p) => <input {...p} value={addr.country || 'India'} onChange={setA('country')} className="input" />}</Field>
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm"><input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="h-4 w-4 accent-leaf-700" />Save this address to my profile</label>
          </section>

          <fieldset className="card p-6"><legend className="px-0 text-xl font-bold">Payment</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[['cod', Banknote, 'Cash on Delivery', 'Pay when your order arrives.'], ['online', CreditCard, 'Online Payment', 'Card, UPI or netbanking. Gateway coming soon: we will confirm payment with you after you order.']].map(([v, Icon, t, d]) => (
                <label key={v} className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition ${method === v ? 'border-leaf-700 bg-leaf-50' : 'border-oat-200 hover:border-leaf-300'}`}>
                  <input type="radio" name="pay" value={v} checked={method === v} onChange={() => setMethod(v)} className="mt-1 h-4 w-4 accent-leaf-700" />
                  <span><span className="flex items-center gap-2 font-semibold"><Icon className="h-4 w-4 text-leaf-700" />{t}</span><span className="mt-1 block text-sm text-bark-600">{d}</span></span>
                </label>))}
            </div></fieldset>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          {loading ? <LinesSkeleton lines={2} /> : (
            <Summary totals={totals}>
              <ul className="mt-5 max-h-64 space-y-3 overflow-y-auto border-t border-oat-200 pt-4">
                {items.map((i) => <li key={i._id} className="flex items-center gap-3 text-sm"><img src={productImage(i.product)} onError={withFallback} alt="" className="h-12 w-12 rounded-lg object-cover" /><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{i.product.name}</span><span className="text-bark-500">{i.weightLabel} × {i.quantity}</span></span><span className="font-semibold tabular-nums">{formatMoney(i.price * i.quantity)}</span></li>)}
              </ul>
              <button className="btn btn-primary btn-lg mt-6 w-full" disabled={busy || items.some((i) => !i.inStock)}>{busy ? 'Placing order…' : `Place order · ${formatMoney(totals.total)}`}</button>
              <Link to="/cart" className="link mt-4 block text-center text-sm">Edit cart</Link>
            </Summary>)}
        </aside>
      </form>
    </div>
  );
}
