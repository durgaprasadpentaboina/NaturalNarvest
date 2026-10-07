import useAsync from '../../hooks/useAsync';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { adminService, getErrorMessage } from '../../services';
import { useToast } from '../../context/ToastContext';
import { ErrorState } from '../../components/EmptyState';
import { formatDateTime } from '../../utils/format';

export default function Messages() {
  useDocumentTitle('Customer messages');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => adminService.messages(), []);
  const read = async (m) => { try { await adminService.markMessageRead(m._id); reload(); } catch (err) { toast.error(getErrorMessage(err)); } };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Messages</h1>
      {error ? <ErrorState message={error} onRetry={reload} /> : loading ? <div className="skeleton h-32" /> : data.length === 0 ? <p className="text-bark-600">No messages from the contact form yet.</p> : (
        <ul className="space-y-3">{data.map((m) => (
          <li key={m._id} className={`card p-5 ${m.isRead ? 'opacity-70' : 'border-l-4 border-l-turmeric-400'}`}>
            <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold">{m.subject || 'General enquiry'}</p><p className="text-sm text-bark-600">{m.name} · <a className="link" href={`mailto:${m.email}`}>{m.email}</a> · {formatDateTime(m.createdAt)}</p></div>{!m.isRead && <button type="button" className="btn btn-outline btn-sm" onClick={() => read(m)}>Mark as read</button>}</div>
            <p className="mt-3 whitespace-pre-line leading-relaxed">{m.message}</p></li>))}</ul>)}
    </div>
  );
}
