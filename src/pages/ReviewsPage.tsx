import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  getAllReviews,
  type FeaturedReview,
} from "../lib/reviews";

function ReviewsPage() {
  const location = useLocation();

  const [reviews, setReviews] = useState<FeaturedReview[]>([]);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [genreName, setGenreName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const artistSlug = searchParams.get("artist");
  const genreSlug = searchParams.get("genre");

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      setLoading(true);
      setError(null);

      try {
        const result = await getAllReviews({
          artistSlug: artistSlug ?? undefined,
          genreSlug: genreSlug ?? undefined,
        });

        if (!cancelled) {
          setReviews(result.reviews);
          setArtistName(result.artistName);
          setGenreName(result.genreName);
        }
      } catch (loadError) {
        console.error("Could not load reviews:", loadError);

        if (!cancelled) {
          setError("The reviews could not be loaded.");
          setReviews([]);
          setArtistName(null);
          setGenreName(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadReviews();

    return () => {
      cancelled = true;
    };
  }, [artistSlug, genreSlug]);

  const hasArtistFilter = Boolean(artistSlug);
  const hasGenreFilter = Boolean(genreSlug);
  const hasFilters = hasArtistFilter || hasGenreFilter;

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          {hasFilters && (
            <Link
              to="/reviews"
              className="mb-6 inline-block text-sm font-medium text-[var(--accent)]"
            >
              ← Back to all reviews
            </Link>
          )}

          <h1 className="text-5xl font-semibold">
            {artistName && genreName
              ? `Reviews mentioning ${artistName} in ${genreName}`
              : artistName
                ? `Reviews mentioning ${artistName}`
                : genreName
                  ? `${genreName} reviews`
                  : hasFilters
                    ? "Filtered reviews"
                    : "Reviews"}
          </h1>

          <p className="mt-3 text-[var(--muted)]">
            {artistName && genreName
              ? `Published ITGE reviews tagged with ${genreName} that mention ${artistName}.`
              : artistName
                ? `Published ITGE reviews that mention ${artistName}.`
                : genreName
                  ? `Published ITGE reviews covering ${genreName}.`
                  : hasFilters
                    ? "No matching filter was found."
                    : "Browse every published review on ITGE."}
          </p>
        </div>

        {loading ? (
          <p className="text-[var(--muted)]">
            Loading reviews...
          </p>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            {hasFilters
              ? "No published reviews match these filters yet."
              : "No published reviews are available yet."}
          </div>
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