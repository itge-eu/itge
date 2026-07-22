import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";

type AdminReview = {
  id: number;
  title: string | null;
  slug: string;
  rating: number | null;
  status: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
  reviewers: {
    name: string;
  } | null;
  iems: {
    model: string;
    manufacturers: {
      name: string;
    } | null;
  } | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("reviews")
        .select(`
          id,
          title,
          slug,
          rating,
          status,
          published,
          featured,
          created_at,
          reviewers (
            name
          ),
          iems (
            model,
            manufacturers (
              name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (queryError) {
        console.error("Loading admin reviews failed:", queryError);
        setError(queryError.message);
        setLoading(false);
        return;
      }

      setReviews((data ?? []) as unknown as AdminReview[]);
      setLoading(false);
    }

    void loadReviews();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">

      <div className="mx-auto max-w-6xl">
        <Link to="/" className="text-sm font-medium text-[var(--accent)]">
          ← Back to homepage
        </Link>

        <header className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
              ITGE Admin
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              Reviews
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Manage imported reviews, edit drafts and publish completed
              reviews.
            </p>
          </div>

          <Link
            to="/admin/import"
            className="w-fit rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Import review
          </Link>
        </header>

        {loading && (
          <div className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="text-[var(--muted)]">Loading reviews…</p>
          </div>
        )}

        {error && (
          <div className="mt-12 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            <p className="font-semibold">Reviews could not be loaded.</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-xl font-semibold">No reviews yet</h2>

            <p className="mt-3 text-[var(--muted)]">
              Import your first Head-Fi review to get started.
            </p>
          </div>
        )}

        {!loading && !error && reviews.length > 0 && (
          <section className="mt-12 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-6 py-4">
              <p className="text-sm text-[var(--muted)]">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {reviews.map((review) => {
                const manufacturerName =
                  review.iems?.manufacturers?.name ?? "";

                const modelName = review.iems?.model ?? "Unknown IEM";

                const fullIemName = [manufacturerName, modelName]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <article
                    key={review.id}
                    className="flex flex-col gap-5 px-6 py-6 transition hover:bg-[var(--background)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            review.published
                              ? "bg-green-500/15 text-green-600"
                              : "bg-amber-500/15 text-amber-600"
                          }`}
                        >
                          {review.published ? "Published" : "Draft"}
                        </span>

                        {review.featured && (
                          <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-600">
                            Featured
                          </span>
                        )}

                        {review.rating != null && (
                          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">
                            {Number(review.rating).toFixed(1)} / 5
                          </span>
                        )}
                      </div>

                      <h2 className="mt-3 truncate text-xl font-semibold">
                        {review.title || fullIemName}
                      </h2>

                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {fullIemName}
                        {review.reviewers?.name
                          ? ` · ${review.reviewers.name}`
                          : ""}
                        {review.created_at
                          ? ` · ${formatDate(review.created_at)}`
                          : ""}
                      </p>

                      <p className="mt-2 truncate font-mono text-xs text-[var(--muted)]">
                        /reviews/{review.slug}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3">
                      {review.published && (
                        <Link
                          to={`/reviews/${review.slug}`}
                          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface)]"
                        >
                          View
                        </Link>
                      )}

                      <Link
                        to={`/admin/reviews/${review.id}/edit`}
                        className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Edit
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default AdminReviewsPage;