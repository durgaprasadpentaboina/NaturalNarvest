import ProductBrowser from '../components/ProductBrowser';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Products() {
  useDocumentTitle('Shop pulses and rice');
  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="mb-8 text-4xl font-bold">All products</h1>
      <ProductBrowser />
    </div>
  );
}
