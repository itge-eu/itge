import {
  useEffect,
  useMemo,
  useState,
} from "react"

import DirectoryControls from "../components/directory/DirectoryControls"
import DiscoveryFilters from "../components/discover/DiscoveryFilters"
import DiscoveryResults from "../components/discover/DiscoveryResults"
import ReviewSearch from "../components/reviews/ReviewSearch"
import PageContainer from "../components/layout/PageContainer"

import {
  buildDiscoveryState,
  getDiscoveryItems,
} from "../lib/discovery"

import {
  EMPTY_DISCOVERY_FILTERS,
  EMPTY_DISCOVERY_SUGGESTIONS,
  type DiscoveryContentType,
  type DiscoveryFilterSuggestion,
  type DiscoveryFilterType,
  type DiscoveryItem,
  type SelectedDiscoveryFilters,
} from "../types/discovery"

import type {
  SearchSuggestion,
} from "../types/search"

import usePageMetadata from "../hooks/usePageMetadata"

type SortOption =
  | "newest"
  | "oldest"
  | "product"
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

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null)

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] =
    useState(false)

  usePageMetadata({
    title:
      "Reviews | ITGE",

    description:
      "Browse ITGE reviews and listening impressions by gear, brand, member, artist and genre.",
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
          setLoading(
            false,
          )
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
          matchingItems:
            [],
          suggestions:
            {
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
        (
          first,
          second,
        ) =>
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
    useMemo<
      SearchSuggestion[]
    >(
      () => [
        ...discoveryState
          .suggestions.product
          .map(
            (
              suggestion,
            ) => ({
              ...suggestion,
              type:
                "product" as const,
            }),
          ),

        ...discoveryState
          .suggestions.brand
          .map(
            (
              suggestion,
            ) => ({
              ...suggestion,
              type:
                "brand" as const,
            }),
          ),

        ...discoveryState
          .suggestions.artist
          .map(
            (
              suggestion,
            ) => ({
              ...suggestion,
              type:
                "artist" as const,
            }),
          ),

        ...discoveryState
          .suggestions.genre
          .map(
            (
              suggestion,
            ) => ({
              ...suggestion,
              type:
                "genre" as const,
            }),
          ),

        ...discoveryState
          .suggestions.reviewer
          .map(
            (
              suggestion,
            ) => ({
              ...suggestion,
              type:
                "reviewer" as const,
            }),
          ),
      ],
      [
        discoveryState
          .suggestions,
      ],
    )

  const activeFilters =
    useMemo(
      () =>
        flattenSelectedFilters(
          selectedFilters,
        ),
      [
        selectedFilters,
      ],
    )

  const hasFilters =
    activeFilters.length >
    0

  const contentCounts =
    useMemo(
      () => {
        const reviewCount =
          discoveryItems.filter(
            (item) =>
              item.type ===
              "review",
          ).length

        const impressionCount =
          discoveryItems.length -
          reviewCount

        return {
          all:
            discoveryItems.length,
          review:
            reviewCount,
          impression:
            impressionCount,
        }
      },
      [
        discoveryItems,
      ],
    )

  const handleSelection =
    (
      suggestion:
        DiscoveryFilterSuggestion,
    ) => {
      setSelectedFilters(
        (current) => {
          switch (
            suggestion.type
          ) {
            case "product":
              return {
                ...current,
                product:
                  toggleSuggestion(
                    current.product,
                    suggestion,
                  ),
              }

            case "gear_type":
              return {
                ...current,
                gear_type:
                  toggleSuggestion(
                    current.gear_type,
                    suggestion,
                  ),
              }

            case "brand":
              return {
                ...current,
                brand:
                  toggleSuggestion(
                    current.brand,
                    suggestion,
                  ),
              }

            case "reviewer":
              return {
                ...current,
                reviewer:
                  toggleSuggestion(
                    current.reviewer,
                    suggestion,
                  ),
              }

            case "artist":
              return {
                ...current,
                artist:
                  toggleSuggestion(
                    current.artist,
                    suggestion,
                  ),
              }

            case "genre":
              return {
                ...current,
                genre:
                  toggleSuggestion(
                    current.genre,
                    suggestion,
                  ),
              }
          }
        },
      )
    }

  const handleSearchSelection =
    (
      suggestion:
        SearchSuggestion,
    ) => {
      handleSelection({
        ...suggestion,
        type:
          suggestion.type,
      })
    }

  const removeFilter =
    (
      type:
        DiscoveryFilterType,
      id: number,
    ) => {
      setSelectedFilters(
        (current) => {
          switch (type) {
            case "product":
              return {
                ...current,
                product:
                  current.product.filter(
                    (
                      item,
                    ) =>
                      item.id !==
                      id,
                  ),
              }

            case "gear_type":
              return {
                ...current,
                gear_type:
                  current.gear_type.filter(
                    (
                      item,
                    ) =>
                      item.id !==
                      id,
                  ),
              }

            case "brand":
              return {
                ...current,
                brand:
                  current.brand.filter(
                    (
                      item,
                    ) =>
                      item.id !==
                      id,
                  ),
              }

            case "reviewer":
              return {
                ...current,
                reviewer:
                  current.reviewer.filter(
                    (
                      item,
                    ) =>
                      item.id !==
                      id,
                  ),
              }

            case "artist":
              return {
                ...current,
                artist:
                  current.artist.filter(
                    (
                      item,
                    ) =>
                      item.id !==
                      id,
                  ),
              }

            case "genre":
              return {
                ...current,
                genre:
                  current.genre.filter(
                    (
                      item,
                    ) =>
                      item.id !==
                      id,
                  ),
              }
          }
        },
      )
    }

  const clearFilters =
    () => {
      setSelectedFilters({
        gear_type: [],
        product: [],
        brand: [],
        reviewer: [],
        artist: [],
        genre: [],
      })
    }

  return (
    <main className="min-h-screen bg-[var(--background)] py-16 text-[var(--foreground)]">
      <PageContainer>
        <header className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Reviews &
            impressions
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="block">
              Find the
              reviews
            </span>

            <span className="block">
              that matter to
              you.
            </span>
          </h1>
        </header>

        <div className="mb-10">
          <DirectoryControls>
            <ContentTypeSelector
              value={
                contentType
              }
              counts={
                contentCounts
              }
              onChange={
                setContentType
              }
            />

            <div className="mt-5 border-t border-[var(--border)] pt-5">
              <ReviewSearch
                onSelect={
                  handleSearchSelection
                }
                suggestionsOverride={
                  searchSuggestions
                }
              />
            </div>
          </DirectoryControls>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
          <button
            type="button"
            onClick={() =>
              setMobileFiltersOpen(
                (
                  current,
                ) =>
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

            {activeFilters.length >
              0 &&
              ` (${activeFilters.length})`}
          </button>

          {activeFilters.length >
            0 && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="text-sm font-semibold text-[var(--accent)] transition hover:opacity-75"
            >
              Clear
            </button>
          )}
        </div>

        {mobileFiltersOpen && (
          <div
            id="mobile-discovery-filters"
            className="mb-8 lg:hidden"
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
                onClear={
                  clearFilters
                }
              />
            )}
          </div>
        )}

        <div className="grid items-start gap-8 lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="hidden self-start lg:sticky lg:top-26 lg:block">
            <div className="max-h-[calc(100vh-7rem)] overflow-y-auto">
              {loading ? (
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
                  Loading
                  filters...
                </div>
              ) : error ? (
                <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
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
                  onClear={
                    clearFilters
                  }
                />
              )}
            </div>
          </aside>

          <DiscoveryResults
            items={
              sortedItems
            }
            contentType={
              contentType
            }
            loading={
              loading
            }
            error={
              error
            }
            hasFilters={
              hasFilters
            }
            sortOption={
              sortOption
            }
            onSortChange={
              setSortOption
            }
            activeFilters={
              activeFilters
            }
            onRemoveFilter={
              removeFilter
            }
          />
        </div>
      </PageContainer>
    </main>
  )
}

function ContentTypeSelector({
  value,
  counts,
  onChange,
}: {
  value:
    DiscoveryContentType

  counts: Record<
    DiscoveryContentType,
    number
  >

  onChange: (
    value:
      DiscoveryContentType,
  ) => void
}) {
  const options: {
    value:
      DiscoveryContentType
    label: string
  }[] = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "review",
      label:
        "Reviews",
    },
    {
      value:
        "impression",
      label:
        "Impressions",
    },
  ]

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        Content type
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
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
                className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                }`}
              >
                {
                  option.label
                }{" "}
                <span
                  className={
                    selected
                      ? "opacity-75"
                      : "text-[var(--muted)]"
                  }
                >
                  {
                    counts[
                      option
                        .value
                    ]
                  }
                </span>
              </button>
            )
          },
        )}
      </div>
    </div>
  )
}

function toggleSuggestion(
  current:
    DiscoveryFilterSuggestion[],
  suggestion:
    DiscoveryFilterSuggestion,
): DiscoveryFilterSuggestion[] {
  const exists =
    current.some(
      (item) =>
        item.id ===
          suggestion.id &&
        item.type ===
          suggestion.type,
    )

  if (exists) {
    return current.filter(
      (item) =>
        !(
          item.id ===
            suggestion.id &&
          item.type ===
            suggestion.type
        ),
    )
  }

  return [
    ...current,
    suggestion,
  ]
}

function flattenSelectedFilters(
  selectedFilters:
    SelectedDiscoveryFilters,
): DiscoveryFilterSuggestion[] {
  return [
    ...selectedFilters.gear_type,
    ...selectedFilters.product,
    ...selectedFilters.brand,
    ...selectedFilters.reviewer,
    ...selectedFilters.artist,
    ...selectedFilters.genre,
  ]
}

function compareDiscoveryItems(
  first:
    DiscoveryItem,
  second:
    DiscoveryItem,
  sortOption:
    SortOption,
): number {
  switch (sortOption) {
    case "oldest":
      return (
        getTimestamp(
          first,
        ) -
        getTimestamp(
          second,
        )
      )

    case "product":
      return getProductName(
        first,
      ).localeCompare(
        getProductName(
          second,
        ),
        undefined,
        {
          sensitivity:
            "base",
        },
      )

    case "reviewer":
      return getReviewerName(
        first,
      ).localeCompare(
        getReviewerName(
          second,
        ),
        undefined,
        {
          sensitivity:
            "base",
        },
      )

    case "newest":
    default:
      return (
        getTimestamp(
          second,
        ) -
        getTimestamp(
          first,
        )
      )
  }
}

function getTimestamp(
  item:
    DiscoveryItem,
): number {
  const value =
    item.type ===
    "review"
      ? item.review
          .publishedAt
      : item.impression
          .publishedAt

  if (!value) {
    return 0
  }

  const timestamp =
    new Date(
      value,
    ).getTime()

  return Number.isNaN(
    timestamp,
  )
    ? 0
    : timestamp
}

function getProductName(
  item:
    DiscoveryItem,
): string {
  if (
    item.type ===
    "review"
  ) {
    return `${item.review.brand} ${item.review.model}`
  }

  return `${item.impression.product.brand.name} ${item.impression.product.model}`
}

function getReviewerName(
  item:
    DiscoveryItem,
): string {
  return item.type ===
    "review"
    ? item.review
        .reviewer
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