import { supabase } from "./supabase"

import type {
  DiscoveryEntity,
  DiscoveryIem,
  DiscoveryReview,
  DiscoveryState,
  SelectedDiscoveryFilters,
} from "../types/discovery"

import type {
  SearchSuggestion,
  SearchSuggestionType,
} from "../types/search"

type ArtistRelationRow = {
  artists:
    | {
        id: number
        name: string
        slug: string
      }
    | {
        id: number
        name: string
        slug: string
      }[]
    | null
}

type GenreRelationRow = {
  genres:
    | {
        id: number
        name: string
        slug: string
      }
    | {
        id: number
        name: string
        slug: string
      }[]
    | null
}

type DiscoveryReviewRow = {
  id: number
  slug: string
  rating: number
  title: string
  summary: string
  hero_image_url: string | null

  reviewers:
    | {
        id: number
        name: string
        slug: string
      }
    | {
        id: number
        name: string
        slug: string
      }[]
    | null

  iems:
    | {
        id: number
        model: string
		slug: string
        manufacturers:
          | {
              id: number
              name: string
            }
          | {
              id: number
              name: string
            }[]
          | null
      }
    | {
        id: number
        model: string
		slug: string
        manufacturers:
          | {
              id: number
              name: string
            }
          | {
              id: number
              name: string
            }[]
          | null
      }[]
    | null

  review_artists?: ArtistRelationRow[] | null
  review_genres?: GenreRelationRow[] | null
}

const FILTER_TYPES: SearchSuggestionType[] = [
  "iem",
  "manufacturer",
  "artist",
  "genre",
  "reviewer",
]

function getSingleRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation ?? null
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function mapArtists(
  rows: ArtistRelationRow[] | null | undefined,
): DiscoveryEntity[] {
  return (rows ?? []).flatMap((row) => {
    const artist = getSingleRelation(row.artists)

    if (!artist) {
      return []
    }

    return [
      {
        id: Number(artist.id),
        name: artist.name,
        slug: artist.slug,
      },
    ]
  })
}

function mapGenres(
  rows: GenreRelationRow[] | null | undefined,
): DiscoveryEntity[] {
  return (rows ?? []).flatMap((row) => {
    const genre = getSingleRelation(row.genres)

    if (!genre) {
      return []
    }

    return [
      {
        id: Number(genre.id),
        name: genre.name,
        slug: genre.slug,
      },
    ]
  })
}

function mapDiscoveryReview(
  row: DiscoveryReviewRow,
): DiscoveryReview {
  const reviewer = getSingleRelation(row.reviewers)
  const iem = getSingleRelation(row.iems)
  const manufacturer = getSingleRelation(
    iem?.manufacturers,
  )

  if (!reviewer || !iem || !manufacturer) {
    throw new Error(
      `Review ${row.id} has incomplete discovery data`,
    )
  }

  const manufacturerEntity: DiscoveryEntity = {
    id: Number(manufacturer.id),
    name: manufacturer.name,
    slug: slugify(manufacturer.name),
  }

  const iemEntity: DiscoveryIem = {
    id: Number(iem.id),
    name: iem.model,
    slug: slugify(iem.model),
    manufacturerId: Number(manufacturer.id),
    manufacturerName: manufacturer.name,
  }

  const reviewerEntity: DiscoveryEntity = {
    id: Number(reviewer.id),
    name: reviewer.name,
    slug: reviewer.slug,
  }

  return {
    review: {
      id: Number(row.id),
      slug: row.slug,
      rating: Number(row.rating),
      title: row.title,
      summary: row.summary,
      brand: manufacturer.name,
      model: iem.model,
	  iemSlug: iem.slug,
      reviewer: reviewer.name,
      reviewerSlug: reviewer.slug,
      heroImageUrl: row.hero_image_url,
    },

    iem: iemEntity,
    manufacturer: manufacturerEntity,
    reviewer: reviewerEntity,

    artists: mapArtists(row.review_artists),
    genres: mapGenres(row.review_genres),
  }
}

export async function getDiscoveryReviews(): Promise<
  DiscoveryReview[]
> {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      slug,
      rating,
      title,
      summary,
      hero_image_url,

      reviewers (
        id,
        name,
        slug
      ),

      iems (
        id,
        model,
        manufacturers (
          id,
          name
        )
      ),

      review_artists (
        artists (
          id,
          name,
          slug
        )
      ),

      review_genres (
        genres (
          id,
          name,
          slug
        )
      )
    `)
    .eq("published", true)
    .order("published_at", { ascending: false })

  if (error) {
    throw error
  }

  const rows =
    (data ?? []) as unknown as DiscoveryReviewRow[]

  return rows.map(mapDiscoveryReview)
}

/**
 * Builds the complete client-side Discover state.
 *
 * Matching reviews apply every selected filter.
 *
 * Suggestions for each category apply every selected
 * filter except that category's own filter. This keeps
 * compatible alternatives visible within the category.
 */
export function buildDiscoveryState(
  discoveryReviews: DiscoveryReview[],
  selectedFilters: SelectedDiscoveryFilters,
): DiscoveryState {
  const matchingDiscoveryReviews =
    discoveryReviews.filter((review) =>
      reviewMatchesFilters(
        review,
        selectedFilters,
      ),
    )

  const suggestions = {
    iem: buildSuggestionsForType(
      discoveryReviews,
      selectedFilters,
      "iem",
    ),

    manufacturer: buildSuggestionsForType(
      discoveryReviews,
      selectedFilters,
      "manufacturer",
    ),

    reviewer: buildSuggestionsForType(
      discoveryReviews,
      selectedFilters,
      "reviewer",
    ),

    artist: buildSuggestionsForType(
      discoveryReviews,
      selectedFilters,
      "artist",
    ),

    genre: buildSuggestionsForType(
      discoveryReviews,
      selectedFilters,
      "genre",
    ),
  }

  return {
    matchingReviews: matchingDiscoveryReviews.map(
      (item) => item.review,
    ),
    suggestions,
  }
}

function buildSuggestionsForType(
  discoveryReviews: DiscoveryReview[],
  selectedFilters: SelectedDiscoveryFilters,
  type: SearchSuggestionType,
): SearchSuggestion[] {
  /*
   * Ignore this category's own selected filter while
   * calculating its options.
   *
   * Example:
   * When calculating IEM choices, Manufacturer,
   * Artist, Genre and Reviewer remain active, but the
   * currently selected IEM is temporarily ignored.
   */
  const relevantReviews = discoveryReviews.filter(
    (review) =>
      reviewMatchesFilters(
        review,
        selectedFilters,
        type,
      ),
  )

  const suggestions = collectSuggestions(
    relevantReviews,
    type,
  )

  return ensureSelectedSuggestion(
    suggestions,
    selectedFilters[type],
  )
}

function reviewMatchesFilters(
  review: DiscoveryReview,
  selectedFilters: SelectedDiscoveryFilters,
  ignoredType?: SearchSuggestionType,
): boolean {
  for (const type of FILTER_TYPES) {
    if (type === ignoredType) {
      continue
    }

    const selected = selectedFilters[type]

    if (!selected) {
      continue
    }

    if (!reviewMatchesFilter(review, type, selected)) {
      return false
    }
  }

  return true
}

function reviewMatchesFilter(
  review: DiscoveryReview,
  type: SearchSuggestionType,
  selected: SearchSuggestion,
): boolean {
  switch (type) {
    case "iem":
      return review.iem.id === selected.id

    case "manufacturer":
      return review.manufacturer.id === selected.id

    case "reviewer":
      return review.reviewer.id === selected.id

    case "artist":
      return review.artists.some(
        (artist) => artist.id === selected.id,
      )

    case "genre":
      return review.genres.some(
        (genre) => genre.id === selected.id,
      )
  }
}

function collectSuggestions(
  reviews: DiscoveryReview[],
  type: SearchSuggestionType,
): SearchSuggestion[] {
  const suggestions = new Map<
    number,
    SearchSuggestion
  >()

  for (const review of reviews) {
    const reviewEntities = getEntitiesForType(
      review,
      type,
    )

    /*
     * Prevent accidental duplicate artist/genre rows
     * within one review from increasing the count twice.
     */
    const uniqueEntities = new Map(
      reviewEntities.map((entity) => [
        entity.id,
        entity,
      ]),
    )

    for (const entity of uniqueEntities.values()) {
      const existing = suggestions.get(entity.id)

      if (existing) {
        existing.reviewCount += 1
        continue
      }

      suggestions.set(entity.id, {
        id: entity.id,
        type,
        name: entity.name,
        slug: entity.slug,
        subtitle:
          type === "iem" &&
          "manufacturerName" in entity
            ? entity.manufacturerName
            : undefined,
        reviewCount: 1,
      })
    }
  }

  return Array.from(suggestions.values()).sort(
    compareSuggestions,
  )
}

function getEntitiesForType(
  review: DiscoveryReview,
  type: SearchSuggestionType,
): Array<DiscoveryEntity | DiscoveryIem> {
  switch (type) {
    case "iem":
      return [review.iem]

    case "manufacturer":
      return [review.manufacturer]

    case "reviewer":
      return [review.reviewer]

    case "artist":
      return review.artists

    case "genre":
      return review.genres
  }
}

function ensureSelectedSuggestion(
  suggestions: SearchSuggestion[],
  selected: SearchSuggestion | null,
): SearchSuggestion[] {
  if (!selected) {
    return suggestions
  }

  const alreadyPresent = suggestions.some(
    (suggestion) =>
      suggestion.id === selected.id &&
      suggestion.type === selected.type,
  )

  if (alreadyPresent) {
    return suggestions
  }

  /*
   * This should rarely occur once the UI only exposes
   * valid choices. Keeping the selected option visible
   * with count 0 prevents it from vanishing before the
   * user can remove or replace it.
   */
  return [
    {
      ...selected,
      reviewCount: 0,
    },
    ...suggestions,
  ]
}

function compareSuggestions(
  first: SearchSuggestion,
  second: SearchSuggestion,
): number {
  const countDifference =
    second.reviewCount - first.reviewCount

  if (countDifference !== 0) {
    return countDifference
  }

  return first.name.localeCompare(second.name)
}