import {
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  useLocation,
  useNavigate,
} from "react-router"

import ReviewGrid from "../components/reviews/ReviewGrid"
import ReviewsHeader from "../components/reviews/ReviewsHeader"
import ReviewSearch from "../components/reviews/ReviewSearch"
import usePageMetadata from "../hooks/usePageMetadata"

import {
  getAllReviews,
  type FeaturedReview,
} from "../lib/reviews"

import type { SearchSuggestion } from "../types/search"

function ReviewsPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [reviews, setReviews] = useState<
    FeaturedReview[]
  >([])
  const [artistName, setArtistName] = useState<
    string | null
  >(null)
  const [genreName, setGenreName] = useState<
    string | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(
    null,
  )

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  )

  const artistSlug = searchParams.get("artist")
  const genreSlug = searchParams.get("genre")
  const iemName = searchParams.get("iem")
  const manufacturerName =
    searchParams.get("manufacturer")
  const reviewerName = searchParams.get("reviewer")

  usePageMetadata({
    title: "Reviews | ITGE",
    description:
      "Browse independent IEM reviews from ITGE reviewers.",
  })
  
  useEffect(() => {
    let cancelled = false

    async function loadReviews() {
      setLoading(true)
      setError(null)

      try {
        const result = await getAllReviews({
          artistSlug: artistSlug ?? undefined,
          genreSlug: genreSlug ?? undefined,
          iemName: iemName ?? undefined,
          manufacturerName:
            manufacturerName ?? undefined,
          reviewerName: reviewerName ?? undefined,
        })

        if (!cancelled) {
          setReviews(result.reviews)
          setArtistName(result.artistName)
          setGenreName(result.genreName)
        }
      } catch (loadError) {
        console.error(
          "Could not load reviews:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The reviews could not be loaded.",
          )
          setReviews([])
          setArtistName(null)
          setGenreName(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadReviews()

    return () => {
      cancelled = true
    }
  }, [
    artistSlug,
    genreSlug,
    iemName,
    manufacturerName,
    reviewerName,
  ])

  const hasFilters = Boolean(
    artistSlug ||
      genreSlug ||
      iemName ||
      manufacturerName ||
      reviewerName,
  )

  let additionalFilterType: string | null = null
  let additionalFilterName: string | null = null

  if (iemName) {
    additionalFilterType = "iem"
    additionalFilterName = iemName
  } else if (manufacturerName) {
    additionalFilterType = "manufacturer"
    additionalFilterName = manufacturerName
  } else if (reviewerName) {
    additionalFilterType = "reviewer"
    additionalFilterName = reviewerName
  }

  const handleSearchSelection = (
    suggestion: SearchSuggestion,
  ) => {
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

      case "reviewer":
        params.set("reviewer", suggestion.name)
        break
    }

    navigate(`/reviews?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ReviewsHeader
          artistName={artistName}
          genreName={genreName}
          additionalFilterType={
            additionalFilterType
          }
          additionalFilterName={
            additionalFilterName
          }
          hasFilters={hasFilters}
        />

        <ReviewSearch
          onSelect={handleSearchSelection}
        />

        {loading ? (
          <p className="text-[var(--muted)]">
            Loading reviews...
          </p>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            {hasFilters
              ? "No published reviews match these filters yet."
              : "No published reviews are available yet."}
          </div>
        ) : (
          <ReviewGrid reviews={reviews} />
        )}
      </div>
    </main>
  )
}

export default ReviewsPage