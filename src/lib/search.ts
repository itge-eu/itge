import { supabase } from "./supabase"

import type {
  SearchSuggestion,
  SearchSuggestionType,
} from "../types/search"

type NamedRow = {
  id: number
  name: string
  slug?: string | null
}

type IemRow = {
  id: number
  model: string
  manufacturer_id: number | null
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

type PublishedReviewRow = {
  id: number
  iem_id: number | null
  reviewer_id: number | null
}

type ReviewArtistRelationRow = {
  review_id: number
  artist_id: number
}

type ReviewGenreRelationRow = {
  review_id: number
  genre_id: number
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function getSingleRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation ?? null
}

function increaseCount(
  counts: Map<number, number>,
  id: number | null | undefined,
) {
  if (id === null || id === undefined) {
    return
  }

  counts.set(id, (counts.get(id) ?? 0) + 1)
}

function mapNamedRows(
  rows: NamedRow[],
  type: SearchSuggestionType,
  counts: Map<number, number>,
): SearchSuggestion[] {
  return rows.flatMap((row) => {
    const reviewCount = counts.get(Number(row.id)) ?? 0

    if (reviewCount === 0) {
      return []
    }

    return [
      {
        id: Number(row.id),
        type,
        name: row.name,
        slug: row.slug || slugify(row.name),
        reviewCount,
      },
    ]
  })
}

export async function getSearchSuggestions(): Promise<
  SearchSuggestion[]
> {
  const [
    reviewsResult,
    iemsResult,
    manufacturersResult,
    reviewersResult,
    artistsResult,
    genresResult,
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select(`
        id,
        iem_id,
        reviewer_id
      `)
      .eq("published", true),

    supabase
      .from("iems")
      .select(`
        id,
        model,
        manufacturer_id,
        manufacturers (
          id,
          name
        )
      `)
      .order("model", { ascending: true }),

    supabase
      .from("manufacturers")
      .select(`
        id,
        name
      `)
      .order("name", { ascending: true }),

    supabase
      .from("reviewers")
      .select(`
        id,
        name,
        slug
      `)
      .order("name", { ascending: true }),

    supabase
      .from("artists")
      .select(`
        id,
        name,
        slug
      `)
      .order("name", { ascending: true }),

    supabase
      .from("genres")
      .select(`
        id,
        name,
        slug
      `)
      .order("name", { ascending: true }),
  ])

  const firstError =
    reviewsResult.error ||
    iemsResult.error ||
    manufacturersResult.error ||
    reviewersResult.error ||
    artistsResult.error ||
    genresResult.error

  if (firstError) {
    throw firstError
  }

  const publishedReviews =
    (reviewsResult.data ?? []) as PublishedReviewRow[]

  const publishedReviewIds = publishedReviews.map(
    (review) => Number(review.id),
  )

  const iemCounts = new Map<number, number>()
  const reviewerCounts = new Map<number, number>()

  publishedReviews.forEach((review) => {
    increaseCount(iemCounts, review.iem_id)
    increaseCount(reviewerCounts, review.reviewer_id)
  })

  const iemRows =
    (iemsResult.data ?? []) as unknown as IemRow[]

  const manufacturerCounts = new Map<number, number>()

  iemRows.forEach((iem) => {
    const reviewCount = iemCounts.get(Number(iem.id)) ?? 0

    if (reviewCount === 0) {
      return
    }

    const manufacturer = getSingleRelation(
      iem.manufacturers,
    )

    const manufacturerId =
      iem.manufacturer_id ?? manufacturer?.id

    if (manufacturerId !== null && manufacturerId !== undefined) {
      manufacturerCounts.set(
        Number(manufacturerId),
        (manufacturerCounts.get(Number(manufacturerId)) ?? 0) +
          reviewCount,
      )
    }
  })

  let artistCounts = new Map<number, number>()
  let genreCounts = new Map<number, number>()

  if (publishedReviewIds.length > 0) {
    const [
      reviewArtistsResult,
      reviewGenresResult,
    ] = await Promise.all([
      supabase
        .from("review_artists")
        .select(`
          review_id,
          artist_id
        `)
        .in("review_id", publishedReviewIds),

      supabase
        .from("review_genres")
        .select(`
          review_id,
          genre_id
        `)
        .in("review_id", publishedReviewIds),
    ])

    const relationError =
      reviewArtistsResult.error ||
      reviewGenresResult.error

    if (relationError) {
      throw relationError
    }

    artistCounts = countUniqueReviewRelations(
      (reviewArtistsResult.data ??
        []) as ReviewArtistRelationRow[],
      (relation) => Number(relation.artist_id),
      (relation) => Number(relation.review_id),
    )

    genreCounts = countUniqueReviewRelations(
      (reviewGenresResult.data ??
        []) as ReviewGenreRelationRow[],
      (relation) => Number(relation.genre_id),
      (relation) => Number(relation.review_id),
    )
  }

  const iemSuggestions = iemRows.flatMap(
    (row): SearchSuggestion[] => {
      const reviewCount =
        iemCounts.get(Number(row.id)) ?? 0

      if (reviewCount === 0) {
        return []
      }

      const manufacturer = getSingleRelation(
        row.manufacturers,
      )

      return [
        {
          id: Number(row.id),
          type: "iem",
          name: row.model,
          slug: slugify(row.model),
          subtitle: manufacturer?.name,
          reviewCount,
        },
      ]
    },
  )

  const manufacturerSuggestions = mapNamedRows(
    (manufacturersResult.data ?? []) as NamedRow[],
    "manufacturer",
    manufacturerCounts,
  )

  const reviewerSuggestions = mapNamedRows(
    (reviewersResult.data ?? []) as NamedRow[],
    "reviewer",
    reviewerCounts,
  )

  const artistSuggestions = mapNamedRows(
    (artistsResult.data ?? []) as NamedRow[],
    "artist",
    artistCounts,
  )

  const genreSuggestions = mapNamedRows(
    (genresResult.data ?? []) as NamedRow[],
    "genre",
    genreCounts,
  )

  return [
    ...iemSuggestions,
    ...manufacturerSuggestions,
    ...reviewerSuggestions,
    ...artistSuggestions,
    ...genreSuggestions,
  ]
}

function countUniqueReviewRelations<T>(
  rows: T[],
  getEntityId: (row: T) => number,
  getReviewId: (row: T) => number,
): Map<number, number> {
  const relationSets = new Map<number, Set<number>>()

  rows.forEach((row) => {
    const entityId = getEntityId(row)
    const reviewId = getReviewId(row)

    const reviewIds =
      relationSets.get(entityId) ?? new Set<number>()

    reviewIds.add(reviewId)
    relationSets.set(entityId, reviewIds)
  })

  return new Map(
    Array.from(relationSets.entries()).map(
      ([entityId, reviewIds]) => [
        entityId,
        reviewIds.size,
      ],
    ),
  )
}