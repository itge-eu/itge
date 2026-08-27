import {
  useEffect,
  useState,
} from "react"

import {
  Link,
} from "react-router"

import {
  getFeaturedReviews,
  getLatestReviews,
  type FeaturedReview,
} from "../lib/reviews"

import {
  getAllImpressions,
} from "../lib/impressions"

import LatestCoverageCarousel, {
  buildLatestCoverageItems,
  type LatestCoverageItem,
} from "../components/home/LatestCoverageCarousel"

function HomePage() {
  const [
    featuredReviews,
    setFeaturedReviews,
  ] =
    useState<
      FeaturedReview[]
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
    reviewsLoading,
    setReviewsLoading,
  ] =
    useState(true)

  const [
    reviewsError,
    setReviewsError,
  ] =
    useState<
      string | null
    >(null)

  useEffect(() => {
    let cancelled =
      false

    async function loadHomepageContent() {
      setReviewsLoading(
        true,
      )

      setReviewsError(
        null,
      )

      try {
        const [
          featured,
          latestReviews,
          impressions,
        ] =
          await Promise.all([
            getFeaturedReviews(),

            getLatestReviews(
              20,
            ),

            getAllImpressions(),
          ])

        if (cancelled) {
          return
        }

        setFeaturedReviews(
          featured.slice(
            0,
            4,
          ),
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
          setReviewsError(
            "The latest ITGE content could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(
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
      featuredReviews.length <
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
        featuredReviews.length,
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
              featuredReviews.length,
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
    featuredReviews.length,
  ])

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      <main>
        {/* INTRO + FEATURED */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(193,151,69,0.13),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(193,151,69,0.10),transparent_40%)]" />

          <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-8 lg:pb-14 lg:pt-16">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
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
                  in-ear monitors
                  through organised
                  product tours.
                </p>

                <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">
                  Our reviews
                  connect what we
                  hear with the
                  artists, genres
                  and music actually
                  used to evaluate
                  each IEM.
                </p>

                <div className="mt-8">
                  <Link
                    to="/reviews"
                    className="inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
                  >
                    Browse reviews
                  </Link>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                      ITGE picks
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      Featured
                    </h2>
                  </div>

                  <Link
                    to="/reviews"
                    className="text-sm font-medium text-[var(--accent)] transition hover:opacity-75"
                  >
                    All reviews →
                  </Link>
                </div>

                {reviewsLoading ? (
                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                    Loading
                    featured
                    content…
                  </div>
                ) : reviewsError ? (
                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
                    <p className="font-medium">
                      Unable to load
                      featured content
                    </p>

                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {
                        reviewsError
                      }
                    </p>
                  </div>
                ) : featuredReviews.length ===
                  0 ? (
                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                    No featured
                    content has been
                    selected yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {featuredReviews.map(
                      (
                        review,
                        index,
                      ) => (
                        <FeaturedTile
                          key={
                            review.id
                          }
                          review={
                            review
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
                to="/reviews"
                className="text-sm font-medium text-[var(--accent)] transition hover:opacity-75"
              >
                Browse all
                reviews →
              </Link>
            </div>
          </div>

          {!reviewsLoading &&
            !reviewsError &&
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

          {reviewsError && (
            <div className="mx-auto mt-10 max-w-7xl px-6 lg:px-8">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                {
                  reviewsError
                }
              </div>
            </div>
          )}
        </section>

        {/* JOIN */}
        <section
          id="join"
          className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-20 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                Take part
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Join the community
                or send an IEM on
                tour.
              </h2>

              <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
                ITGE connects
                experienced
                listeners, tour
                organisers and
                brands through
                structured European
                review tours.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="group flex min-h-80 flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] dark:shadow-none">
                <div className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                  For listeners
                </div>

                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Become an ITGE
                  reviewer
                </h3>

                <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
                  Join our European
                  tour community,
                  listen to new and
                  established
                  in-ear monitors,
                  and share
                  thoughtful
                  reviews based on
                  real-world
                  listening.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "European tours",
                    "Independent reviews",
                    "Shared experience",
                  ].map(
                    (item) => (
                      <span
                        key={
                          item
                        }
                        className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-xs text-[var(--muted)]"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>

                <Link
                  to="/join"
                  className="mt-auto inline-flex items-center pt-10 text-sm font-semibold text-[var(--accent)] transition group-hover:opacity-75"
                >
                  Join ITGE →
                </Link>
              </article>

              <article className="group flex min-h-80 flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] dark:shadow-none">
                <div className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                  For brands
                </div>

                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Let Europe hear
                  your IEM
                </h3>

                <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
                  Put your product
                  into the hands of
                  experienced
                  reviewers across
                  Europe through an
                  organised tour
                  with independent
                  listening
                  coverage.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "Multiple reviewers",
                    "European reach",
                    "Structured feedback",
                  ].map(
                    (item) => (
                      <span
                        key={
                          item
                        }
                        className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-xs text-[var(--muted)]"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>

                <Link
                  to="/join"
                  className="mt-auto inline-flex items-center pt-10 text-sm font-semibold text-[var(--accent)] transition group-hover:opacity-75"
                >
                  Propose a tour →
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section
          id="about"
          className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-6 py-20 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                Built differently
              </p>

              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">
                Reviews connected
                to the music used
                to evaluate them.
              </h2>
            </div>

            <div className="space-y-5 text-lg leading-8 text-[var(--muted)]">
              <p>
                Most review sites
                tell you what a
                product sounds
                like. ITGE also
                records which
                artists, genres and
                sonic qualities
                informed that
                opinion.
              </p>

              <p>
                That makes it
                possible to browse
                reviews through
                your own listening
                habits rather than
                relying on a single
                score or ranking.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function FeaturedTile({
  review,
  active,
}: {
  review: FeaturedReview
  active: boolean
}) {
  return (
    <Link
      to={`/reviews/${review.slug}`}
      className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border bg-[var(--surface)] transition-all duration-700 sm:rounded-3xl ${
        active
          ? "scale-[1.025] border-[var(--accent)] shadow-lg"
          : "border-[var(--border)]"
      } hover:-translate-y-0.5 hover:border-[var(--accent)]`}
    >
      {review.heroImageUrl ? (
        <img
          src={
            review.heroImageUrl
          }
          alt={`${review.brand} ${review.model}`}
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
        <div className="mb-auto">
          <span
            className={`rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.13em] backdrop-blur-sm transition-all duration-700 sm:px-2.5 sm:text-[10px] ${
              active
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "border-white/25 bg-black/30"
            }`}
          >
            Review
          </span>
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-xs">
          {review.brand}
        </p>

        <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-tight sm:text-xl">
          {review.model}
        </h3>
      </div>
    </Link>
  )
}

export default HomePage