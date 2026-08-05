import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { useNavigate } from "react-router"

import DiscoverSection from "../components/discover/DiscoverSection"
import ReviewSearch from "../components/reviews/ReviewSearch"

import { getSearchSuggestions } from "../lib/search"

import type {
  SearchSuggestion,
  SearchSuggestionType,
} from "../types/search"

const SECTION_CONFIG: {
  type: SearchSuggestionType
  title: string
  description: string
}[] = [
  {
    type: "iem",
    title: "IEMs",
    description:
      "Browse in-ear monitors currently covered by published ITGE reviews.",
  },
  {
    type: "manufacturer",
    title: "Manufacturers",
    description:
      "Explore reviews through the companies and brands behind the IEMs.",
  },
  {
    type: "artist",
    title: "Artists",
    description:
      "Find reviews informed by the artists our reviewers actually listened to.",
  },
  {
    type: "genre",
    title: "Genres",
    description:
      "Browse reviews through the musical genres used during evaluation.",
  },
  {
    type: "reviewer",
    title: "Reviewers",
    description:
      "Meet the ITGE members behind the reviews and explore their work.",
  },
]

function DiscoverPage() {
  const navigate = useNavigate()

  const [suggestions, setSuggestions] = useState<
    SearchSuggestion[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadDiscoverContent() {
      setLoading(true)
      setError(null)

      try {
        const result = await getSearchSuggestions()

        if (!cancelled) {
          setSuggestions(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load Discover content:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "Discover content could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadDiscoverContent()

    return () => {
      cancelled = true
    }
  }, [])

  const groupedSuggestions = useMemo(() => {
    const groups: Record<
      SearchSuggestionType,
      SearchSuggestion[]
    > = {
      iem: [],
      manufacturer: [],
      reviewer: [],
      artist: [],
      genre: [],
    }

    suggestions.forEach((suggestion) => {
      groups[suggestion.type].push(suggestion)
    })

    Object.values(groups).forEach((items) => {
      items.sort((first, second) => {
        const countDifference =
          second.reviewCount - first.reviewCount

        if (countDifference !== 0) {
          return countDifference
        }

        return first.name.localeCompare(second.name)
      })
    })

    return groups
  }, [suggestions])

  const handleSelection = (
    suggestion: SearchSuggestion,
  ) => {
    if (suggestion.type === "reviewer") {
      navigate(`/reviewers/${suggestion.slug}`)
      return
    }

    const params = new URLSearchParams()

    switch (suggestion.type) {
      case "artist":
        params.set("artist", suggestion.slug)
        break

      case "genre":
        params.set("genre", suggestion.slug)
        break

      case "iem":
        params.set("iem", suggestion.name)
        break

      case "manufacturer":
        params.set(
          "manufacturer",
          suggestion.name,
        )
        break
    }

    navigate(`/reviews?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Explore ITGE
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
            Discover reviews through what matters to you.
          </h1>

          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            Browse IEMs, manufacturers, artists,
            genres and reviewers already represented in
            the ITGE database.
          </p>
        </header>

        <div className="mb-14 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 sm:p-8">
          <ReviewSearch onSelect={handleSelection} />
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            Loading Discover...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
            <p className="font-semibold">
              Unable to load Discover
            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">
              {error}
            </p>
          </div>
        ) : (
          <div>
            {SECTION_CONFIG.map((section) => (
              <DiscoverSection
                key={section.type}
                type={section.type}
                title={section.title}
                description={section.description}
                items={
                  groupedSuggestions[section.type]
                }
                onSelect={handleSelection}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default DiscoverPage