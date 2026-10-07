
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  HandHeart,
  Leaf,
  Quote,
  ShieldCheck,
  Sprout,
  Truck,
} from 'lucide-react';

import Reveal from '../components/Reveal';
import { ProductGrid } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeletons';
import FarmJourney from '../components/FarmJourney';
import RatingStars from '../components/RatingStars';
import { ErrorState } from '../components/EmptyState';

import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';

import {
  categoryService,
  productService,
  publicService,
  reviewService,
  getErrorMessage,
} from '../services';

import { formatDate } from '../utils/format';
import { withFallback } from '../utils/images';


// ---------------------------------------------------------
// Newsletter
// ---------------------------------------------------------

function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({
    busy: false,
    msg: '',
    error: false,
  });

  const submit = async (e) => {
    e.preventDefault();

    setState({
      busy: true,
      msg: '',
      error: false,
    });

    try {
      const r = await publicService.subscribe(email);

      setState({
        busy: false,
        msg: r.message,
        error: false,
      });

      setEmail('');
    } catch (err) {
      setState({
        busy: false,
        msg: getErrorMessage(err),
        error: true,
      });
    }
  };

  return (
    <section className="container-page mt-24">
      <Reveal className="rounded-3xl bg-leaf-800 px-6 py-12 text-center sm:px-12">
        <h2 className="text-3xl font-bold text-oat-50">
          Harvest news, once a month
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-leaf-100/85">
          New-crop arrivals, recipes for the pantry, and first access when a
          small lot is back in stock.
        </p>

        <form
          onSubmit={submit}
          className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="news" className="sr-only">
            Email address
          </label>

          <input
            id="news"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input flex-1 !rounded-full"
          />

          <button
            className="btn btn-accent"
            disabled={state.busy}
          >
            {state.busy ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>

        {state.msg && (
          <p
            role="status"
            className={`mt-4 text-sm font-medium ${
              state.error
                ? 'text-turmeric-300'
                : 'text-leaf-100'
            }`}
          >
            {state.msg}
          </p>
        )}
      </Reveal>
    </section>
  );
}


// ---------------------------------------------------------
// Section
// ---------------------------------------------------------

function Section({
  title,
  linkTo,
  linkLabel,
  children,
}) {
  return (
    <Reveal
      as="section"
      className="container-page mt-24"
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="text-3xl font-bold sm:text-4xl">
          {title}
        </h2>

        {linkTo && (
          <Link
            to={linkTo}
            className="link hidden shrink-0 text-sm sm:inline-flex"
          >
            {linkLabel}
          </Link>
        )}
      </div>

      {children}
    </Reveal>
  );
}


// ---------------------------------------------------------
// Product Row
// ---------------------------------------------------------

function ProductRow({ params = {} }) {
  const {
    data,
    loading,
    error,
    reload,
  } = useAsync(
    () =>
      productService.list({
        ...params,
        limit: 4,
      }),
    []
  );

  if (loading) {
    return <ProductGridSkeleton count={4} />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={reload}
      />
    );
  }

  const products = data?.products || [];

  if (products.length === 0) {
    return (
      <div className="rounded-3xl bg-oat-100 px-6 py-12 text-center">
        <h3 className="text-xl font-bold text-bark-800">
          Products coming soon
        </h3>

        <p className="mt-2 text-sm text-bark-600">
          We are adding fresh products to our store.
        </p>

        <Link
          to="/products"
          className="btn btn-primary mt-5"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <ProductGrid products={products} />
  );
}


// ---------------------------------------------------------
// Home
// ---------------------------------------------------------

    export default function Home() {
      useDocumentTitle();

      const cats = useAsync(
        () => categoryService.list(),
        []
      );

      const reviews = useAsync(
        () => reviewService.featured(),
        []
      );

      return (
        <>
    {/* =====================================================
        HERO SECTION
    ===================================================== */}

    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-leaf-950">

      {/* Background Video */}
      <video
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source
          src="/hero/hero-bg.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Overlay */}
      <div
        className="absolute inset-0 -z-10 bg-leaf-950/50"
        aria-hidden="true"
      />

      {/* Soft Gradient */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-leaf-950/30 via-leaf-950/40 to-leaf-950/80"
        aria-hidden="true"
      />

      {/* Center Content */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-5 py-20 text-center">

        <div className="mx-auto flex max-w-5xl flex-col items-center">

          {/* Badge */}
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-oat-50 shadow-lg backdrop-blur-md">
            <Sprout
              className="h-4 w-4"
              aria-hidden="true"
            />

            Pure from Nature, Healthy for Life
          </p>

          {/* Heading */}
          <h1 className="mt-7 max-w-5xl text-[2.8rem] font-extrabold leading-[0.98] tracking-tight text-oat-50 sm:text-6xl md:text-7xl lg:text-[5rem]">
            Natural Goodness in Every Grain
          </h1>

          {/* Description */}
          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-oat-100/90 sm:text-lg md:text-xl">
            Shop premium natural pulses and rice sourced with care
            from trusted farmers.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-wrap justify-center gap-4">

            <Link
              to="/products"
              className="btn btn-accent btn-lg"
            >
              Shop Now
            </Link>

            <Link
              to="/categories"
              className="btn btn-lg border border-white/60 text-oat-50 backdrop-blur-sm hover:bg-white/15"
            >
              Explore Products
            </Link>

          </div>

        </div>

      </div>

    </section>

      {/* =====================================================
          SHOP BY CATEGORY
      ===================================================== */}

      <Section
        title="Shop by category"
        linkTo="/categories"
        linkLabel="All categories"
      >
        {cats.loading ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="skeleton aspect-[16/10] rounded-3xl"
              />
            ))}
          </div>
        ) : cats.error ? (
          <ErrorState
            message={cats.error}
            onRetry={cats.reload}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">

            {cats.data.map((c) => {

              // Map category slug to your images
              const categoryImage =
                c.slug?.toLowerCase() === 'pulses'
                  ? '/categories/Pulses.jpg'
                  : c.slug?.toLowerCase() === 'rice'
                    ? '/categories/Rice.jpg'
                    : c.image;

              return (
                <Link
                  key={c._id}
                  to={`/category/${c.slug}`}
                  className="group relative overflow-hidden rounded-3xl"
                >

                  {/* Category Image */}
                  <img
                    src={categoryImage}
                    onError={withFallback}
                    alt={c.name}
                    loading="lazy"
                    className="
                      aspect-[16/10]
                      w-full
                      object-cover
                      transition
                      duration-500
                      group-hover:scale-105
                    "
                  />

                  {/* Dark Gradient */}
                  <span
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-leaf-950/90
                      via-leaf-950/25
                      to-transparent
                    "
                  />

                  {/* Category Information */}
                  <span className="absolute inset-x-0 bottom-0 p-5 text-oat-50">

                    <span className="block font-display text-2xl font-bold">
                      {c.name}
                    </span>

                    <span className="mt-1 block text-sm text-leaf-100/90">
                      {c.productCount} products
                    </span>

                  </span>

                </Link>
              );
            })}

          </div>
        )}
      </Section>


{/* =====================================================
    FEATURED PRODUCTS
===================================================== */}

<Section
  title="Featured this season"
  linkTo="/products"
  linkLabel="Shop all"
>
  <ProductRow />
</Section>


      {/* =====================================================
          BEST SELLERS
      ===================================================== */}

      <Section
        title="Best sellers"
        linkTo="/products?sort=bestselling"
        linkLabel="See more"
      >
        <ProductRow
          params={{
            bestSeller: 'true',
            sort: 'bestselling',
          }}
        />
      </Section>


      {/* =====================================================
          ABOUT SECTION
      ===================================================== */}

      <Reveal
        as="section"
        className="container-page mt-24 grid items-center gap-10 lg:grid-cols-2"
      >

        <div className="relative overflow-hidden rounded-3xl">

          <img
            src="/hero/about.jpg"
            onError={withFallback}
            alt="Pulses and rice from our partner farms"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />

        </div>

        <div>

          <h2 className="text-3xl font-bold sm:text-4xl">
            Grown slowly, cleaned by hand, packed in small batches
          </h2>

          <p className="mt-4 text-[17px] leading-relaxed text-bark-700">
            Our organic lots come from rain-fed farms that rotate
            crops and skip synthetic pesticides. We check every batch,
            sieve out stones and broken grains, and pack with no polish,
            colour or preservatives.
          </p>

          <ul className="mt-6 space-y-3 text-[15px]">

            {[
              'Certified organic ranges, clearly labelled',
              'Farm and region shown on every product',
              'No unnecessary processing',
            ].map((t) => (
              <li
                key={t}
                className="flex gap-3"
              >
                <BadgeCheck
                  className="h-5 w-5 shrink-0 text-leaf-600"
                  aria-hidden="true"
                />

                {t}
              </li>
            ))}

          </ul>

          <Link
            to="/about"
            className="btn btn-primary mt-7"
          >
            Why NaturalHarvest?
          </Link>

        </div>

      </Reveal>


      {/* =====================================================
          WHY CHOOSE US
      ===================================================== */}

      <Section title="Why choose us">

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {[
            [
              Leaf,
              'Naturally grown',
              'Rain-fed fields, crop rotation, no synthetic colour.',
            ],
            [
              HandHeart,
              'Farmer sourced',
              'We buy directly and pay fairly, so quality stays high.',
            ],
            [
              ShieldCheck,
              'Quality checked',
              'Each lot is inspected before it is packed.',
            ],
            [
              Truck,
              'Delivered to you',
              'Free delivery over ₹500, cash on delivery available.',
            ],
          ].map(([Icon, t, d]) => (

            <div
              key={t}
              className="rounded-2xl bg-oat-100 p-6"
            >

              <Icon
                className="h-8 w-8 text-leaf-700"
                aria-hidden="true"
              />

              <h3 className="mt-4 text-lg font-bold">
                {t}
              </h3>

              <p className="mt-1.5 text-[15px] leading-relaxed text-bark-600">
                {d}
              </p>

            </div>

          ))}

        </div>

      </Section>


      {/* =====================================================
          FARM JOURNEY
      ===================================================== */}

      <Section title="From farm to your kitchen">
        <FarmJourney />
      </Section>


      {/* =====================================================
          CUSTOMER REVIEWS
      ===================================================== */}

      {reviews.data?.length > 0 && (
        <Section title="What customers say">

          <div className="grid gap-5 md:grid-cols-3">

            {reviews.data
              .slice(0, 3)
              .map((r) => (

                <figure
                  key={r._id}
                  className="card flex flex-col p-6"
                >

                  <Quote
                    className="h-6 w-6 text-turmeric-500"
                    aria-hidden="true"
                  />

                  <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed">
                    {r.comment}
                  </blockquote>

                  <figcaption className="mt-5 border-t border-oat-200 pt-4 text-sm">

                    <RatingStars value={r.rating} />

                    <p className="mt-1.5 font-semibold">
                      {r.user?.name}
                    </p>

                    <p className="text-bark-500">
                      on{' '}
                      <Link
                        className="link !font-medium"
                        to={`/products/${r.product?.slug}`}
                      >
                        {r.product?.name}
                      </Link>
                      ,{' '}
                      {formatDate(
                        r.createdAt,
                        {
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </p>

                  </figcaption>

                </figure>

              ))}

          </div>

        </Section>
      )}


      {/* =====================================================
          NEWSLETTER
      ===================================================== */}

      <Newsletter />
    </>
  );
}
