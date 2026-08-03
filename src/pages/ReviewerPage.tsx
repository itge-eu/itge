import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  getReviewerBySlug,
  type ReviewerProfile,
} from "../lib/reviewers";

function ReviewerPage() {
  const { slug } = useParams<{ slug: string }>();

  const [reviewer, setReviewer] =
    useState<ReviewerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReviewer() {
      if (!slug) {
        setError("No reviewer was specified.");
        setLoading(false);
        return;
      }

      try {
        const result = await getReviewerBySlug(slug);
        setReviewer(result);
      } catch (loadError) {
        console.error(
          "Could not load reviewer:",
          loadError,
        );
        setError("The reviewer could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    void loadReviewer();
  }, [slug]);

  const averageRating = useMemo(() => {
    if (!reviewer || reviewer.reviews.length === 0) {
      return null;
    }

    const total = reviewer.reviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );

    return total / reviewer.reviews.length;
  }, [reviewer]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)]">
        <div className="mx-auto max-w-6xl text-[var(--muted)]">
          Loading reviewer…
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)]">
        <div className="mx-auto max-w-6xl">
          <p className="text-xl font-semibold">
            Unable to load reviewer
          </p>

          <p className="mt-3 text-[var(--muted)]">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!reviewer) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)]">
        <div className="mx-auto max-w-6xl">
          <p className="text-xl font-semibold">
            Reviewer not found
          </p>

          <Link
            to="/reviews"
            className="mt-8 inline-block text-[var(--accent)]"
          >
            ← Back to reviews
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            {reviewer.avatarUrl ? (
              <img
                src={reviewer.avatarUrl}
                alt={reviewer.name}
                className="h-28 w-28 rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-[var(--surface-soft)] text-4xl font-semibold text-[var(--accent)]">
                {reviewer.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                ITGE reviewer
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
                {reviewer.name}
              </h1>

              {reviewer.country && (
                <p className="mt-3 text-[var(--muted)]">
                  {reviewer.country}
                </p>
              )}

              {reviewer.bio && (
                <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
                  {reviewer.bio}
                </p>
              )}

              {reviewer.headfiUrl && (
                <a
                  href={reviewer.headfiUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-block font-semibold text-[var(--accent)] underline"
                >
                  View Head-Fi profile
                </a>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
              <p className="text-sm text-[var(--muted)]">
                Published reviews
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {reviewer.reviews.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
              <p className="text-sm text-[var(--muted)]">
                Average rating
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {averageRating == null
                  ? "—"
                  : `${averageRating.toFixed(1)}/5`}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold">
                Reviews by {reviewer.name}
              </h2>

              <p className="mt-2 text-[var(--muted)]">
                Every published review from this reviewer.
              </p>
            </div>
          </div>

          {reviewer.reviews.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
              This reviewer has no published reviews yet.
            </div>
          ) : (
            <div className="mt-8 grid gap-8">
              {reviewer.reviews.map((review) => (
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

                      <h3 className="mt-1 text-2xl font-semibold">
                        {review.model}
                      </h3>

                      <p className="mt-4 line-clamp-3 text-[var(--muted)]">
                        {review.summary}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-4">
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
        </section>
      </div>
    </main>
  );
}

export default ReviewerPage;