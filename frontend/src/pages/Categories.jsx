
import { Link } from 'react-router-dom';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { categoryService } from '../services';
import { ErrorState } from '../components/EmptyState';
import { withFallback } from '../utils/images';

const categoryImages = {
  Pulses: '/categories/Pulses.jpg',
  Rice: '/categories/Rice.jpg',
};

export default function Categories() {
  useDocumentTitle('Categories');

  const {
    data,
    loading,
    error,
    reload,
  } = useAsync(
    () => categoryService.list(),
    []
  );

  return (
    <div className="container-page pt-28 pb-16 md:pt-32 md:pb-20">

      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold">
          Categories
        </h1>

        <p className="mt-2 max-w-xl text-bark-600">
          Pulses and rice, sorted and cleaned. Pick a shelf to start.
        </p>
      </div>

      {/* Categories */}
      {loading ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="skeleton h-64 rounded-3xl"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-10">
          <ErrorState
            message={error}
            onRetry={reload}
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">

          {data.map((c) => (
            <article
              key={c._id}
              className="group overflow-hidden rounded-3xl bg-white shadow-soft"
            >

              {/* Category Image */}
              <Link
                to={`/category/${c.slug}`}
                className="relative block overflow-hidden"
              >
                <img
                  src={categoryImages[c.name] || c.image}
                  onError={withFallback}
                  alt={c.name}
                  loading="lazy"
                  className="
                    h-52
                    w-full
                    object-cover
                    transition
                    duration-500
                    group-hover:scale-105
                  "
                />
              </Link>

              {/* Category Details */}
              <div className="p-6">

                <div className="flex items-baseline justify-between gap-3">

                  <h2 className="text-2xl font-bold">
                    <Link
                      to={`/category/${c.slug}`}
                      className="hover:text-leaf-700"
                    >
                      {c.name}
                    </Link>
                  </h2>

                  <span className="text-sm text-bark-500">
                    {c.productCount} products
                  </span>

                </div>

                <p className="mt-1.5 text-[15px] text-bark-600">
                  {c.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  {c.types.map((t) => (
                    <Link
                      key={t}
                      to={`/category/${c.slug}?type=${encodeURIComponent(t)}`}
                      className="chip !py-1 text-[13px]"
                    >
                      {t}
                    </Link>
                  ))}

                </div>

              </div>

            </article>
          ))}

        </div>
      )}

    </div>
  );
}
