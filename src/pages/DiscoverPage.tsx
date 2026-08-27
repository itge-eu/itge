import {
  useEffect,
  useMemo,
  useState,
} from "react"

import DiscoveryFilters from "../components/discover/DiscoveryFilters"
import DiscoveryResults from "../components/discover/DiscoveryResults"
import ReviewSearch from "../components/reviews/ReviewSearch"

import {
  buildDiscoveryState,
  getDiscoveryItems,
} from "../lib/discovery"

import {
  EMPTY_DISCOVERY_FILTERS,
  EMPTY_DISCOVERY_SUGGESTIONS,
  type DiscoveryContentType,
  type DiscoveryItem,
  type SelectedDiscoveryFilters,
} from "../types/discovery"

import type {
  SearchSuggestion,
  SearchSuggestionType,
} from "../types/search"

import usePageMetadata from "../hooks/usePageMetadata"

type SortOption =
  | "newest"
  | "oldest"
  | "iem"
  | "reviewer"

function DiscoverPage() {
  const [
    discoveryItems,
    setDiscoveryItems,
  ] =
    useState<
      DiscoveryItem[]
    >([])

  const [
    selectedFilters,
    setSelectedFilters,
  ] =
    useState<SelectedDiscoveryFilters>(
      {
        ...EMPTY_DISCOVERY_FILTERS,
      },
    )

  const [
    contentType,
    setContentType,
  ] =
    useState<DiscoveryContentType>(
      "all",
    )

  const [
    sortOption,
    setSortOption,
  ] =
    useState<SortOption>(
      "newest",
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(
      null,
    )

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] = useState(false)

  usePageMetadata({
    title:
      "Reviews | ITGE",

    description:
      "Browse ITGE IEM reviews and listening impressions by IEM, brand, reviewer, artist and genre.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadDiscoveryData() {
      setLoading(true)
      setError(null)

      try {
        const result =
          await getDiscoveryItems()

        if (!cancelled) {
          setDiscoveryItems(
            result,
          )
        }
      } catch (loadError) {
        console.error(
          "Could not load review data:",
          loadError,
        )

        if (!cancelled) {
          setDiscoveryItems(
            [],
          )

          setError(
            "The review data could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadDiscoveryData()

    return () => {
      cancelled = true
    }
  }, [])

  const discoveryState =
    useMemo(() => {
      if (
        discoveryItems.length ===
        0
      ) {
        return {
          matchingItems: [],
          suggestions: {
            ...EMPTY_DISCOVERY_SUGGESTIONS,
          },
        }
      }

      return buildDiscoveryState(
        discoveryItems,
        selectedFilters,
        contentType,
      )
    }, [
      discoveryItems,
      selectedFilters,
      contentType,
    ])

  const sortedItems =
    useMemo(() => {
      return [
        ...discoveryState
          .matchingItems,
      ].sort(
        (first, second) =>
          compareDiscoveryItems(
            first,
            second,
            sortOption,
          ),
      )
    }, [
      discoveryState
        .matchingItems,
      sortOption,
    ])

  const searchSuggestions =
    useMemo(
      () => [
        ...discoveryState
          .suggestions.iem,

        ...discoveryState
          .suggestions
          .brand,

        ...discoveryState
          .suggestions.artist,

        ...discoveryState
          .suggestions.genre,

        ...discoveryState
          .suggestions
          .reviewer,
      ],
      [
        discoveryState
          .suggestions,
      ],
    )

  const activeFilterCount =
    Object.values(
      selectedFilters,
    ).filter(Boolean).length

  const hasFilters =
    activeFilterCount > 0

  const handleSelection = (
    suggestion: SearchSuggestion,
  ) => {
    setSelectedFilters(
      (current) => {
        const existing =
          current[
            suggestion.type
          ]

        const selectingSameItem =
          existing?.id ===
          suggestion.id

        return {
          ...current,

          [suggestion.type]:
            selectingSameItem
              ? null
              : suggestion,
        }
      },
    )
  }

  const removeFilter = (
    type: SearchSuggestionType,
  ) => {
    setSelectedFilters(
      (current) => ({
        ...current,
        [type]: null,
      }),
    )
  }

  const clearFilters = () => {
    setSelectedFilters({
      ...EMPTY_DISCOVERY_FILTERS,
    })
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-12 text-[var(--foreground)] lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Reviews & impressions
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Find the reviews that
            matter to you.
          </h1>

          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Browse all ITGE reviews
            and listening impressions,
            or combine IEM, brand,
            artist, genre and reviewer
            filters to find exactly
            what you're looking for.
          </p>
        </header>

        <div className="mb-6">
          <ContentTypeSelector
            value={contentType}
            onChange={
              setContentType
            }
          />
        </div>

        <div className="mb-10 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 sm:p-7">
          <ReviewSearch
            onSelect={
              handleSelection
            }
            suggestionsOverride={
              searchSuggestions
            }
          />
        </div>

        <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
          <button
            type="button"
            onClick={() =>
              setMobileFiltersOpen(
                (current) =>
                  !current,
              )
            }
            aria-expanded={
              mobileFiltersOpen
            }
            aria-controls="mobile-discovery-filters"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 font-semibold transition hover:border-[var(--accent)]"
          >
            <FilterIcon />

            Filters

            {activeFilterCount >
              0 &&
              ` (${activeFilterCount})`}
          </button>

          <span className="text-sm text-[var(--muted)]">
            {loading
              ? "Loading..."
              : `${sortedItems.length} ${
                  sortedItems.length === 1
                    ? "result"
                    : "results"
                }`}
          </span>
        </div>

        {mobileFiltersOpen && (
          <div
            id="mobile-discovery-filters"
            className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:hidden"
          >
            {loading ? (
              <p className="text-sm text-[var(--muted)]">
                Loading
                filters...
              </p>
            ) : error ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : (
              <DiscoveryFilters
                groupedSuggestions={
                  discoveryState
                    .suggestions
                }
                selectedFilters={
                  selectedFilters
                }
                onSelect={
                  handleSelection
                }
                onRemove={
                  removeFilter
                }
                onClear={
                  clearFilters
                }
              />
            )}
          </div>
        )}

        <div className="grid items-start gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="hidden self-start lg:sticky lg:top-6 lg:block">
            <div className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
              {loading ? (
                <p className="text-sm text-[var(--muted)]">
                  Loading
                  filters...
                </p>
              ) : error ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              ) : (
                <DiscoveryFilters
                  groupedSuggestions={
                    discoveryState
                      .suggestions
                  }
                  selectedFilters={
                    selectedFilters
                  }
                  onSelect={
                    handleSelection
                  }
                  onRemove={
                    removeFilter
                  }
                  onClear={
                    clearFilters
                  }
                />
              )}
            </div>
          </aside>

          <DiscoveryResults
            items={sortedItems}
            contentType={
              contentType
            }
            loading={loading}
            error={error}
            hasFilters={
              hasFilters
            }
            sortOption={
              sortOption
            }
            onSortChange={
              setSortOption
            }
          />
        </div>
      </div>
    </main>
  )
}

function ContentTypeSelector({
  value,
  onChange,
}: {
  value: DiscoveryContentType

  onChange: (
    value: DiscoveryContentType,
  ) => void
}) {
  const options: {
    value: DiscoveryContentType
    label: string
  }[] = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "review",
      label: "Reviews",
    },
    {
      value: "impression",
      label: "Impressions",
    },
  ]

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-[var(--muted)]">
        Content type
      </p>

      <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2">
        {options.map(
          (option) => {
            const selected =
              value ===
              option.value

            return (
              <button
                key={
                  option.value
                }
                type="button"
                onClick={() =>
                  onChange(
                    option.value,
                  )
                }
                aria-pressed={
                  selected
                }
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  selected
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                }`}
              >
                {
                  option.label
                }
              </button>
            )
          },
        )}
      </div>
    </div>
  )
}

function compareDiscoveryItems(
  first: DiscoveryItem,
  second: DiscoveryItem,
  sortOption: SortOption,
): number {
  switch (sortOption) {
    case "oldest":
      return (
        getTimestamp(first) -
        getTimestamp(second)
      )

    case "iem":
      return getIemName(
        first,
      ).localeCompare(
        getIemName(second),
        undefined,
        {
          sensitivity: "base",
        },
      )

    case "reviewer":
      return getReviewerName(
        first,
      ).localeCompare(
        getReviewerName(second),
        undefined,
        {
          sensitivity: "base",
        },
      )

    case "newest":
    default:
      return (
        getTimestamp(second) -
        getTimestamp(first)
      )
  }
}

function getTimestamp(
  item: DiscoveryItem,
): number {
  const value =
    item.type === "review"
      ? item.review.publishedAt
      : item.impression.publishedAt

  if (!value) {
    return 0
  }

  const timestamp =
    new Date(value).getTime()

  return Number.isNaN(
    timestamp,
  )
    ? 0
    : timestamp
}

function getIemName(
  item: DiscoveryItem,
): string {
  if (
    item.type === "review"
  ) {
    return `${item.review.brand} ${item.review.model}`
  }

  return `${item.impression.iem.brand.name} ${item.impression.iem.model}`
}

function getReviewerName(
  item: DiscoveryItem,
): string {
  return item.type ===
    "review"
    ? item.review.reviewer
    : item.impression
        .reviewer.name
}

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  )
}

export default DiscoverPage