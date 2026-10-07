import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, Star, X } from 'lucide-react';
import Field from '../../components/Field';
import Spinner from '../../components/Spinner';
import { ErrorState } from '../../components/EmptyState';
import useAsync from '../../hooks/useAsync';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { categoryService, productService, uploadService, getErrorMessage, getFieldErrors } from '../../services';
import { WEIGHT_OPTIONS } from '../../utils/constants';
import { withFallback } from '../../utils/images';

const BLANK = {
  name: '', description: '', category: '', type: '', brand: 'NaturalHarvest', price: '', discountPrice: '', stock: '', origin: '', farmingMethod: 'Natural farming',
  isOrganic: false, isFeatured: false, isBestSeller: false, images: [], grams: [250, 500, 1000, 2000, 5000], benefitsText: '', tagsText: '',
  storageInstructions: 'Store in a cool, dry place in an airtight container, away from direct sunlight.',
  nutrition: { servingSize: '100 g', calories: 0, protein: 0, carbohydrates: 0, fiber: 0, fat: 0, iron: 0, calcium: 0 },
};
const NUTRI = [['calories', 'Energy (kcal)'], ['protein', 'Protein (g)'], ['carbohydrates', 'Carbs (g)'], ['fiber', 'Fibre (g)'], ['fat', 'Fat (g)'], ['iron', 'Iron (mg)'], ['calcium', 'Calcium (mg)']];

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  useDocumentTitle(editing ? 'Edit product' : 'Add product');
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);
  const cats = useAsync(() => categoryService.list(), []);
  const existing = useAsync(() => (editing ? productService.get(id) : Promise.resolve(null)), [id]);
  const uploads = useAsync(() => uploadService.status(), []);
  const [f, setF] = useState(BLANK);
  const [urlInput, setUrlInput] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const p = existing.data;
    if (!p) return;
    setF({ ...BLANK, ...p, category: p.category._id, price: p.price, discountPrice: p.discountPrice || '', grams: p.weightOptions.map((w) => w.grams), benefitsText: (p.benefits || []).join('\n'), tagsText: (p.tags || []).join(', '), nutrition: { ...BLANK.nutrition, ...p.nutritionalInformation } });
  }, [existing.data]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const toggleWeight = (g) => setF({ ...f, grams: f.grams.includes(g) ? f.grams.filter((x) => x !== g) : [...f.grams, g] });

  const onFiles = async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    setUploading(true);
    try { const { urls } = await uploadService.images(files); setF((cur) => ({ ...cur, images: [...cur.images, ...urls] })); toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded.`); }
    catch (err) { toast.error(getErrorMessage(err)); } finally { setUploading(false); e.target.value = ''; }
  };
  const addUrl = () => { if (/^(https?:\/\/|\/)/.test(urlInput.trim())) { setF({ ...f, images: [...f.images, urlInput.trim()] }); setUrlInput(''); } else toast.error('Enter a full image URL starting with https://'); };

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!f.name.trim()) v.name = 'Product name is required';
    if (!f.category) v.category = 'Choose a category';
    if (!f.description.trim()) v.description = 'Add a description';
    if (!(Number(f.price) > 0)) v.price = 'Enter a price per kg';
    if (f.discountPrice !== '' && Number(f.discountPrice) >= Number(f.price)) v.discountPrice = 'Must be lower than the regular price';
    if (f.stock === '' || Number(f.stock) < 0) v.stock = 'Enter the stock in kg';
    if (!f.grams.length) v.grams = 'Choose at least one pack size';
    setErrors(v);
    if (Object.keys(v).length) { toast.error('Please fix the highlighted fields.'); return; }
    const body = {
      name: f.name.trim(), description: f.description.trim(), category: f.category, type: f.type, brand: f.brand, price: Number(f.price), discountPrice: Number(f.discountPrice) || 0,
      stock: Number(f.stock), origin: f.origin, farmingMethod: f.farmingMethod, isOrganic: f.isOrganic, isFeatured: f.isFeatured, isBestSeller: f.isBestSeller, images: f.images,
      weightOptions: WEIGHT_OPTIONS.filter((w) => f.grams.includes(w.grams)), storageInstructions: f.storageInstructions,
      benefits: f.benefitsText.split('\n').map((s) => s.trim()).filter(Boolean), tags: f.tagsText.split(',').map((s) => s.trim()).filter(Boolean),
      nutritionalInformation: Object.fromEntries(Object.entries(f.nutrition).map(([k, val]) => [k, k === 'servingSize' ? val : Number(val) || 0])),
    };
    setBusy(true);
    try { editing ? await productService.update(id, body) : await productService.create(body); toast.success(editing ? 'Product updated.' : 'Product added.'); navigate('/admin/products'); }
    catch (err) { setErrors(getFieldErrors(err)); toast.error(getErrorMessage(err)); } finally { setBusy(false); }
  };

  if (editing && existing.loading) return <Spinner label="Loading product" />;
  if (existing.error) return <ErrorState message={existing.error} onRetry={existing.reload} />;
  const box = 'card space-y-4 p-6';
  const inp = (k, extra = {}) => (p) => <input {...p} value={f[k]} onChange={set(k)} className={`input ${errors[k] ? 'input-error' : ''}`} {...extra} />;

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">{editing ? 'Edit product' : 'Add product'}</h1><Link to="/admin/products" className="link text-sm">Cancel</Link></div>
      <section className={box}><h2 className="text-lg font-bold">Basics</h2>
        <Field label="Name" error={errors.name} required>{inp('name')}</Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Category" error={errors.category} required>{(p) => <select {...p} value={f.category} onChange={set('category')} className={`input ${errors.category ? 'input-error' : ''}`}><option value="">Select…</option>{cats.data?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>}</Field>
          <Field label="Type" hint="e.g. Toor Dal, Basmati Rice">{inp('type')}</Field>
          <Field label="Brand">{inp('brand')}</Field>
        </div>
        <Field label="Description" error={errors.description} required>{(p) => <textarea {...p} rows={4} value={f.description} onChange={set('description')} className={`input ${errors.description ? 'input-error' : ''}`} />}</Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Origin">{inp('origin')}</Field><Field label="Farming method">{inp('farmingMethod')}</Field></div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">{[['isOrganic', 'Organic'], ['isFeatured', 'Featured'], ['isBestSeller', 'Best seller']].map(([k, l]) => <label key={k} className="flex cursor-pointer items-center gap-2 text-sm font-medium"><input type="checkbox" checked={f[k]} onChange={set(k)} className="h-4 w-4 accent-leaf-700" />{l}</label>)}</div>
      </section>

      <section className={box}><h2 className="text-lg font-bold">Pricing and stock</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price per kg (₹)" error={errors.price} required>{inp('price', { type: 'number', min: 1, step: 'any' })}</Field>
          <Field label="Discount price per kg (₹)" error={errors.discountPrice} hint="Leave empty for no discount.">{inp('discountPrice', { type: 'number', min: 0, step: 'any' })}</Field>
          <Field label="Stock (kg)" error={errors.stock} required>{inp('stock', { type: 'number', min: 0, step: 'any' })}</Field>
        </div>
        <fieldset><legend className="label">Pack sizes offered</legend><div className="flex flex-wrap gap-2">{WEIGHT_OPTIONS.map((w) => <button key={w.grams} type="button" aria-pressed={f.grams.includes(w.grams)} onClick={() => toggleWeight(w.grams)} className={`chip ${f.grams.includes(w.grams) ? 'chip-active' : ''}`}>{w.label}</button>)}</div>{errors.grams && <p className="field-error">{errors.grams}</p>}</fieldset>
      </section>

      <section className={box}><h2 className="text-lg font-bold">Images</h2>
        {f.images.length > 0 && <ul className="flex flex-wrap gap-3">{f.images.map((src, i) => <li key={src + i} className="relative"><img src={src} onError={withFallback} alt={`Product ${i + 1}`} className="h-24 w-24 rounded-xl object-cover" />{i === 0 && <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-full bg-leaf-800 px-2 py-0.5 text-[10px] font-bold text-oat-50"><Star className="h-3 w-3" />Main</span>}<button type="button" onClick={() => setF({ ...f, images: f.images.filter((_, j) => j !== i) })} className="absolute -right-2 -top-2 rounded-full bg-danger-500 p-1 text-white shadow" aria-label={`Remove image ${i + 1}`}><X className="h-3.5 w-3.5" /></button>{i > 0 && <button type="button" onClick={() => setF({ ...f, images: [src, ...f.images.filter((_, j) => j !== i)] })} className="mt-1 block w-full text-center text-xs font-semibold text-leaf-700 hover:underline">Make main</button>}</li>)}</ul>}
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={onFiles} />
          <button type="button" className="btn btn-outline" disabled={uploading || uploads.data?.enabled === false} onClick={() => fileRef.current.click()}><ImagePlus className="h-4 w-4" />{uploading ? 'Uploading…' : 'Upload images'}</button>
          {uploads.data?.enabled === false && <p className="text-sm text-bark-600">Uploads are off until Cloudinary keys are added on the server. You can paste image URLs below.</p>}
        </div>
        <div className="flex gap-2"><label className="sr-only" htmlFor="img-url">Image URL</label><input id="img-url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://… image URL" className="input" /><button type="button" className="btn btn-outline" onClick={addUrl}>Add URL</button></div>
      </section>

      <section className={box}><h2 className="text-lg font-bold">Nutrition (per {f.nutrition.servingSize})</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{NUTRI.map(([k, l]) => <Field key={k} label={l}>{(p) => <input {...p} type="number" min="0" step="any" value={f.nutrition[k]} onChange={(e) => setF({ ...f, nutrition: { ...f.nutrition, [k]: e.target.value } })} className="input" />}</Field>)}</div>
      </section>

      <section className={box}><h2 className="text-lg font-bold">Details</h2>
        <Field label="Benefits" hint="One per line. Keep claims factual, with no medical promises.">{(p) => <textarea {...p} rows={3} value={f.benefitsText} onChange={set('benefitsText')} className="input" />}</Field>
        <Field label="Search tags" hint="Comma separated, e.g. arhar, tur, sambar">{inp('tagsText')}</Field>
        <Field label="Storage instructions">{(p) => <textarea {...p} rows={2} value={f.storageInstructions} onChange={set('storageInstructions')} className="input" />}</Field>
      </section>
      <div className="flex justify-end gap-3"><Link to="/admin/products" className="btn btn-outline">Cancel</Link><button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}</button></div>
    </form>
  );
}
