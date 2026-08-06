import { useEffect, useState } from "react"

import ReviewGrid from "../reviews/ReviewGrid"

import type { FeaturedReview } from "../../lib/reviews"

type DiscoveryResultsProps = {
  reviews: FeaturedReview[]
  loading: boolean
  error: string | null
  hasFilters: boolean
}

const REVIEWS_PER_PAGE = 12

function DiscoveryResults({
  reviews,
  loading,
  error,
  hasFilters,
}: DiscoveryResultsProps) {
  const [visibleCount, setVisibleCount] =
    useState(REVIEWS_PER_PAGE)

  useEffect(() => {
    setVisibleCount(REVIEWS_PER_PAGE)
  }, [reviews])

  const visibleReviews = reviews.slice(
    0,
    visibleCount,
  )

  const hasMoreReviews =
    visibleCount < reviews.length

  return (
    <section aria-live="polite">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Results
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {loading
              ? "Finding reviews..."
              : `${reviews.length} matching ${
                  reviews.length === 1
                    ? "review"
                    : "reviews"
                }`}
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)]">
            {hasFilters
              ? "Results update whenever you change a filter."
              : "Showing every published ITGE review."}
          </p>
        </div>

        {!loading &&
          !error &&
          reviews.length > REVIEWS_PER_PAGE && (
            <span className="text-sm text-[var(--muted)]">
              Showing {visibleReviews.length} of{" "}
              {reviews.length}
            </span>
          )}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
          Loading matching reviews...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
          <p className="font-semibold">
            Unable to load reviews
          </p>

          <p className="mt-2 text-sm text-[var(--muted)]">
            {error}
          </p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="font-semibold">
            No reviews match this combination
          </p>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Remove one of the selected filters to
            broaden the results.
          </p>
        </div>
      ) : (
        <>
          <ReviewGrid reviews={visibleReviews} />

          {hasMoreReviews && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((current) =>
                    Math.min(
                      current + REVIEWS_PER_PAGE,
                      reviews.length,
                    ),
                  )
                }
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 font-semibold transition hover:border-[var(--accent)] hover:bg-[var(--surface-soft)]"
              >
                Load more reviews
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default DiscoveryResults