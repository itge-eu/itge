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
}

const TYPE_LABELS: Record<SearchSuggestionType, string> = {
  iem: "IEM",
  manufacturer: "Manufacturer",
  reviewer: "Reviewer",
  artist: "Artist",
  genre: "Genre",
}

function normalizeSearchValue(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function ReviewSearch({ onSelect }: ReviewSearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<
    SearchSuggestion[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
          setError("Search suggestions could not be loaded.")
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
  }, [])

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
        const firstName = normalizeSearchValue(first.name)
        const secondName = normalizeSearchValue(second.name)

        const firstStartsWith =
          firstName.startsWith(normalizedQuery)
        const secondStartsWith =
          secondName.startsWith(normalizedQuery)

        if (firstStartsWith && !secondStartsWith) {
          return -1
        }

        if (!firstStartsWith && secondStartsWith) {
          return 1
        }

        return first.name.localeCompare(second.name)
      })
      .slice(0, 12)
  }, [query, suggestions])

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
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()

      setActiveIndex((current) =>
        current <= 0
          ? filteredSuggestions.length - 1
          : current - 1,
      )
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault()

      const suggestion =
        filteredSuggestions[activeIndex]

      if (suggestion) {
        selectSuggestion(suggestion)
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative mb-10"
    >
      <label
        htmlFor="review-search"
        className="mb-3 block text-sm font-semibold"
      >
        Search what ITGE currently contains
      </label>

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
          placeholder="Search IEMs, artists, genres, reviewers..."
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showMenu}
          aria-controls="review-search-results"
          aria-activedescendant={
            activeIndex >= 0
              ? `review-search-option-${activeIndex}`
              : undefined
          }
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-4 pl-12 pr-4 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />
      </div>

      {showMenu && (
        <div
          id="review-search-results"
          role="listbox"
          className="absolute z-30 mt-2 max-h-96 w-full overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl shadow-black/10 dark:shadow-black/30"
        >
          {loading ? (
            <p className="px-4 py-5 text-sm text-[var(--muted)]">
              Loading available ITGE content...
            </p>
          ) : error ? (
            <p className="px-4 py-5 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : filteredSuggestions.length === 0 ? (
            <div className="px-4 py-5">
              <p className="font-medium">
                No matches in ITGE yet
              </p>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Try another IEM, manufacturer, reviewer,
                artist, or genre.
              </p>
            </div>
          ) : (
            filteredSuggestions.map((suggestion, index) => {
              const active = index === activeIndex

              return (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  id={`review-search-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() =>
                    selectSuggestion(suggestion)
                  }
                  className={`flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition ${
                    active
                      ? "bg-[var(--surface-soft)]"
                      : "hover:bg-[var(--surface-soft)]"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {suggestion.name}
                    </span>

                    {suggestion.subtitle && (
                      <span className="mt-0.5 block truncate text-sm text-[var(--muted)]">
                        {suggestion.subtitle}
                      </span>
                    )}
                  </span>

                  <span className="shrink-0 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
                    {TYPE_LABELS[suggestion.type]}
                  </span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
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

export default ReviewSearch