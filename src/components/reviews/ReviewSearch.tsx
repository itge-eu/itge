import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { getSearchSuggestions } from "../../lib/search"

import type {
  SearchSuggestion,
  SearchSuggestionType,
} from "../../types/search"

type ReviewSearchProps = {
  onSelect: (suggestion: SearchSuggestion) => void
  suggestionsOverride?: SearchSuggestion[]
}

const TYPE_LABELS: Record<SearchSuggestionType, string> = {
  product: "IEM",
  brand: "Brand",
  reviewer: "Member",
  artist: "Artist",
  genre: "Genre",
}

const TYPE_ORDER: SearchSuggestionType[] = [
  "brand",
  "product",
  "reviewer",
  "artist",
  "genre",
]

function normalizeSearchValue(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function getMatchPriority(
  suggestion: SearchSuggestion,
  normalizedQuery: string,
): number {
  const normalizedName = normalizeSearchValue(
    suggestion.name,
  )

  const normalizedSubtitle = normalizeSearchValue(
    suggestion.subtitle ?? "",
  )

  if (normalizedName === normalizedQuery) {
    return 0
  }

  if (normalizedName.startsWith(normalizedQuery)) {
    return 1
  }

  if (normalizedName.includes(normalizedQuery)) {
    return 2
  }

  if (
    normalizedSubtitle === normalizedQuery ||
    normalizedSubtitle.startsWith(normalizedQuery)
  ) {
    return 3
  }

  return 4
}

function ReviewSearch({
  onSelect,
  suggestionsOverride,
}: ReviewSearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<
    SearchSuggestion[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (suggestionsOverride) {
      setSuggestions(suggestionsOverride)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    async function loadSuggestions() {
      setLoading(true)
      setError(null)

      try {
        const result = await getSearchSuggestions()

        if (!cancelled) {
          setSuggestions(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load search suggestions:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "Search suggestions could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadSuggestions()

    return () => {
      cancelled = true
    }
  }, [suggestionsOverride])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      )
    }
  }, [])

  const filteredSuggestions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query)

    if (!normalizedQuery) {
      return []
    }

    return suggestions
      .filter((suggestion) => {
        const searchableText = normalizeSearchValue(
          [
            suggestion.name,
            suggestion.subtitle,
            TYPE_LABELS[suggestion.type],
          ]
            .filter(Boolean)
            .join(" "),
        )

        return searchableText.includes(normalizedQuery)
      })
      .sort((first, second) => {
        const priorityDifference =
          getMatchPriority(first, normalizedQuery) -
          getMatchPriority(second, normalizedQuery)

        if (priorityDifference !== 0) {
          return priorityDifference
        }

        const typeDifference =
          TYPE_ORDER.indexOf(first.type) -
          TYPE_ORDER.indexOf(second.type)

        if (typeDifference !== 0) {
          return typeDifference
        }

        const countDifference =
          second.reviewCount - first.reviewCount

        if (countDifference !== 0) {
          return countDifference
        }

        return first.name.localeCompare(second.name)
      })
      .slice(0, 25)
  }, [query, suggestions])

  const groupedSuggestions = useMemo(() => {
    const groups: Record<
      SearchSuggestionType,
      SearchSuggestion[]
    > = {
      brand: [],
      product: [],
      reviewer: [],
      artist: [],
      genre: [],
    }

    filteredSuggestions.forEach((suggestion) => {
      groups[suggestion.type].push(suggestion)
    })

    return groups
  }, [filteredSuggestions])

  useEffect(() => {
    if (activeIndex < 0) {
      return
    }

    const activeOption = listRef.current?.querySelector(
      `#review-search-option-${activeIndex}`,
    )

    activeOption?.scrollIntoView({
      block: "nearest",
    })
  }, [activeIndex])

  const hasQuery = query.trim().length > 0
  const showMenu = menuOpen && hasQuery

  const selectSuggestion = (
    suggestion: SearchSuggestion,
  ) => {
    onSelect(suggestion)
    setQuery("")
    setMenuOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Escape") {
      setMenuOpen(false)
      setActiveIndex(-1)
      return
    }

    if (!showMenu || filteredSuggestions.length === 0) {
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()

      setActiveIndex((current) =>
        current >= filteredSuggestions.length - 1
          ? 0
          : current + 1,
      )

      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()

      setActiveIndex((current) =>
        current <= 0
          ? filteredSuggestions.length - 1
          : current - 1,
      )

      return
    }

    if (event.key === "Home") {
      event.preventDefault()
      setActiveIndex(0)
      return
    }

    if (event.key === "End") {
      event.preventDefault()
      setActiveIndex(filteredSuggestions.length - 1)
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()

      const selectedSuggestion =
        activeIndex >= 0
          ? filteredSuggestions[activeIndex]
          : filteredSuggestions[0]

      if (selectedSuggestion) {
        selectSuggestion(selectedSuggestion)
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative mb-10"
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <label
          htmlFor="review-search"
          className="block text-sm font-semibold"
        >
          Search what ITGE currently contains
        </label>

        {!loading && !error && suggestions.length > 0 && (
          <span className="text-xs text-[var(--muted)]">
            {suggestions.length} searchable entries
          </span>
        )}
      </div>

      <div className="relative">
        <SearchIcon />

        <input
          id="review-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setMenuOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => {
            if (query.trim()) {
              setMenuOpen(true)
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search IEMs, brands, artists, genres or reviewers..."
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={showMenu}
          aria-controls="review-search-results"
          aria-activedescendant={
            activeIndex >= 0
              ? `review-search-option-${activeIndex}`
              : undefined
          }
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-4 pl-12 pr-12 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setMenuOpen(false)
              setActiveIndex(-1)
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {showMenu && (
        <div
          ref={listRef}
          id="review-search-results"
          role="listbox"
          className="absolute z-30 mt-2 max-h-[32rem] w-full overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl shadow-black/10 dark:shadow-black/30"
        >
          {loading ? (
            <div className="flex items-center gap-3 px-4 py-5 text-sm text-[var(--muted)]">
              <LoadingSpinner />
              Loading available ITGE content...
            </div>
          ) : error ? (
            <div className="px-4 py-5">
              <p className="font-medium text-red-600 dark:text-red-400">
                Search is temporarily unavailable
              </p>

              <p className="mt-1 text-sm text-[var(--muted)]">
                {error}
              </p>
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="px-4 py-5">
              <p className="font-medium">
                No matches in ITGE yet
              </p>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Try another IEM, brand, reviewer,
                artist, or genre.
              </p>
            </div>
          ) : (
            TYPE_ORDER.map((type) => {
              const items = groupedSuggestions[type]

              if (items.length === 0) {
                return null
              }

              return (
                <section
                  key={type}
                  className="border-b border-[var(--border)] py-2 last:border-b-0"
                >
                  <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-1">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      <SearchTypeIcon type={type} />

                      <span>
                        {getPluralTypeLabel(type)}
                      </span>
                    </div>

                    <span className="text-xs text-[var(--muted)]">
                      {items.length}
                    </span>
                  </div>

                  <div>
                    {items.map((suggestion) => {
                      const index =
                        filteredSuggestions.indexOf(
                          suggestion,
                        )

                      const active =
                        index === activeIndex

                      return (
                        <button
                          key={`${suggestion.type}-${suggestion.id}`}
                          id={`review-search-option-${index}`}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() =>
                            setActiveIndex(index)
                          }
                          onClick={() =>
                            selectSuggestion(suggestion)
                          }
                          className={`group flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition ${
                            active
                              ? "bg-[var(--surface-soft)]"
                              : "hover:bg-[var(--surface-soft)]"
                          }`}
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)] transition group-hover:border-[var(--accent)]">
                            <SearchTypeIcon
                              type={suggestion.type}
                              large
                            />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              {highlightMatch(
                                suggestion.name,
                                query,
                              )}
                            </span>

                            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--muted)]">
                              {suggestion.subtitle && (
                                <span className="truncate">
                                  {highlightMatch(
                                    suggestion.subtitle,
                                    query,
                                  )}
                                </span>
                              )}

                              {suggestion.subtitle && (
                                <span aria-hidden="true">
                                  ·
                                </span>
                              )}

                              <span>
                                {getCoverageCountLabel(
                                  suggestion,
                                )}
                              </span>
                            </span>
                          </span>

                          <ChevronIcon />
                        </button>
                      )
                    })}
                  </div>
                </section>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function getPluralTypeLabel(
  type: SearchSuggestionType,
): string {
  switch (type) {
    case "product":
      return "IEMs"
    case "brand":
      return "Brands"
    case "reviewer":
      return "Members"
    case "artist":
      return "Artists"
    case "genre":
      return "Genres"
  }
}

function getCoverageCountLabel(
  suggestion: SearchSuggestion,
): string {
  const reviewResultCount =
    suggestion.reviewResultCount

  const impressionResultCount =
    suggestion.impressionResultCount

  const hasDiscoveryCounts =
    reviewResultCount !== undefined ||
    impressionResultCount !== undefined

  /*
   * Normal site search is still review-only.
   * If Discover has not supplied its separate counts,
   * preserve the existing wording.
   */
  if (!hasDiscoveryCounts) {
    const count = suggestion.reviewCount
    const reviewWord =
      count === 1 ? "review" : "reviews"

    if (
      suggestion.type === "artist" ||
      suggestion.type === "genre"
    ) {
      return `Mentioned in ${count} ${reviewWord}`
    }

    return `${count} ${reviewWord}`
  }

  const parts: string[] = []

  if (
    reviewResultCount !== undefined &&
    reviewResultCount > 0
  ) {
    parts.push(
      `${reviewResultCount} ${
        reviewResultCount === 1
          ? "review"
          : "reviews"
      }`,
    )
  }

  if (
    impressionResultCount !== undefined &&
    impressionResultCount > 0
  ) {
    parts.push(
      `${impressionResultCount} ${
        impressionResultCount === 1
          ? "impression"
          : "impressions"
      }`,
    )
  }

  /*
   * Should only occur for a selected suggestion that
   * is being kept visible with a zero count.
   */
  if (parts.length === 0) {
    return "0 results"
  }

  return parts.join(" · ")
}

function highlightMatch(
  text: string,
  query: string,
) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return text
  }

  const normalizedText = normalizeSearchValue(text)
  const normalizedQuery =
    normalizeSearchValue(trimmedQuery)

  const index = normalizedText.indexOf(normalizedQuery)

  if (index === -1) {
    return text
  }

  return (
    <>
      {text.slice(0, index)}

      <mark className="rounded bg-[var(--accent)]/20 px-0.5 text-[var(--foreground)]">
        {text.slice(
          index,
          index + trimmedQuery.length,
        )}
      </mark>

      {text.slice(index + trimmedQuery.length)}
    </>
  )
}

function SearchTypeIcon({
  type,
  large = false,
}: {
  type: SearchSuggestionType
  large?: boolean
}) {
  const className = large
    ? "h-5 w-5"
    : "h-4 w-4"

  switch (type) {
    case "product":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
          <path d="M4 13a2 2 0 0 1 2-2h1v7H6a2 2 0 0 1-2-2Z" />
          <path d="M20 13a2 2 0 0 0-2-2h-1v7h1a2 2 0 0 0 2-2Z" />
        </svg>
      )

    case "brand":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 21h18" />
          <path d="M5 21V10l5 3v-3l5 3V7l4 2v12" />
          <path d="M8 17h1" />
          <path d="M12 17h1" />
          <path d="M16 17h1" />
        </svg>
      )

    case "reviewer":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      )

    case "artist":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l10-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="16" cy="16" r="3" />
        </svg>
      )

    case "genre":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h10" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      )
  }
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="h-4 w-4"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-[var(--muted)]"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]"
    />
  )
}

export default ReviewSearch