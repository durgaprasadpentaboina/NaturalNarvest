import { Compass } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return <EmptyState icon={Compass} title="404: this page wandered off" message="The page you are looking for does not exist or has moved." actionLabel="Back to home" actionTo="/" className="py-28" />;
}
