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
  getDiscoveryReviews,
} from "../lib/discovery"
import {
  EMPTY_DISCOVERY_FILTERS,
  EMPTY_DISCOVERY_SUGGESTIONS,
  type DiscoveryReview,
  type SelectedDiscoveryFilters,
} from "../types/discovery"
import type {
  SearchSuggestion,
  SearchSuggestionType,
} from "../types/search"
import usePageMetadata from "../hooks/usePageMetadata"

function DiscoverPage() {
  const [discoveryReviews, setDiscoveryReviews] =
    useState<DiscoveryReview[]>([])

  const [selectedFilters, setSelectedFilters] =
    useState<SelectedDiscoveryFilters>({
      ...EMPTY_DISCOVERY_FILTERS,
    })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(
    null,
  )

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false)

  usePageMetadata({
    title: "Discover | ITGE",
    description:
      "Discover IEM reviews by product, reviewer, manufacturer, artist and genre.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadDiscoveryData() {
      setLoading(true)
      setError(null)

      try {
        const result = await getDiscoveryReviews()

        if (!cancelled) {
          setDiscoveryReviews(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load Discover data:",
          loadError,
        )

        if (!cancelled) {
          setDiscoveryReviews([])
          setError(
            "The Discover data could not be loaded.",
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

  const discoveryState = useMemo(() => {
    if (discoveryReviews.length === 0) {
      return {
        matchingReviews: [],
        suggestions: {
          ...EMPTY_DISCOVERY_SUGGESTIONS,
        },
      }
    }

    return buildDiscoveryState(
      discoveryReviews,
      selectedFilters,
    )
  }, [discoveryReviews, selectedFilters])

  const searchSuggestions = useMemo(
    () => [
      ...discoveryState.suggestions.iem,
      ...discoveryState.suggestions.manufacturer,
      ...discoveryState.suggestions.artist,
      ...discoveryState.suggestions.genre,
      ...discoveryState.suggestions.reviewer,
    ],
    [discoveryState.suggestions],
  )

  const activeFilterCount = Object.values(
    selectedFilters,
  ).filter(Boolean).length

  const hasFilters = activeFilterCount > 0

  const handleSelection = (
    suggestion: SearchSuggestion,
  ) => {
    setSelectedFilters((current) => {
      const existing = current[suggestion.type]

      const selectingSameItem =
        existing?.id === suggestion.id

      return {
        ...current,
        [suggestion.type]: selectingSameItem
          ? null
          : suggestion,
      }
    })
  }

  const removeFilter = (
    type: SearchSuggestionType,
  ) => {
    setSelectedFilters((current) => ({
      ...current,
      [type]: null,
    }))
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
            Explore ITGE
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Discover reviews through what matters
            to you.
          </h1>

          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Search directly or combine IEM,
            manufacturer, artist, genre and reviewer
            filters. Every available option leads to
            at least one matching review.
          </p>
        </header>

        <div className="mb-10 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 sm:p-7">
          <ReviewSearch
            onSelect={handleSelection}
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
                (current) => !current,
              )
            }
            aria-expanded={mobileFiltersOpen}
            aria-controls="mobile-discovery-filters"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 font-semibold transition hover:border-[var(--accent)]"
          >
            <FilterIcon />

            Filters
            {activeFilterCount > 0 &&
              ` (${activeFilterCount})`}
          </button>

          <span className="text-sm text-[var(--muted)]">
            {loading
              ? "Loading..."
              : `${discoveryState.matchingReviews.length} ${
                  discoveryState.matchingReviews
                    .length === 1
                    ? "review"
                    : "reviews"
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
                Loading filters...
              </p>
            ) : error ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : (
              <DiscoveryFilters
                groupedSuggestions={
                  discoveryState.suggestions
                }
                selectedFilters={
                  selectedFilters
                }
                onSelect={handleSelection}
                onRemove={removeFilter}
                onClear={clearFilters}
              />
            )}
          </div>
        )}

        <div className="grid items-start gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
              {loading ? (
                <p className="text-sm text-[var(--muted)]">
                  Loading filters...
                </p>
              ) : error ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              ) : (
                <DiscoveryFilters
                  groupedSuggestions={
                    discoveryState.suggestions
                  }
                  selectedFilters={
                    selectedFilters
                  }
                  onSelect={handleSelection}
                  onRemove={removeFilter}
                  onClear={clearFilters}
                />
              )}
            </div>
          </aside>

          <DiscoveryResults
            reviews={
              discoveryState.matchingReviews
            }
            loading={loading}
            error={error}
            hasFilters={hasFilters}
          />
        </div>
      </div>
    </main>
  )
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