import { useEffect, useState } from "react"
import { Link } from "react-router"
import ReviewerAvatar from "../components/reviewers/ReviewerAvatar"
import {
  getReviewers,
  type ReviewerSummary,
} from "../lib/reviewers"
import usePageMetadata from "../hooks/usePageMetadata"

function ReviewersPage() {
  const [reviewers, setReviewers] = useState<
    ReviewerSummary[]
  >([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<
    string | null
  >(null)

  const activeReviewers = reviewers.filter(
    (reviewer) => reviewer.active,
  )

  const formerReviewers = reviewers.filter(
    (reviewer) => !reviewer.active,
  )
  
  usePageMetadata({
    title: "Reviewers | ITGE",
    description:
      "Meet the reviewers behind IEM Tour Group Europe and explore their reviews.",
  })

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
          <>
            <section>
              <div className="mb-7">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                  ITGE community
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Active reviewers
                </h2>

                <p className="mt-2 text-[var(--muted)]">
                  Reviewers currently participating in
                  ITGE.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeReviewers.map((reviewer) => (
                  <ReviewerCard
                    key={reviewer.id}
                    reviewer={reviewer}
                  />
                ))}
              </div>
            </section>

            {formerReviewers.length > 0 && (
              <section className="mt-16 border-t border-[var(--border)] pt-14">
                <div className="mb-7">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    ITGE archive
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    Former reviewers
                  </h2>

                  <p className="mt-2 max-w-2xl text-[var(--muted)]">
                    Previous members of the ITGE
                    reviewer community. Their published
                    reviews remain part of our review
                    library.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {formerReviewers.map(
                    (reviewer) => (
                      <ReviewerCard
                        key={reviewer.id}
                        reviewer={reviewer}
                        former
                      />
                    ),
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function ReviewerCard({
  reviewer,
  former = false,
}: {
  reviewer: ReviewerSummary
  former?: boolean
}) {
  return (
    <Link
      to={`/reviewers/${reviewer.slug}`}
      className={`group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:-translate-y-1 hover:border-[var(--accent)] ${
        former ? "opacity-80" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <ReviewerAvatar
            name={reviewer.name}
            slug={reviewer.slug}
            size="lg"
            shape="rounded"
          />

          {former && (
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-black/35" />
          )}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold transition group-hover:text-[var(--accent)]">
            {reviewer.name}
          </h3>

          {reviewer.country && (
            <p className="mt-1 text-sm text-[var(--muted)]">
              {reviewer.country}
            </p>
          )}

          {former && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Former reviewer
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
  )
}

export default ReviewersPage