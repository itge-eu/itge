import {
  useEffect,
  useState,
} from "react"

import ImpressionCard from "../components/impressions/ImpressionCard"
import usePageMetadata from "../hooks/usePageMetadata"

import {
  getAllImpressions,
  type ImpressionSummary,
} from "../lib/impressions"

function ImpressionsPage() {
  const [impressions, setImpressions] =
    useState<ImpressionSummary[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  usePageMetadata({
    title: "Impressions | ITGE",
    description:
      "Browse short-form IEM listening impressions from ITGE reviewers.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadImpressions() {
      setLoading(true)
      setError(null)

      try {
        const result =
          await getAllImpressions()

        if (!cancelled) {
          setImpressions(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load impressions:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The impressions could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadImpressions()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Listening notes
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
            Impressions
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Short-form listening impressions from ITGE
            reviewers. Less formal than a full review,
            but still grounded in real listening.
          </p>

          {!loading && !error && (
            <p className="mt-4 text-sm text-[var(--muted)]">
              {impressions.length}{" "}
              {impressions.length === 1
                ? "impression"
                : "impressions"}
            </p>
          )}
        </header>

        {loading ? (
          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            Loading impressions…
          </div>
        ) : error ? (
          <div className="mt-10 rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
            <p className="font-semibold">
              Unable to load impressions
            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">
              {error}
            </p>
          </div>
        ) : impressions.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            No published impressions are available yet.
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {impressions.map(
              (impression) => (
                <ImpressionCard
                  key={impression.id}
                  impression={impression}
                />
              ),
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default ImpressionsPage