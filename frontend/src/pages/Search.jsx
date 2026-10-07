import { useSearchParams } from 'react-router-dom';
import ProductBrowser from '../components/ProductBrowser';
import SearchBar from '../components/SearchBar';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  useDocumentTitle(q ? `Search: ${q}` : 'Search');
  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="mb-5 text-4xl font-bold">{q ? `Results for “${q}”` : 'Search'}</h1>
      <div className="mb-8 max-w-2xl"><SearchBar initialValue={q} large autoFocus={!q} /></div>
      {q ? <ProductBrowser /> : <p className="text-bark-600">Search by product name, category, type, brand or farming method, for example “moong”, “basmati” or “organic”.</p>}
    </div>
  );
}
