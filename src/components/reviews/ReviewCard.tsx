import { Link } from "react-router"

import type { FeaturedReview } from "../../lib/reviews"

type ReviewCardProps = {
  review: FeaturedReview
}

function ReviewCard({ review }: ReviewCardProps) {
  const iemUrl = `/iems/${review.iemSlug}`
  const reviewUrl = `/reviews/${review.slug}`

  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex flex-col gap-6 sm:flex-row">
        {review.heroImageUrl && (
          <Link
            to={iemUrl}
            aria-label={`View ${review.brand} ${review.model}`}
            className="block shrink-0 overflow-hidden rounded-2xl"
          >
            <img
              src={review.heroImageUrl}
              alt={`${review.brand} ${review.model}`}
              loading="lazy"
              className="h-48 w-full rounded-2xl object-cover transition duration-200 hover:scale-[1.02] hover:opacity-90 sm:h-28 sm:w-28"
            />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm uppercase tracking-widest text-[var(--accent)]">
            {review.brand}
          </p>

          <h2 className="mt-1 text-2xl font-semibold">
            <Link
              to={iemUrl}
              className="transition hover:text-[var(--accent)]"
            >
              {review.model}
            </Link>
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Reviewed by{" "}
            <Link
              to={`/reviewers/${review.reviewerSlug}`}
              className="font-semibold text-[var(--accent)] hover:underline"
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

            <Link
              to={reviewUrl}
              className="font-medium text-[var(--accent)] transition hover:opacity-75"
            >
              Read review →
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ReviewCard