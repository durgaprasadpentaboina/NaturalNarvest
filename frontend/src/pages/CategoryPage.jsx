import { Link, useParams } from 'react-router-dom';
import { FolderX } from 'lucide-react';
import ProductBrowser from '../components/ProductBrowser';
import EmptyState from '../components/EmptyState';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { categoryService } from '../services';

export default function CategoryPage() {
  const { slug } = useParams();
  const { data, loading } = useAsync(() => categoryService.list(), []);
  const category = data?.find((c) => c.slug === slug);
  useDocumentTitle(category?.name);
  if (!loading && !category) return <EmptyState icon={FolderX} title="Category not found" message="That shelf does not exist. Browse all categories instead." actionLabel="View categories" actionTo="/categories" />;
  return (
    <div className="container-page py-8 md:py-12">
      <nav className="mb-3 text-sm text-bark-500" aria-label="Breadcrumb"><Link className="hover:text-leaf-700" to="/categories">Categories</Link> / {category?.name}</nav>
      <h1 className="text-4xl font-bold">{category?.name || '…'}</h1>
      {category && <p className="mb-8 mt-2 max-w-xl text-bark-600">{category.description}</p>}
      {category && <ProductBrowser lockCategory={slug} types={category.types} />}
    </div>
  );
}
