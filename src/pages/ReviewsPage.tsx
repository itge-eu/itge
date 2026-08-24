import {
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  useLocation,
  useNavigate,
} from "react-router"

import ImpressionCard from "../components/impressions/ImpressionCard"
import ReviewCard from "../components/reviews/ReviewCard"
import ReviewsHeader from "../components/reviews/ReviewsHeader"
import ReviewSearch from "../components/reviews/ReviewSearch"
import usePageMetadata from "../hooks/usePageMetadata"

import {
  getFilteredAllImpressions,
  type ImpressionSummary,
} from "../lib/impressions"

import {
  getAllReviews,
  type FeaturedReview,
} from "../lib/reviews"

import type { SearchSuggestion } from "../types/search"

type ContentType =
  | "all"
  | "reviews"
  | "impressions"

type SortOption =
  | "newest"
  | "oldest"
  | "iem"
  | "reviewer"

type ContentItem =
  | {
      type: "review"
      review: FeaturedReview
    }
  | {
      type: "impression"
      impression: ImpressionSummary
    }

function ReviewsPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [reviews, setReviews] =
    useState<FeaturedReview[]>([])

  const [impressions, setImpressions] =
    useState<ImpressionSummary[]>([])

  const [artistName, setArtistName] =
    useState<string | null>(null)

  const [genreName, setGenreName] =
    useState<string | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [contentType, setContentType] =
    useState<ContentType>("all")

  const [sortOption, setSortOption] =
    useState<SortOption>("newest")

  const searchParams = useMemo(
    () =>
      new URLSearchParams(
        location.search,
      ),
    [location.search],
  )

  const artistSlug =
    searchParams.get("artist")

  const genreSlug =
    searchParams.get("genre")

  const iemName =
    searchParams.get("iem")

  const manufacturerName =
    searchParams.get(
      "manufacturer",
    )

  const reviewerName =
    searchParams.get("reviewer")

  usePageMetadata({
    title: "Reviews | ITGE",
    description:
      "Browse independent IEM reviews and listening impressions from ITGE reviewers.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadContent() {
      setLoading(true)
      setError(null)

      try {
        const [
          reviewResult,
          impressionResult,
        ] = await Promise.all([
          getAllReviews({
            artistSlug:
              artistSlug ??
              undefined,

            genreSlug:
              genreSlug ??
              undefined,

            iemName:
              iemName ??
              undefined,

            manufacturerName:
              manufacturerName ??
              undefined,

            reviewerName:
              reviewerName ??
              undefined,
          }),

          getFilteredAllImpressions({
            artistSlug:
              artistSlug ??
              undefined,
          
            genreSlug:
              genreSlug ??
              undefined,
          
            iemName:
              iemName ??
              undefined,
          
            manufacturerName:
              manufacturerName ??
              undefined,
          
            reviewerName:
              reviewerName ??
              undefined,
          }),
        ])

        if (cancelled) {
          return
        }

        setReviews(
          reviewResult.reviews,
        )

        setArtistName(
          reviewResult.artistName,
        )

        setGenreName(
          reviewResult.genreName,
        )

        setImpressions(
          impressionResult.impressions,
        )
      } catch (loadError) {
        console.error(
          "Could not load reviews and impressions:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The reviews and impressions could not be loaded.",
          )

          setReviews([])
          setImpressions([])
          setArtistName(null)
          setGenreName(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadContent()

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

  let additionalFilterType:
    | string
    | null = null

  let additionalFilterName:
    | string
    | null = null

  if (iemName) {
    additionalFilterType = "iem"
    additionalFilterName = iemName
  } else if (
    manufacturerName
  ) {
    additionalFilterType =
      "manufacturer"

    additionalFilterName =
      manufacturerName
  } else if (reviewerName) {
    additionalFilterType =
      "reviewer"

    additionalFilterName =
      reviewerName
  }

  const contentItems =
    useMemo(() => {
      const items: ContentItem[] =
        []

      if (
        contentType === "all" ||
        contentType === "reviews"
      ) {
        items.push(
          ...reviews.map(
            (review) => ({
              type:
                "review" as const,
              review,
            }),
          ),
        )
      }

      if (
        contentType === "all" ||
        contentType ===
          "impressions"
      ) {
        items.push(
          ...impressions.map(
            (impression) => ({
              type:
                "impression" as const,
              impression,
            }),
          ),
        )
      }

      return items.sort(
        (first, second) =>
          compareContentItems(
            first,
            second,
            sortOption,
          ),
      )
    }, [
      reviews,
      impressions,
      contentType,
      sortOption,
    ])

  const handleSearchSelection = (
    suggestion: SearchSuggestion,
  ) => {
    const params =
      new URLSearchParams()

    switch (
      suggestion.type
    ) {
      case "artist":
        params.set(
          "artist",
          suggestion.slug,
        )
        break

      case "genre":
        params.set(
          "genre",
          suggestion.slug,
        )
        break

      case "iem":
        params.set(
          "iem",
          suggestion.name,
        )
        break

      case "manufacturer":
        params.set(
          "manufacturer",
          suggestion.name,
        )
        break

      case "reviewer":
        params.set(
          "reviewer",
          suggestion.name,
        )
        break
    }

    navigate(
      `/reviews?${params.toString()}`,
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ReviewsHeader
          artistName={
            artistName
          }
          genreName={
            genreName
          }
          additionalFilterType={
            additionalFilterType
          }
          additionalFilterName={
            additionalFilterName
          }
          hasFilters={
            hasFilters
          }
        />

        <ReviewSearch
          onSelect={
            handleSearchSelection
          }
        />

        <section className="mb-8 flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <ContentTypeButton
              label="All"
              active={
                contentType ===
                "all"
              }
              onClick={() =>
                setContentType(
                  "all",
                )
              }
            />

            <ContentTypeButton
              label="Reviews"
              active={
                contentType ===
                "reviews"
              }
              onClick={() =>
                setContentType(
                  "reviews",
                )
              }
            />

            <ContentTypeButton
              label="Impressions"
              active={
                contentType ===
                "impressions"
              }
              onClick={() =>
                setContentType(
                  "impressions",
                )
              }
            />
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="review-sort"
              className="text-sm text-[var(--muted)]"
            >
              Sort by
            </label>

            <select
              id="review-sort"
              value={sortOption}
              onChange={(event) =>
                setSortOption(
                  event.target
                    .value as SortOption,
                )
              }
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
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
        </section>

        {loading ? (
          <p className="text-[var(--muted)]">
            Loading reviews and
            impressions...
          </p>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            {error}
          </div>
        ) : contentItems.length ===
          0 ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            {hasFilters
              ? "No published content matches these filters yet."
              : contentType ===
                  "reviews"
                ? "No published reviews are available yet."
                : contentType ===
                    "impressions"
                  ? "No published impressions are available yet."
                  : "No published reviews or impressions are available yet."}
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-[var(--muted)]">
              {
                contentItems.length
              }{" "}
              {contentItems.length ===
              1
                ? "result"
                : "results"}
            </p>

            <div className="grid gap-8">
              {contentItems.map(
                (item) =>
                  item.type ===
                  "review" ? (
                    <ReviewCard
                      key={`review-${item.review.id}`}
                      review={
                        item.review
                      }
                    />
                  ) : (
                    <ImpressionCard
                      key={`impression-${item.impression.id}`}
                      impression={
                        item.impression
                      }
                    />
                  ),
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function ContentTypeButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
          : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--accent)]"
      }`}
    >
      {label}
    </button>
  )
}

function compareContentItems(
  first: ContentItem,
  second: ContentItem,
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
  item: ContentItem,
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
  item: ContentItem,
): string {
  if (
    item.type === "review"
  ) {
    return `${item.review.brand} ${item.review.model}`
  }

  return `${item.impression.iem.manufacturer.name} ${item.impression.iem.model}`
}

function getReviewerName(
  item: ContentItem,
): string {
  return item.type ===
    "review"
    ? item.review.reviewer
    : item.impression
        .reviewer.name
}

export default ReviewsPage