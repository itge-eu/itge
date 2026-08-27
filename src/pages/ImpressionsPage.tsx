import {
  useEffect,
  useMemo,
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

  const [searchQuery, setSearchQuery] =
    useState("")

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

  const filteredImpressions =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      if (!query) {
        return impressions
      }

      return impressions.filter(
        (impression) => {
          const searchableText = [
            impression.title ?? "",
            impression.iem.model,
            impression.iem.brand.name,
            impression.reviewer.name,
          ]
            .join(" ")
            .toLowerCase()

          return searchableText.includes(
            query,
          )
        },
      )
    }, [
      impressions,
      searchQuery,
    ])

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

        {!loading &&
          !error &&
          impressions.length > 0 && (
            <div className="mt-10">
              <label
                htmlFor="impression-search"
                className="sr-only"
              >
                Search impressions
              </label>

              <div className="relative max-w-xl">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />
                  <path d="m20 20-3.5-3.5" />
                </svg>

                <input
                  id="impression-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value,
                    )
                  }
                  placeholder="Search by IEM, brand, member or title…"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-3.5 pl-12 pr-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
                />
              </div>

              {searchQuery.trim() && (
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {filteredImpressions.length}{" "}
                  {filteredImpressions.length ===
                  1
                    ? "result"
                    : "results"}
                </p>
              )}
            </div>
          )}

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
        ) : filteredImpressions.length ===
          0 ? (
          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="font-semibold">
              No impressions found
            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Try another IEM, brand,
              member or title.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {filteredImpressions.map(
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