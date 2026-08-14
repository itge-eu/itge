import {
  useEffect,
  useState,
} from "react"
import { Link } from "react-router"

import {
  getFeaturedReviews,
  getLatestReviews,
  type FeaturedReview,
} from "../lib/reviews"

import ReviewCard from "../components/reviews/ReviewCard"

function HomePage() {
  const [
    featuredReviews,
    setFeaturedReviews,
  ] = useState<FeaturedReview[]>([])

  const [
    reviewsLoading,
    setReviewsLoading,
  ] = useState(true)

  const [
    reviewsError,
    setReviewsError,
  ] = useState<string | null>(null)

  const [
    latestReviews,
    setLatestReviews,
  ] = useState<FeaturedReview[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadReviews() {
      setReviewsLoading(true)
      setReviewsError(null)

      try {
        const [featured, latest] =
          await Promise.all([
            getFeaturedReviews(),
            getLatestReviews(3),
          ])

        if (!cancelled) {
          setFeaturedReviews(
            featured.slice(0, 3),
          )

          setLatestReviews(
            latest,
          )
        }
      } catch (error) {
        console.error(
          "Could not load homepage reviews:",
          error,
        )

        if (!cancelled) {
          setReviewsError(
            "The reviews could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false)
        }
      }
    }

    void loadReviews()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      <main>
        {/* HERO + FEATURED */}
        <section
          id="featured"
          className="relative overflow-hidden border-b border-[var(--border)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(193,151,69,0.12),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(193,151,69,0.10),transparent_38%)]" />

          <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-16 lg:px-8 lg:pb-20 lg:pt-20">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                  Reviews built around real listening
                </p>

                <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                  Find the IEM that fits
                  your music.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                  Independent reviews
                  from experienced
                  listeners, connected
                  to the music used to
                  evaluate them.
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-3">
                <Link
                  to="/reviews"
                  className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
                >
                  Browse reviews
                </Link>

                <Link
                  to="/discover"
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold transition hover:border-[var(--accent)]"
                >
                  Discover
                </Link>
              </div>
            </div>

            <div className="mt-12 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                  ITGE picks
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Featured
                </h2>
              </div>

              <Link
                to="/reviews"
                className="hidden text-sm font-medium text-[var(--accent)] transition hover:opacity-75 sm:block"
              >
                Explore reviews →
              </Link>
            </div>

            {reviewsLoading && (
              <div className="mt-7 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                Loading featured content…
              </div>
            )}

            {reviewsError && (
              <div className="mt-7 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
                <p className="font-medium">
                  Unable to load featured content
                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  {reviewsError}
                </p>
              </div>
            )}

            {!reviewsLoading &&
              !reviewsError &&
              featuredReviews.length ===
                0 && (
                <div className="mt-7 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                  No featured content has been
                  selected yet.
                </div>
              )}

            {!reviewsLoading &&
              !reviewsError &&
              featuredReviews.length >
                0 && (
                <FeaturedCarousel
                  reviews={
                    featuredReviews
                  }
                />
              )}
          </div>
        </section>

        {/* LATEST REVIEWS */}
        <section className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                  Latest from ITGE
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Latest reviews
                </h2>
              </div>

              <Link
                to="/reviews"
                className="text-sm font-medium text-[var(--accent)] transition hover:opacity-75"
              >
                View all reviews →
              </Link>
            </div>

            {!reviewsLoading &&
              !reviewsError &&
              latestReviews.length >
                0 && (
                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                  {latestReviews.map(
                    (review) => (
                      <ReviewCard
                        key={
                          review.id
                        }
                        review={
                          review
                        }
                        variant="home"
                      />
                    ),
                  )}
                </div>
              )}
          </div>
        </section>

        {/* JOIN */}
        <section
          id="join"
          className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-6 py-20 lg:px-8"
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
                manufacturers
                through structured
                European review
                tours.
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
                  established in-ear
                  monitors, and share
                  thoughtful reviews
                  based on real-world
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
                  For manufacturers
                </div>

                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Let Europe hear your
                  IEM
                </h3>

                <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
                  Put your product
                  into the hands of
                  experienced
                  reviewers across
                  Europe through an
                  organised tour with
                  independent,
                  long-form listening
                  impressions.
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
          className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-20 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                Built differently
              </p>

              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">
                Reviews connected to
                the music used to
                evaluate them.
              </h2>
            </div>

            <div className="space-y-5 text-lg leading-8 text-[var(--muted)]">
              <p>
                Most review sites tell
                you what a product
                sounds like. ITGE also
                records which artists,
                genres and sonic
                qualities informed
                that opinion.
              </p>

              <p>
                That makes it possible
                to browse reviews
                through your own
                listening habits
                rather than relying
                on a single score or
                ranking.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function FeaturedCarousel({
  reviews,
}: {
  reviews: FeaturedReview[]
}) {
  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0)

  const activeReview =
    reviews[activeIndex] ??
    reviews[0]

  const goPrevious = () => {
    setActiveIndex(
      (current) =>
        current === 0
          ? reviews.length - 1
          : current - 1,
    )
  }

  const goNext = () => {
    setActiveIndex(
      (current) =>
        current ===
        reviews.length - 1
          ? 0
          : current + 1,
    )
  }

  if (!activeReview) {
    return null
  }

  return (
    <div className="mt-7">
      <article className="group relative min-h-[28rem] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm sm:min-h-[34rem] lg:min-h-[38rem]">
        <Link
          to={`/reviews/${activeReview.slug}`}
          aria-label={`Read ${activeReview.brand} ${activeReview.model} review`}
          className="absolute inset-0 z-10 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
        />

        {activeReview.heroImageUrl ? (
          <img
            key={
              activeReview.heroImageUrl
            }
            src={
              activeReview.heroImageUrl
            }
            alt={`${activeReview.brand} ${activeReview.model}`}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.015]"
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--surface-soft)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5" />

        <div className="pointer-events-none relative z-20 flex min-h-[28rem] flex-col justify-end p-6 text-white sm:min-h-[34rem] sm:p-8 lg:min-h-[38rem] lg:p-10">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/25 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm">
              Review
            </span>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-sm">
              {
                activeReview.brand
              }
            </p>

            <h3 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {
                activeReview.model
              }
            </h3>

            {activeReview.summary && (
              <p className="mt-4 max-w-2xl line-clamp-2 text-sm leading-6 text-white/80 sm:text-lg sm:leading-7">
                {
                  activeReview.summary
                }
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:text-base">
              <span>
                By{" "}
                <strong>
                  {
                    activeReview.reviewer
                  }
                </strong>
              </span>

              <span className="font-semibold">
                {activeReview.rating.toFixed(
                  1,
                )}
                /5
              </span>

              <span className="font-semibold text-white">
                Read review →
              </span>
            </div>
          </div>
        </div>

        {reviews.length > 1 && (
          <>
            <button
              type="button"
              onClick={(
                event,
              ) => {
                event.preventDefault()
                event.stopPropagation()
                goPrevious()
              }}
              aria-label="Previous featured item"
              className="absolute left-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-2xl text-white backdrop-blur-md transition hover:bg-black/55 sm:left-6"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={(
                event,
              ) => {
                event.preventDefault()
                event.stopPropagation()
                goNext()
              }}
              aria-label="Next featured item"
              className="absolute right-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-2xl text-white backdrop-blur-md transition hover:bg-black/55 sm:right-6"
            >
              ›
            </button>
          </>
        )}
      </article>

      {reviews.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {reviews.map(
            (
              review,
              index,
            ) => (
              <button
                key={review.id}
                type="button"
                onClick={() =>
                  setActiveIndex(
                    index,
                  )
                }
                aria-label={`Show featured item ${
                  index + 1
                }`}
                aria-current={
                  activeIndex ===
                  index
                    ? "true"
                    : undefined
                }
                className={`h-2.5 rounded-full transition-all ${
                  activeIndex ===
                  index
                    ? "w-8 bg-[var(--accent)]"
                    : "w-2.5 bg-[var(--border)] hover:bg-[var(--muted)]"
                }`}
              />
            ),
          )}
        </div>
      )}
    </div>
  )
}

export default HomePage