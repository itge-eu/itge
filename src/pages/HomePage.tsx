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
    latestReviews,
    setLatestReviews,
  ] = useState<FeaturedReview[]>([])

  const [
    reviewsLoading,
    setReviewsLoading,
  ] = useState(true)

  const [
    reviewsError,
    setReviewsError,
  ] = useState<string | null>(null)

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
            featured.slice(0, 4),
          )

          setLatestReviews(latest)
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
        {/* INTRO + FEATURED */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(193,151,69,0.13),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(193,151,69,0.10),transparent_40%)]" />

          <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-8 lg:pb-14 lg:pt-16">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              {/* INTRO */}
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                  IEM Tour Group Europe
                </p>

                <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                  Independent listening.
                  Real community.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
                  ITGE brings together experienced
                  listeners across Europe to review
                  and share impressions of in-ear
                  monitors through organised product
                  tours.
                </p>

                <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">
                  Our reviews connect what we hear
                  with the artists, genres and music
                  actually used to evaluate each IEM.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
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

              {/* FEATURED */}
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
                    Loading featured content…
                  </div>
                ) : reviewsError ? (
                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
                    <p className="font-medium">
                      Unable to load featured content
                    </p>

                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {reviewsError}
                    </p>
                  </div>
                ) : featuredReviews.length === 0 ? (
                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                    No featured content has been
                    selected yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {featuredReviews.map(
                      (review) => (
                        <FeaturedTile
                          key={review.id}
                          review={review}
                        />
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FIND YOUR IEM */}
        <section className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-6 py-12 lg:px-8 lg:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                  Explore differently
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Find the IEM that fits your music.
                </h2>

                <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                  Browse reviews by the artists,
                  genres, reviewers, manufacturers
                  and IEMs that matter to you.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
                {[
                  "Artists",
                  "Genres",
                  "IEMs",
                  "Manufacturers",
                  "Reviewers",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/discover"
                className="inline-flex items-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
              >
                Start discovering →
              </Link>
            </div>
          </div>
        </section>

        {/* LATEST REVIEWS */}
        <section
          id="reviews"
          className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-20 lg:px-8"
        >
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
              latestReviews.length > 0 && (
                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                  {latestReviews.map(
                    (review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
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
                Join the community or send an IEM on
                tour.
              </h2>

              <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
                ITGE connects experienced listeners,
                tour organisers and manufacturers
                through structured European review
                tours.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="group flex min-h-80 flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] dark:shadow-none">
                <div className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                  For listeners
                </div>

                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Become an ITGE reviewer
                </h3>

                <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
                  Join our European tour community,
                  listen to new and established in-ear
                  monitors, and share thoughtful reviews
                  based on real-world listening.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "European tours",
                    "Independent reviews",
                    "Shared experience",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-xs text-[var(--muted)]"
                    >
                      {item}
                    </span>
                  ))}
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
                  Let Europe hear your IEM
                </h3>

                <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
                  Put your product into the hands of
                  experienced reviewers across Europe
                  through an organised tour with
                  independent listening coverage.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "Multiple reviewers",
                    "European reach",
                    "Structured feedback",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-xs text-[var(--muted)]"
                    >
                      {item}
                    </span>
                  ))}
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
                Reviews connected to the music used to
                evaluate them.
              </h2>
            </div>

            <div className="space-y-5 text-lg leading-8 text-[var(--muted)]">
              <p>
                Most review sites tell you what a
                product sounds like. ITGE also records
                which artists, genres and sonic
                qualities informed that opinion.
              </p>

              <p>
                That makes it possible to browse
                reviews through your own listening
                habits rather than relying on a single
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
}: {
  review: FeaturedReview
}) {
  return (
    <Link
      to={`/reviews/${review.slug}`}
      className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] sm:rounded-3xl"
    >
      {review.heroImageUrl ? (
        <img
          src={review.heroImageUrl}
          alt={`${review.brand} ${review.model}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--surface-soft)]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />

      <div className="relative flex h-full flex-col justify-end p-3 text-white sm:p-5">
        <div className="mb-auto">
          <span className="rounded-full border border-white/25 bg-black/30 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.13em] backdrop-blur-sm sm:px-2.5 sm:text-[10px]">
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