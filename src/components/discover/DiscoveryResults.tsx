import {
  useEffect,
  useState,
} from "react"

import ReviewCard from "../reviews/ReviewCard"
import ImpressionCard from "../impressions/ImpressionCard"

import type {
  DiscoveryContentType,
  DiscoveryItem,
} from "../../types/discovery"

type SortOption =
  | "newest"
  | "oldest"
  | "iem"
  | "reviewer"

type DiscoveryResultsProps = {
  items: DiscoveryItem[]

  contentType:
    DiscoveryContentType

  loading: boolean
  error: string | null
  hasFilters: boolean

  sortOption: SortOption

  onSortChange: (
    value: SortOption,
  ) => void
}

const ITEMS_PER_PAGE = 12

function DiscoveryResults({
  items,
  contentType,
  loading,
  error,
  hasFilters,
  sortOption,
  onSortChange,
}: DiscoveryResultsProps) {
  const [
    visibleCount,
    setVisibleCount,
  ] = useState(
    ITEMS_PER_PAGE,
  )

  useEffect(() => {
    setVisibleCount(
      ITEMS_PER_PAGE,
    )
  }, [items])

  const visibleItems =
    items.slice(
      0,
      visibleCount,
    )

  const hasMoreItems =
    visibleCount <
    items.length

  return (
    <section aria-live="polite">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Results
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {loading
              ? "Finding coverage..."
              : buildResultTitle(
                  items.length,
                  contentType,
                )}
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)]">
            {hasFilters
              ? "Results update whenever you change a filter."
              : buildDefaultDescription(
                  contentType,
                )}
          </p>
        </div>

        {!loading &&
          !error &&
          items.length > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              {items.length >
                ITEMS_PER_PAGE && (
                <span className="text-sm text-[var(--muted)]">
                  Showing{" "}
                  {
                    visibleItems.length
                  }{" "}
                  of {items.length}
                </span>
              )}

              <div className="flex items-center gap-3">
                <label
                  htmlFor="discovery-sort"
                  className="text-sm text-[var(--muted)]"
                >
                  Sort by
                </label>

                <select
                  id="discovery-sort"
                  value={sortOption}
                  onChange={(
                    event,
                  ) =>
                    onSortChange(
                      event.target
                        .value as SortOption,
                    )
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                >
                  <option value="newest">
                    Newest first
                  </option>

                  <option value="oldest">
                    Oldest first
                  </option>

                  <option value="iem">
                    IEM A–Z
                  </option>

                  <option value="reviewer">
                    Member A–Z
                  </option>
                </select>
              </div>
            </div>
          )}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
          Loading matching
          coverage...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
          <p className="font-semibold">
            Unable to load
            coverage
          </p>

          <p className="mt-2 text-sm text-[var(--muted)]">
            {error}
          </p>
        </div>
      ) : items.length ===
        0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="font-semibold">
            No coverage matches
            this combination
          </p>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Remove one of the
            selected filters or
            choose another content
            type to broaden the
            results.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-8">
            {visibleItems.map(
              (item) => {
                if (
                  item.type ===
                  "review"
                ) {
                  return (
                    <div
                      key={`review-${item.review.id}`}
                    >
                      {contentType ===
                        "all" && (
                        <ContentLabel>
                          Review
                        </ContentLabel>
                      )}

                      <ReviewCard
                        review={
                          item.review
                        }
                      />
                    </div>
                  )
                }

                return (
                  <div
                    key={`impression-${item.impression.id}`}
                  >
                    {contentType ===
                      "all" && (
                      <ContentLabel>
                        Impression
                      </ContentLabel>
                    )}

                    <ImpressionCard
                      impression={
                        item.impression
                      }
                    />
                  </div>
                )
              },
            )}
          </div>

          {hasMoreItems && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount(
                    (current) =>
                      Math.min(
                        current +
                          ITEMS_PER_PAGE,
                        items.length,
                      ),
                  )
                }
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 font-semibold transition hover:border-[var(--accent)] hover:bg-[var(--surface-soft)]"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function ContentLabel({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
      {children}
    </p>
  )
}

function buildResultTitle(
  count: number,
  contentType:
    DiscoveryContentType,
) {
  if (
    contentType === "review"
  ) {
    return `${count} matching ${
      count === 1
        ? "review"
        : "reviews"
    }`
  }

  if (
    contentType ===
    "impression"
  ) {
    return `${count} matching ${
      count === 1
        ? "impression"
        : "impressions"
    }`
  }

  return `${count} matching ${
    count === 1
      ? "result"
      : "results"
  }`
}

function buildDefaultDescription(
  contentType:
    DiscoveryContentType,
) {
  if (
    contentType === "review"
  ) {
    return "Showing every published ITGE review."
  }

  if (
    contentType ===
    "impression"
  ) {
    return "Showing every published ITGE listening impression."
  }

  return "Showing all published ITGE reviews and listening impressions."
}

export default DiscoveryResults