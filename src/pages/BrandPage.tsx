import {
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Link,
  useParams,
} from "react-router"

import ProductCard from "../components/products/ProductCard"
import ReviewGrid from "../components/reviews/ReviewGrid"
import ImpressionCard from "../components/impressions/ImpressionCard"
import ReviewerAvatar from "../components/reviewers/ReviewerAvatar"
import BrandLogo from "../components/brands/BrandLogo"
import Breadcrumbs from "../components/navigation/Breadcrumbs"
import PageState from "../components/layout/PageState"

import {
  getBrandBySlug,
  type BrandProfile,
} from "../lib/brands"

import usePageMetadata from "../hooks/usePageMetadata"

function BrandPage() {
  const { slug } =
    useParams<{ slug: string }>()

  const [
    brand,
    setBrand,
  ] =
    useState<BrandProfile | null>(
      null,
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  usePageMetadata({
    title: brand
      ? `${brand.name} | ITGE`
      : "Brand | ITGE",

    description: brand
      ? `Explore ${brand.name} IEMs, reviews and listening impressions at ITGE.`
      : "Explore IEM brands covered by ITGE.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadBrand() {
      if (!slug) {
        setError(
          "No brand was specified.",
        )
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result =
          await getBrandBySlug(
            slug,
          )

        if (!cancelled) {
          setBrand(
            result,
          )
        }
      } catch (loadError) {
        console.error(
          "Could not load brand:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The brand page could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadBrand()

    return () => {
      cancelled = true
    }
  }, [slug])

  const totalProductCoverage =
    useMemo(
      () =>
        brand?.products.reduce(
          (total, product) =>
            total +
            (product.coverageCount ??
              product.reviewCount),
          0,
        ) ?? 0,
      [brand],
    )

  if (loading) {
    return (
      <PageState
        eyebrow="Brand"
        title="Loading brand…"
      />
    )
  }

  if (error) {
    return (
      <PageState
        eyebrow="Brand"
        title="Unable to load brand"
        message={error}
        backTo="/brands"
        backLabel="Back to brands"
      />
    )
  }

  if (!brand) {
    return (
      <PageState
        eyebrow="404"
        title="Brand not found"
        message="The brand you were looking for doesn’t exist or is no longer available."
        backTo="/brands"
        backLabel="Back to brands"
      />
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs
          items={[
            {
              label:
                "Brands",
              to: "/brands",
            },
            {
              label:
                brand.name,
            },
          ]}
        />

        <header className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_28rem]">
            <div className="p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Brand
              </p>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
                {brand.name}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                Explore{" "}
                {brand.name}{" "}
                IEMs represented in
                the ITGE library,
                together with full
                reviews, listening
                impressions and the
                people who contributed
                them.
              </p>

              {brand.website && (
                <a
                  href={
                    brand.website
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 font-semibold text-[var(--accent)] transition hover:opacity-75"
                >
                  Visit brand
                  website
                  <span aria-hidden="true">
                    ↗
                  </span>
                </a>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                  label="IEMs"
                  value={brand.products.length.toString()}
                />

                <StatCard
                  label="Reviews"
                  value={brand.reviewCount.toString()}
                />

                <StatCard
                  label="Impressions"
                  value={brand.impressionCount.toString()}
                />

                <StatCard
                  label="Contributors"
                  value={brand.contributorCount.toString()}
                />

                <StatCard
                  label="Avg. review"
                  value={
                    brand.averageRating ==
                    null
                      ? "—"
                      : `${brand.averageRating.toFixed(
                          1,
                        )}/5`
                  }
                />
              </div>
            </div>

            {/* Brand logo hero */}
            <div className="flex min-h-72 items-center justify-center border-t border-[var(--border)] bg-[var(--background)] p-10 sm:p-12 lg:min-h-0 lg:border-l lg:border-t-0 lg:p-14">
              <BrandLogo
                name={
                  brand.name
                }
                slug={
                  brand.slug
                }
                size="hero"
                eager
              />
            </div>
          </div>
        </header>

        <section className="mt-14">
          <SectionHeader
            eyebrow="Product coverage"
            title={`${brand.name} IEMs`}
            description={
              brand.products
                .length === 0
                ? "No IEMs with published coverage are available yet."
                : `${brand.products.length} ${
                    brand.products
                      .length === 1
                      ? "IEM is"
                      : "IEMs are"
                  } represented by ${totalProductCoverage} ${
                    totalProductCoverage ===
                    1
                      ? "published piece"
                      : "published pieces"
                  } of coverage.`
            }
          />

          {brand.products
            .length === 0 ? (
            <EmptyPanel>
              No covered IEMs from
              this brand are
              available yet.
            </EmptyPanel>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {brand.products.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ),
              )}
            </div>
          )}
        </section>

        {brand.contributors
          .length > 0 && (
          <section className="mt-14">
            <SectionHeader
              eyebrow="Community"
              title="Contributors"
              description={`${brand.contributorCount} ${
                brand.contributorCount ===
                1
                  ? "person has"
                  : "people have"
              } published coverage of ${brand.name}.`}
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {brand.contributors.map(
                (
                  contributor,
                ) => (
                  <Link
                    key={
                      contributor.slug
                    }
                    to={`/members/${contributor.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                  >
                    <ReviewerAvatar
                      name={
                        contributor.name
                      }
                      slug={
                        contributor.slug
                      }
                      size="md"
                      shape="circle"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-semibold group-hover:text-[var(--accent)]">
                        {
                          contributor.name
                        }
                      </p>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {
                          contributor.reviewCount
                        }{" "}
                        {contributor.reviewCount ===
                        1
                          ? "review"
                          : "reviews"}
                        {" · "}
                        {
                          contributor.impressionCount
                        }{" "}
                        {contributor.impressionCount ===
                        1
                          ? "impression"
                          : "impressions"}
                      </p>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </section>
        )}

        <section className="mt-14">
          <SectionHeader
            eyebrow="Full reviews"
            title={`Recent ${brand.name} reviews`}
            description={
              brand.latestReviews
                .length === 0
                ? "No published reviews are available yet."
                : `The latest published ITGE reviews covering ${brand.name} IEMs.`
            }
          />

          {brand.latestReviews
            .length === 0 ? (
            <EmptyPanel>
              No published reviews
              are available yet.
            </EmptyPanel>
          ) : (
            <div className="mt-8">
              <ReviewGrid
                reviews={
                  brand.latestReviews
                }
              />
            </div>
          )}
        </section>

        <section className="mt-14 border-t border-[var(--border)] pt-14">
          <SectionHeader
            eyebrow="Listening notes"
            title={`Recent ${brand.name} impressions`}
            description={
              brand.latestImpressions
                .length === 0
                ? "No published impressions are available yet."
                : `The latest short-form listening impressions covering ${brand.name} IEMs.`
            }
          />

          {brand.latestImpressions
            .length === 0 ? (
            <EmptyPanel>
              No published
              impressions are
              available yet.
            </EmptyPanel>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {brand.latestImpressions.map(
                (
                  impression,
                ) => (
                  <ImpressionCard
                    key={
                      impression.id
                    }
                    impression={
                      impression
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
      <p className="text-sm text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold">
        {value}
      </p>
    </div>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-semibold tracking-tight">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        {description}
      </p>
    </div>
  )
}

function EmptyPanel({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
      {children}
    </div>
  )
}

export default BrandPage