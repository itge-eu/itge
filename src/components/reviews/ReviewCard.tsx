import { Link } from "react-router"

import type { FeaturedReview } from "../../lib/reviews"

type ReviewCardProps = {
  review: FeaturedReview
}

function ReviewCard({ review }: ReviewCardProps) {
  const iemUrl = `/iems/${review.iemSlug}`
  const reviewerUrl =
    `/reviewers/${review.reviewerSlug}`
  const reviewUrl = `/reviews/${review.slug}`

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg focus-within:border-[var(--accent)]">
      {/* Primary card action */}
      <Link
        to={reviewUrl}
        aria-label={`Read ${review.brand} ${review.model} review by ${review.reviewer}`}
        className="absolute inset-0 z-0 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      />

      <div className="relative z-10 pointer-events-none flex flex-col gap-6 sm:flex-row">
        {review.heroImageUrl && (
          <div className="shrink-0 overflow-hidden rounded-2xl">
            <img
              src={review.heroImageUrl}
              alt={`${review.brand} ${review.model}`}
              loading="lazy"
              className="h-48 w-full rounded-2xl object-cover transition duration-300 group-hover:scale-[1.025] sm:h-28 sm:w-28"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm uppercase tracking-widest text-[var(--accent)]">
            {review.brand}
          </p>

          <h2 className="mt-1 text-2xl font-semibold">
            <Link
              to={iemUrl}
              className="pointer-events-auto relative z-20 transition hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {review.model}
            </Link>
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Reviewed by{" "}
            <Link
              to={reviewerUrl}
              className="pointer-events-auto relative z-20 font-semibold text-[var(--accent)] transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {review.reviewer}
            </Link>
          </p>

          <p className="mt-4 line-clamp-3 text-[var(--muted)]">
            {review.summary}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm font-semibold">
              {review.rating.toFixed(1)}/5
            </span>

            <span className="font-medium text-[var(--accent)] transition group-hover:translate-x-0.5">
              Read review →
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ReviewCard