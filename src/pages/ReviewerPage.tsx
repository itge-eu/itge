import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { useParams } from "react-router"

import ReviewerAvatar from "../components/reviewers/ReviewerAvatar"
import ReviewGrid from "../components/reviews/ReviewGrid"
import ImpressionCard from "../components/impressions/ImpressionCard"
import Breadcrumbs from "../components/navigation/Breadcrumbs"
import PageState from "../components/layout/PageState"

import {
  countryCodeToName,
  getReviewerBySlug,
  type ReviewerProfile,
} from "../lib/reviewers"

import usePageMetadata from "../hooks/usePageMetadata"

function ReviewerPage() {
  const { slug } = useParams<{ slug: string }>()

  const [reviewer, setReviewer] =
    useState<ReviewerProfile | null>(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<
    string | null
  >(null)

  usePageMetadata({
    title: reviewer
      ? `${reviewer.name} | ITGE`
      : "Reviewer | ITGE",

    description: reviewer
      ? `Explore IEM reviews and listening impressions by ${reviewer.name} at ITGE.`
      : "Meet the reviewers behind ITGE.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadReviewer() {
      if (!slug) {
        setError("No reviewer was specified.")
        setLoading(false)
        return
      }

      try {
        const result =
          await getReviewerBySlug(slug)

        if (!cancelled) {
          setReviewer(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load reviewer:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The reviewer could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadReviewer()

    return () => {
      cancelled = true
    }
  }, [slug])

  const averageRating = useMemo(() => {
    if (
      !reviewer ||
      reviewer.reviews.length === 0
    ) {
      return null
    }

    const total =
      reviewer.reviews.reduce(
        (sum, review) =>
          sum + review.rating,
        0,
      )

    return (
      total / reviewer.reviews.length
    )
  }, [reviewer])

  if (loading) {
    return (
      <PageState
        eyebrow="Reviewer"
        title="Loading reviewer…"
      />
    )
  }

  if (error) {
    return (
      <PageState
        eyebrow="Reviewer"
        title="Unable to load reviewer"
        message={error}
        backTo="/reviewers"
        backLabel="Back to reviewers"
      />
    )
  }

  if (!reviewer) {
    return (
      <PageState
        eyebrow="404"
        title="Reviewer not found"
        message="The reviewer you were looking for doesn’t exist or is no longer available."
        backTo="/reviewers"
        backLabel="Back to reviewers"
      />
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            {
              label: "Reviewers",
              to: "/reviewers",
            },
            {
              label: reviewer.name,
            },
          ]}
        />

        <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <ReviewerAvatar
                name={reviewer.name}
                slug={reviewer.slug}
                size="xl"
                shape="rounded"
                eager
              />

              {!reviewer.active && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-black/35" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                {reviewer.active
                  ? "ITGE reviewer"
                  : "Former ITGE reviewer"}
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
                {reviewer.name}
              </h1>

              {reviewer.country && (
                <p className="mt-3 flex items-center gap-2 text-[var(--muted)]">
                  <span
                    className={`fi fi-${reviewer.country.toLowerCase()} rounded-sm`}
                    aria-hidden="true"
                  />

                  <span>
                    {countryCodeToName(
                      reviewer.country,
                    )}
                  </span>
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

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
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
                Published impressions
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {reviewer.impressions.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
              <p className="text-sm text-[var(--muted)]">
                Average review rating
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {averageRating == null
                  ? "—"
                  : `${averageRating.toFixed(
                      1,
                    )}/5`}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Full reviews
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Reviews by {reviewer.name}
            </h2>

            <p className="mt-2 text-[var(--muted)]">
              Every published full review from this
              reviewer.
            </p>
          </div>

          {reviewer.reviews.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
              This reviewer has no published reviews
              yet.
            </div>
          ) : (
            <div className="mt-8">
              <ReviewGrid
                reviews={reviewer.reviews}
              />
            </div>
          )}
        </section>

        <section className="mt-14 border-t border-[var(--border)] pt-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Listening notes
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Impressions by {reviewer.name}
            </h2>

            <p className="mt-2 max-w-2xl text-[var(--muted)]">
              Short-form listening impressions published
              by this reviewer.
            </p>
          </div>

          {reviewer.impressions.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
              This reviewer has no published impressions
              yet.
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {reviewer.impressions.map(
                (impression) => (
                  <ImpressionCard
                    key={impression.id}
                    impression={impression}
                  />
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default ReviewerPage