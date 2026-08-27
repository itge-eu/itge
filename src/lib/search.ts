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

type ProductRow = {
  id: number
  model: string
  brand_id: number | null
  brands:
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
  product_id: number | null
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
    productsResult,
    brandsResult,
    reviewersResult,
    artistsResult,
    genresResult,
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select(`
        id,
        product_id,
        reviewer_id
      `)
      .eq("published", true),

    supabase
      .from("products")
      .select(`
        id,
        model,
        brand_id,
        brands (
          id,
          name
        )
      `)
      .order("model", { ascending: true }),

    supabase
      .from("brands")
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
    productsResult.error ||
    brandsResult.error ||
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

  const productCounts = new Map<number, number>()
  const reviewerCounts = new Map<number, number>()

  publishedReviews.forEach((review) => {
    increaseCount(productCounts, review.product_id)
    increaseCount(reviewerCounts, review.reviewer_id)
  })

  const productRows =
    (productsResult.data ?? []) as unknown as ProductRow[]

  const brandCounts = new Map<number, number>()

  productRows.forEach((product) => {
    const reviewCount = productCounts.get(Number(product.id)) ?? 0

    if (reviewCount === 0) {
      return
    }

    const brand = getSingleRelation(
      product.brands,
    )

    const brandId =
      product.brand_id ?? brand?.id

    if (brandId !== null && brandId !== undefined) {
      brandCounts.set(
        Number(brandId),
        (brandCounts.get(Number(brandId)) ?? 0) +
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

  const productSuggestions = productRows.flatMap(
    (row): SearchSuggestion[] => {
      const reviewCount =
        productCounts.get(Number(row.id)) ?? 0

      if (reviewCount === 0) {
        return []
      }

      const brand = getSingleRelation(
        row.brands,
      )

      return [
        {
          id: Number(row.id),
          type: "product",
          name: row.model,
          slug: slugify(row.model),
          subtitle: brand?.name,
          reviewCount,
        },
      ]
    },
  )

  const brandSuggestions = mapNamedRows(
    (brandsResult.data ?? []) as NamedRow[],
    "brand",
    brandCounts,
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
    ...productSuggestions,
    ...brandSuggestions,
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