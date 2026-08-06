import { useEffect, useState } from "react"
import { Link } from "react-router"

import ReviewerAvatar from "../components/reviewers/ReviewerAvatar"

import {
  getReviewers,
  type ReviewerSummary,
} from "../lib/reviewers"

function ReviewersPage() {
  const [reviewers, setReviewers] = useState<
    ReviewerSummary[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false

    async function loadReviewers() {
      setLoading(true)
      setError(null)

      try {
        const result = await getReviewers()

        if (!cancelled) {
          setReviewers(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load reviewers:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The reviewers could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadReviewers()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            ITGE community
          </p>

          <h1 className="mt-4 text-5xl font-semibold">
            Reviewers
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Meet the reviewers behind the ITGE review
            library.
          </p>
        </header>

        {loading ? (
          <p className="text-[var(--muted)]">
            Loading reviewers…
          </p>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            {error}
          </div>
        ) : reviewers.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            No reviewers are available yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviewers.map((reviewer) => (
              <Link
                key={reviewer.id}
                to={`/reviewers/${reviewer.slug}`}
                className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:-translate-y-1 hover:border-[var(--accent)]"
              >
                <div className="flex items-center gap-4">
                  <ReviewerAvatar
                    name={reviewer.name}
                    slug={reviewer.slug}
                    size="lg"
                    shape="rounded"
                  />

                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold group-hover:text-[var(--accent)]">
                      {reviewer.name}
                    </h2>

                    {reviewer.country && (
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {reviewer.country}
                      </p>
                    )}
                  </div>
                </div>

                {reviewer.bio && (
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
                    {reviewer.bio}
                  </p>
                )}

                <p className="mt-5 text-sm font-semibold text-[var(--accent)]">
                  {reviewer.reviewCount}{" "}
                  {reviewer.reviewCount === 1
                    ? "published review"
                    : "published reviews"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default ReviewersPage