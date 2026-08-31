import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Link,
  useParams,
} from "react-router"

import ReviewGrid from "../components/reviews/ReviewGrid"
import ImpressionCard from "../components/impressions/ImpressionCard"
import ReviewerAvatar from "../components/reviewers/ReviewerAvatar"
import Breadcrumbs from "../components/navigation/Breadcrumbs"
import PageState from "../components/layout/PageState"

import {
  getProductBySlug,
  getProductTypeLabel,
  type ProductProfile,
} from "../lib/products"

import usePageMetadata from "../hooks/usePageMetadata"

function ProductPage() {
  const { slug } =
    useParams<{
      slug: string
    }>()

  const [
    product,
    setProduct,
  ] =
    useState<ProductProfile | null>(
      null,
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  const productTypeLabel =
    product
      ? getProductTypeLabel(
          product.productType,
        )
      : "Gear"

  usePageMetadata({
    title: product
      ? `${product.brand.name} ${product.model} | ITGE`
      : "Gear | ITGE",

    description: product
      ? `Reviews, listening impressions, specifications and coverage for the ${product.brand.name} ${product.model}.`
      : "Explore gear reviews, impressions and coverage from ITGE.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      if (!slug) {
        setError(
          "No product was specified.",
        )

        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result =
          await getProductBySlug(
            slug,
          )

        if (!cancelled) {
          setProduct(
            result,
          )
        }
      } catch (loadError) {
        console.error(
          "Could not load product:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The gear page could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProduct()

    return () => {
      cancelled = true
    }
  }, [slug])

  const totalReviewerReviews =
    useMemo(
      () =>
        product?.reviewers.reduce(
          (
            total,
            reviewer,
          ) =>
            total +
            reviewer.reviewCount,
          0,
        ) ?? 0,
      [product],
    )

  const contributorCount =
    useMemo(() => {
      if (!product) {
        return 0
      }

      const contributorSlugs =
        new Set<string>()

      product.reviewers.forEach(
        (reviewer) => {
          contributorSlugs.add(
            reviewer.slug,
          )
        },
      )

      product.impressions.forEach(
        (impression) => {
          contributorSlugs.add(
            impression.reviewer.slug,
          )
        },
      )

      return contributorSlugs.size
    }, [product])

  if (loading) {
    return (
      <PageState
        eyebrow="Gear"
        title="Loading product…"
      />
    )
  }

  if (error) {
    return (
      <PageState
        eyebrow="Gear"
        title="Unable to load product"
        message={error}
        backTo="/gear"
        backLabel="Back to gear"
      />
    )
  }

  if (!product) {
    return (
      <PageState
        eyebrow="404"
        title="Product not found"
        message="The product you were looking for doesn’t exist or is no longer available."
        backTo="/gear"
        backLabel="Back to gear"
      />
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            {
              label:
                "Gear",
              to: "/gear",
            },
            {
              label:
                product.brand
                  .name,
              to: `/brands/${product.brand.slug}`,
            },
            {
              label:
                product.model,
            },
          ]}
        />

        <header className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="p-8 sm:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/brands/${product.brand.slug}`}
                  className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)] transition hover:opacity-70"
                >
                  {
                    product.brand
                      .name
                  }
                </Link>

                <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  {
                    productTypeLabel
                  }
                </span>
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
                {product.model}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                Community reviews,
                listening impressions
                and music references
                for the{" "}
                {
                  product.brand
                    .name
                }{" "}
                {
                  product.model
                }.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Reviews"
                  value={
                    product.reviews.length.toString()
                  }
                />

                <StatCard
                  label="Impressions"
                  value={
                    product.impressions.length.toString()
                  }
                />

                <StatCard
                  label="Avg. review rating"
                  value={
                    product.averageRating ==
                    null
                      ? "—"
                      : `${product.averageRating.toFixed(
                          1,
                        )} ★`
                  }
                />

                <StatCard
                  label="Contributors"
                  value={
                    contributorCount.toString()
                  }
                />
              </div>

              {(product.driverConfiguration ||
                product.releaseYear ||
                product.launchPrice !=
                  null) && (
                <div className="mt-6 border-t border-[var(--border)] pt-6">
                  <div className="grid gap-5 sm:grid-cols-[2fr_1fr_1fr]">
                    <div>
                      {product.driverConfiguration && (
                        <ProductDetail
                          label="Driver configuration"
                          value={
                            product.driverConfiguration
                          }
                        />
                      )}
                    </div>

                    <div>
                      {product.releaseYear !=
                        null && (
                        <ProductDetail
                          label="Released"
                          value={
                            product.releaseYear.toString()
                          }
                        />
                      )}
                    </div>

                    <div>
                      {product.launchPrice !=
                        null && (
                        <ProductDetail
                          label="Launch price"
                          value={formatLaunchPrice(
                            product.launchPrice,
                            product.launchCurrency,
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {product.heroImageUrl ? (
              <img
                src={
                  product.heroImageUrl
                }
                alt={`${product.brand.name} ${product.model}`}
                className="aspect-[16/10] h-full w-full object-cover lg:aspect-auto"
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center border-t border-[var(--border)] bg-[var(--surface-soft)] p-8 text-center text-[var(--muted)] lg:border-l lg:border-t-0">
                No product image is
                available yet.
              </div>
            )}
          </div>
        </header>

        {product.reviewers.length >
          0 && (
          <section className="mt-12">
            <SectionHeader
              eyebrow="Full reviews"
              title="Reviewed by"
              description={`${product.reviewers.length} ${
                product.reviewers
                  .length === 1
                  ? "member has"
                  : "members have"
              } published ${totalReviewerReviews} ${
                totalReviewerReviews ===
                1
                  ? "review"
                  : "reviews"
              } of this ${productTypeLabel.toLowerCase()}.`}
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.reviewers.map(
                (
                  reviewer,
                ) => (
                  <Link
                    key={
                      reviewer.slug
                    }
                    to={`/members/${reviewer.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                  >
                    <ReviewerAvatar
                      name={
                        reviewer.name
                      }
                      slug={
                        reviewer.slug
                      }
                      size="md"
                      shape="circle"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-semibold transition group-hover:text-[var(--accent)]">
                        {
                          reviewer.name
                        }
                      </p>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {
                          reviewer.reviewCount
                        }{" "}
                        {reviewer.reviewCount ===
                        1
                          ? "review"
                          : "reviews"}
                      </p>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </section>
        )}

        {(product.artists.length >
          0 ||
          product.genres.length >
            0) && (
          <section className="mt-12 grid gap-8 lg:grid-cols-2">
            {product.artists.length >
              0 && (
              <TagPanel
                eyebrow="Listening references"
                title="Artists mentioned"
              >
                {product.artists.map(
                  (artist) => (
                    <Link
                      key={
                        artist.id
                      }
                      to={`/artists/${artist.slug}`}
                      className="rounded-full border border-[var(--accent)]/45 bg-[var(--accent)]/10 px-3 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                    >
                      {
                        artist.name
                      }
                    </Link>
                  ),
                )}
              </TagPanel>
            )}

            {product.genres.length >
              0 && (
              <TagPanel
                eyebrow="Music coverage"
                title="Genres represented"
              >
                {product.genres.map(
                  (genre) => (
                    <Link
                      key={
                        genre.id
                      }
                      to={`/genres/${genre.slug}`}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      {
                        genre.name
                      }
                    </Link>
                  ),
                )}
              </TagPanel>
            )}
          </section>
        )}

        <section className="mt-14">
          <SectionHeader
            eyebrow="Review library"
            title={`Reviews of ${product.model}`}
          />

          <div className="mt-8">
            {product.reviews.length ===
            0 ? (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                This product does
                not have any
                published reviews
                yet.
              </div>
            ) : (
              <ReviewGrid
                reviews={
                  product.reviews
                }
              />
            )}
          </div>
        </section>

        <section className="mt-14 border-t border-[var(--border)] pt-14">
          <SectionHeader
            eyebrow="Listening notes"
            title={`Impressions of ${product.model}`}
          />

          <div className="mt-8">
            {product.impressions
              .length === 0 ? (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                This product does
                not have any
                published
                impressions yet.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {product.impressions.map(
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
          </div>
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
    <div className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 text-center">
      <p className="text-sm leading-5 text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold">
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
  description?: string
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-semibold tracking-tight">
        {title}
      </h2>

      {description && (
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          {description}
        </p>
      )}
    </div>
  )
}

function ProductDetail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-sm text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  )
}

function formatLaunchPrice(
  price: number,
  currency: string | null,
): string {
  if (!currency) {
    return price.toLocaleString(
      "en-US",
    )
  }

  try {
    return new Intl.NumberFormat(
      "en-US",
      {
        style:
          "currency",
        currency,
        maximumFractionDigits:
          Number.isInteger(
            price,
          )
            ? 0
            : 2,
      },
    ).format(
      price,
    )
  } catch {
    return `${price.toLocaleString(
      "en-US",
    )} ${currency}`
  }
}

function TagPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children:
    React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-semibold">
        {title}
      </h2>

      <div className="mt-5 flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  )
}

export default ProductPage