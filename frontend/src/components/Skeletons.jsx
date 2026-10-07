export function ProductCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="skeleton aspect-square w-full rounded-2xl" />
      <div className="skeleton mt-3 h-3 w-1/3" />
      <div className="skeleton mt-2 h-4 w-4/5" />
      <div className="skeleton mt-2 h-3 w-1/2" />
      <div className="skeleton mt-3 h-9 w-full rounded-full" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4" role="status" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LinesSkeleton({ lines = 4 }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-20 w-full" />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-2" role="status" aria-label="Loading product">
      <div className="skeleton aspect-square w-full rounded-3xl" />
      <div className="space-y-4">
        <div className="skeleton h-4 w-1/4" />
        <div className="skeleton h-10 w-3/4" />
        <div className="skeleton h-5 w-1/3" />
        <div className="skeleton h-12 w-1/2" />
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
