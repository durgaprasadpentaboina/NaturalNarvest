import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import useAsync from '../../hooks/useAsync';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { categoryService, getErrorMessage, getFieldErrors } from '../../services';
import { useToast } from '../../context/ToastContext';
import Field from '../../components/Field';
import Modal, { ConfirmDialog } from '../../components/Modal';
import { ErrorState } from '../../components/EmptyState';
import { withFallback } from '../../utils/images';

export default function Categories() {
  useDocumentTitle('Manage categories');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => categoryService.list(), []);
  const [edit, setEdit] = useState(null); const [del, setDel] = useState(null);
  const [errors, setErrors] = useState({}); const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    if (!edit.name.trim()) { setErrors({ name: 'Category name is required' }); return; }
    setBusy(true); setErrors({});
    try { const body = { name: edit.name.trim(), description: edit.description, image: edit.image }; edit._id ? await categoryService.update(edit._id, body) : await categoryService.create(body); toast.success('Category saved.'); setEdit(null); reload(); }
    catch (err) { setErrors(getFieldErrors(err)); toast.error(getErrorMessage(err)); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await categoryService.remove(del._id); toast.success('Category deleted.'); setDel(null); reload(); } catch (err) { toast.error(getErrorMessage(err)); setDel(null); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Categories</h1><button type="button" className="btn btn-primary" onClick={() => { setErrors({}); setEdit({ name: '', description: '', image: '' }); }}><Plus className="h-4 w-4" />Add category</button></div>
      {error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="table-wrap"><table className="table"><thead><tr><th>Category</th><th>Description</th><th>Products</th><th className="text-right">Actions</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan={4}><div className="skeleton h-9" /></td></tr> : data.map((c) => (
            <tr key={c._id}><td><div className="flex items-center gap-3"><img src={c.image} onError={withFallback} alt="" className="h-10 w-14 rounded-lg object-cover" /><span className="font-semibold">{c.name}</span></div></td><td className="max-w-xs text-bark-600">{c.description}</td><td>{c.productCount}</td>
              <td><div className="flex justify-end gap-1"><button type="button" className="rounded-full p-2 hover:bg-leaf-100" aria-label={`Edit ${c.name}`} onClick={() => { setErrors({}); setEdit(c); }}><Pencil className="h-4 w-4" /></button><button type="button" className="rounded-full p-2 text-danger-600 hover:bg-danger-50" aria-label={`Delete ${c.name}`} onClick={() => setDel(c)}><Trash2 className="h-4 w-4" /></button></div></td></tr>))}</tbody></table></div>)}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?._id ? 'Edit category' : 'Add category'} size="sm" footer={<><button type="button" className="btn btn-outline" onClick={() => setEdit(null)}>Cancel</button><button form="cat" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save category'}</button></>}>
        {edit && <form id="cat" onSubmit={save} noValidate className="space-y-4">
          <Field label="Name" error={errors.name} required>{(p) => <input {...p} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={`input ${errors.name ? 'input-error' : ''}`} />}</Field>
          <Field label="Description">{(p) => <textarea {...p} rows={3} value={edit.description || ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className="input" />}</Field>
          <Field label="Image URL" hint="Optional. A full https URL or a path like /categories/rice.jpg.">{(p) => <input {...p} value={edit.image || ''} onChange={(e) => setEdit({ ...edit, image: e.target.value })} className="input" />}</Field></form>}
      </Modal>
      <ConfirmDialog open={!!del} danger busy={busy} title="Delete category?" message={`“${del?.name}” will be removed. Categories that still contain products cannot be deleted.`} confirmLabel="Delete" onConfirm={remove} onCancel={() => setDel(null)} />
    </div>
  );
}
