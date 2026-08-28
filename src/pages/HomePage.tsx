import {
  useEffect,
  useState,
} from "react"

import {
  Link,
} from "react-router"

import {
  getLatestReviews,
} from "../lib/reviews"

import {
  getAllImpressions,
} from "../lib/impressions"

import {
  getProducts,
  type ProductDirectoryItem,
} from "../lib/products"

import LatestCoverageCarousel, {
  buildLatestCoverageItems,
  type LatestCoverageItem,
} from "../components/home/LatestCoverageCarousel"

import TakePartSection from "../components/home/TakePartSection"
import AboutTeaser from "../components/home/AboutTeaser"

function HomePage() {
  const [
    featuredGear,
    setFeaturedGear,
  ] =
    useState<
      ProductDirectoryItem[]
    >([])

  const [
    latestCoverage,
    setLatestCoverage,
  ] =
    useState<
      LatestCoverageItem[]
    >([])

  const [
    activeFeaturedIndex,
    setActiveFeaturedIndex,
  ] =
    useState(0)

  const [
    contentLoading,
    setContentLoading,
  ] =
    useState(true)

  const [
    contentError,
    setContentError,
  ] =
    useState<
      string | null
    >(null)

  useEffect(() => {
    let cancelled =
      false

    async function loadHomepageContent() {
      setContentLoading(
        true,
      )

      setContentError(
        null,
      )

      try {
        const [
          products,
          latestReviews,
          impressions,
        ] =
          await Promise.all([
            getProducts(),

            getLatestReviews(
              20,
            ),

            getAllImpressions(),
          ])

        if (cancelled) {
          return
        }

        /*
         * Pick four random pieces of gear
         * on each homepage load.
         *
         * getProducts() already only
         * returns gear represented by
         * published ITGE coverage.
         */
        const featured =
          [...products]
            .filter(
              (product) =>
                product.featured &&
                Boolean(
                  product.heroImageUrl,
                ),
            )
            .sort(
              () =>
                Math.random() -
                0.5,
            )
            .slice(
              0,
              4,
            )

        setFeaturedGear(
          featured,
        )

        setLatestCoverage(
          buildLatestCoverageItems(
            latestReviews,
            impressions,
          ),
        )
      } catch (error) {
        console.error(
          "Could not load homepage content:",
          error,
        )

        if (!cancelled) {
          setContentError(
            "The latest ITGE content could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setContentLoading(
            false,
          )
        }
      }
    }

    void loadHomepageContent()

    return () => {
      cancelled =
        true
    }
  }, [])

  useEffect(() => {
    if (
      featuredGear.length <
      2
    ) {
      return
    }

    const sequence = [
      0,
      3,
      1,
      2,
    ]

    let sequenceIndex =
      0

    setActiveFeaturedIndex(
      sequence[0] %
        featuredGear.length,
    )

    const interval =
      window.setInterval(
        () => {
          sequenceIndex =
            (
              sequenceIndex +
              1
            ) %
            sequence.length

          setActiveFeaturedIndex(
            sequence[
              sequenceIndex
            ] %
              featuredGear.length,
          )
        },
        6000,
      )

    return () => {
      window.clearInterval(
        interval,
      )
    }
  }, [
    featuredGear.length,
  ])

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      <main>
        {/* INTRO + FEATURED GEAR */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(193,151,69,0.13),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(193,151,69,0.10),transparent_40%)]" />

          <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-8 lg:pb-14 lg:pt-16">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              {/* INTRO */}
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                  IEM Tour Group
                  Europe
                </p>

                <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                  Independent
                  listening. Real
                  community.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
                  ITGE brings
                  together
                  experienced
                  listeners across
                  Europe to review
                  and share
                  impressions of
                  audio gear through
                  organised product
                  tours.
                </p>

                <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">
                  Our reviews
                  connect what we
                  hear with the
                  artists, genres
                  and music actually
                  used to evaluate
                  each piece of
                  gear.
                </p>

                <div className="mt-8">
                  <Link
                    to="/about"
                    className="inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
                  >
                    Learn more
                  </Link>
                </div>
              </div>

              {/* FEATURED GEAR */}
              <div>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                      Explore ITGE
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      Featured gear
                    </h2>
                  </div>

                  <Link
                    to="/gear"
                    className="text-sm font-medium text-[var(--accent)] transition hover:opacity-75"
                  >
                    Browse gear →
                  </Link>
                </div>

                {contentLoading ? (
                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                    Loading
                    featured gear…
                  </div>
                ) : contentError ? (
                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
                    <p className="font-medium">
                      Unable to load
                      featured gear
                    </p>

                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {
                        contentError
                      }
                    </p>
                  </div>
                ) : featuredGear.length ===
                  0 ? (
                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                    No featured gear
                    is available yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {featuredGear.map(
                      (
                        product,
                        index,
                      ) => (
                        <FeaturedGearTile
                          key={
                            product.id
                          }
                          product={
                            product
                          }
                          active={
                            index ===
                            activeFeaturedIndex
                          }
                        />
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* LATEST COVERAGE */}
        <section
          id="reviews"
          className="overflow-hidden border-t border-[var(--border)] bg-[var(--surface-soft)] py-16 lg:py-20"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                  From the tours
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  What we've been
                  listening to
                </h2>

                <p className="mt-4 max-w-2xl text-[var(--muted)]">
                  The latest
                  reviews and
                  listening
                  impressions from
                  ITGE members
                  across Europe.
                </p>
              </div>

              <Link
                to="/discover"
                className="text-sm font-medium text-[var(--accent)] transition hover:opacity-75"
              >
                Browse all
                reviews →
              </Link>
            </div>
          </div>

          {!contentLoading &&
            !contentError &&
            latestCoverage.length >
              0 && (
              <div className="mt-10">
                <LatestCoverageCarousel
                  items={
                    latestCoverage
                  }
                />
              </div>
            )}

          {contentError && (
            <div className="mx-auto mt-10 max-w-7xl px-6 lg:px-8">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                {
                  contentError
                }
              </div>
            </div>
          )}
        </section>

        <TakePartSection />

        <AboutTeaser />
      </main>
    </div>
  )
}

function FeaturedGearTile({
  product,
  active,
}: {
  product: ProductDirectoryItem
  active: boolean
}) {
  return (
    <Link
      to={`/gear/${product.slug}`}
      className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border bg-[var(--surface)] transition-all duration-700 sm:rounded-3xl ${
        active
          ? "scale-[1.025] border-[var(--accent)] shadow-lg"
          : "border-[var(--border)]"
      } hover:-translate-y-0.5 hover:border-[var(--accent)]`}
    >
      {product.heroImageUrl ? (
        <img
          src={
            product.heroImageUrl
          }
          alt={`${product.brand.name} ${product.model}`}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.035] ${
            active
              ? "scale-[1.035] brightness-110"
              : "scale-100 brightness-95"
          }`}
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--surface-soft)]" />
      )}

      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent transition-opacity duration-700 ${
          active
            ? "opacity-90"
            : "opacity-100"
        }`}
      />

      <div className="relative flex h-full flex-col justify-end p-3 text-white sm:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-xs">
          {product.brand.name}
        </p>

        <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-tight sm:text-xl">
          {product.model}
        </h3>
      </div>
    </Link>
  )
}

export default HomePage