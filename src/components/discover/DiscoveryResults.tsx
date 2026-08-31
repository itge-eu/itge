import {
  useEffect,
  useState,
} from "react"

import DirectoryResultsBar from "../directory/DirectoryResultsBar"
import ReviewCard from "../reviews/ReviewCard"
import ImpressionCard from "../impressions/ImpressionCard"

import type {
  DiscoveryContentType,
  DiscoveryFilterSuggestion,
  DiscoveryFilterType,
  DiscoveryItem,
} from "../../types/discovery"

type SortOption =
  | "newest"
  | "oldest"
  | "product"
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

  activeFilters:
    DiscoveryFilterSuggestion[]

  onRemoveFilter: (
    type:
      DiscoveryFilterType,
    id: number,
  ) => void
}

const ITEMS_PER_PAGE = 12

const SORT_OPTIONS: {
  value: SortOption
  label: string
}[] = [
  {
    value: "newest",
    label: "Newest first",
  },
  {
    value: "oldest",
    label: "Oldest first",
  },
  {
    value: "product",
    label: "Gear A–Z",
  },
  {
    value: "reviewer",
    label: "Member A–Z",
  },
]

function DiscoveryResults({
  items,
  contentType,
  loading,
  error,
  hasFilters,
  sortOption,
  onSortChange,
  activeFilters,
  onRemoveFilter,
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

  const caption =
    !loading &&
    items.length > 0
      ? `· showing 1–${visibleItems.length}`
      : undefined

  return (
    <section
      aria-live="polite"
      className="min-w-0"
    >
      <DirectoryResultsBar
        count={
          items.length
        }
        singular="result"
        plural="results"
        loading={
          loading
        }
        sortValue={
          sortOption
        }
        sortOptions={
          SORT_OPTIONS
        }
        onSortChange={
          onSortChange
        }
        sortId="discovery-sort"
        caption={
          caption
        }
        className="mt-0"
      >
        {activeFilters.length >
          0 && (
          <ActiveFilterChips
            filters={
              activeFilters
            }
            onRemove={
              onRemoveFilter
            }
          />
        )}
      </DirectoryResultsBar>

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
            {hasFilters
              ? "Remove one of the selected filters or choose another content type to broaden the results."
              : "There is no published coverage for this content type yet."}
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

function ActiveFilterChips({
  filters,
  onRemove,
}: {
  filters:
    DiscoveryFilterSuggestion[]

  onRemove: (
    type:
      DiscoveryFilterType,
    id: number,
  ) => void
}) {
  const [
    expanded,
    setExpanded,
  ] = useState(false)

  const visibleFilters =
    expanded
      ? filters
      : filters.slice(
          0,
          4,
        )

  const hiddenCount =
    filters.length -
    visibleFilters.length

  return (
    <div className="flex flex-wrap gap-2">
      {visibleFilters.map(
        (filter) => (
          <button
            key={`${filter.type}-${filter.id}`}
            type="button"
            onClick={() =>
              onRemove(
                filter.type,
                filter.id,
              )
            }
            aria-label={`Remove ${filter.name} filter`}
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--accent)]/45 bg-[var(--accent)]/10 px-3 py-2 text-xs font-semibold transition hover:border-[var(--accent)]"
          >
            <span className="truncate">
              {filter.name}
            </span>

            <CloseIcon />
          </button>
        ),
      )}

      {!expanded &&
        hiddenCount > 0 && (
        <button
          type="button"
          onClick={() =>
            setExpanded(
              true,
            )
          }
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
        >
          + {hiddenCount} more
        </button>
      )}

      {expanded &&
        filters.length > 4 && (
        <button
          type="button"
          onClick={() =>
            setExpanded(
              false,
            )
          }
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
        >
          Show less
        </button>
      )}
    </div>
  )
}

function ContentLabel({
  children,
}: {
  children:
    React.ReactNode
}) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
      {children}
    </p>
  )
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  )
}

export default DiscoveryResults
