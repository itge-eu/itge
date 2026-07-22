import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  getAllReviews,
  type FeaturedReview,
} from "../lib/reviews";

function ReviewsPage() {
  const [reviews, setReviews] = useState<FeaturedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await getAllReviews();
        setReviews(data);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">

      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <h1 className="text-5xl font-semibold">
            Reviews
          </h1>

          <p className="mt-3 text-[var(--muted)]">
            Browse every published review on ITGE.
          </p>
        </div>

        {loading ? (
          <p className="text-[var(--muted)]">
            Loading reviews...
          </p>
        ) : (
          <div className="grid gap-8">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
              >
                <div className="flex gap-6">
                  {review.heroImageUrl && (
                    <img
                      src={review.heroImageUrl}
                      alt={`${review.brand} ${review.model}`}
                      className="h-28 w-28 shrink-0 rounded-2xl object-cover"
                    />
                  )}
              
                  <div className="flex-1">
                    <p className="text-sm uppercase tracking-widest text-[var(--accent)]">
                      {review.brand}
                    </p>
              
                    <h2 className="mt-1 text-2xl font-semibold">
                      {review.model}
                    </h2>
              
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Reviewed by {review.reviewer}
                    </p>
              
                    <p className="mt-4 line-clamp-3 text-[var(--muted)]">
                      {review.summary}
                    </p>
              
                    <div className="mt-4 flex items-center justify-between">
                      <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm font-semibold">
                        {review.rating.toFixed(1)}/5
                      </span>
              
                      <Link
                        to={`/reviews/${review.slug}`}
                        className="font-medium text-[var(--accent)]"
                      >
                        Read review →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default ReviewsPage;