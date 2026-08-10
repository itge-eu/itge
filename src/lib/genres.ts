import { supabase } from "./supabase"

import type {
  FeaturedReview,
} from "./reviews"

import type {
  ImpressionSummary,
} from "./impressions"

/**
 * Existing admin-facing genre type.
 * Keep this because GenrePicker/AdminEditReviewPage use it.
 */
export type Genre = {
  id: number
  name: string
  slug: string
  sortOrder: number
}

type GenreRow = {
  id: number
  name: string
  slug: string
  sort_order: number
}

/**
 * Existing function used by admin pages.
 * Keep its return type and behaviour unchanged.
 */
export async function getGenres(): Promise<
  Genre[]
> {
  const { data, error } =
    await supabase
      .from("genres")
      .select(`
        id,
        name,
        slug,
        sort_order
      `)
      .order(
        "sort_order",
        {
          ascending: true,
        },
      )
      .order(
        "name",
        {
          ascending: true,
        },
      )

  if (error) {
    throw new Error(
      `Could not load genres: ${error.message}`,
    )
  }

  return (
    (data ?? []) as GenreRow[]
  ).map((genre) => ({
    id: Number(genre.id),
    name: genre.name,
    slug: genre.slug,
    sortOrder: Number(
      genre.sort_order,
    ),
  }))
}

/**
 * Public directory/profile types.
 */
export type GenreSummary = {
  id: number
  name: string
  slug: string

  reviewCount: number
  impressionCount: number
  coverageCount: number

  iemCount: number

  /**
   * Reviewers with at least one
   * full review in this genre.
   */
  reviewerCount: number

  /**
   * Unique people across both
   * reviews and impressions.
   */
  contributorCount: number
}

export type GenreIemSummary = {
  id: number
  model: string
  slug: string

  manufacturerName: string
  manufacturerSlug: string

  reviewCount: number
  impressionCount: number
  coverageCount: number
}

export type GenreReviewerSummary = {
  id: number
  name: string
  slug: string

  reviewCount: number
  impressionCount: number
  coverageCount: number
}

export type GenreProfile =
  GenreSummary & {
    reviews: FeaturedReview[]

    impressions:
      ImpressionSummary[]

    iems: GenreIemSummary[]

    reviewers:
      GenreReviewerSummary[]
  }

type ReviewGenreRelationRow = {
  review_id: number
  genre_id: number
}

type ImpressionGenreRelationRow = {
  impression_id: number
  genre_id: number
}

type PublishedReviewRow = {
  id: number
  iem_id: number | null
  reviewer_id: number | null
}

type PublishedImpressionRow = {
  id: number
  iem_id: number | null
  reviewer_id: number | null
}

type GenreDetailReviewRow = {
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
              slug: string
            }
          | {
              id: number
              name: string
              slug: string
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
              slug: string
            }
          | {
              id: number
              name: string
              slug: string
            }[]
          | null
      }[]
    | null
}

type GenreDetailImpressionRow = {
  id: number
  slug: string
  title: string | null
  summary: string | null
  body: string | null
  hero_image_url: string | null
  published_at: string | null

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
              slug: string
            }
          | {
              id: number
              name: string
              slug: string
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
              slug: string
            }
          | {
              id: number
              name: string
              slug: string
            }[]
          | null
      }[]
    | null
}

function getSingleRelation<T>(
  relation:
    | T
    | T[]
    | null
    | undefined,
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation ?? null
}

function mapGenreReview(
  row: GenreDetailReviewRow,
): FeaturedReview {
  const reviewer =
    getSingleRelation(
      row.reviewers,
    )

  const iem =
    getSingleRelation(
      row.iems,
    )

  const manufacturer =
    getSingleRelation(
      iem?.manufacturers,
    )

  if (
    !reviewer ||
    !iem ||
    !manufacturer
  ) {
    throw new Error(
      `Review ${row.id} has incomplete genre data`,
    )
  }

  return {
    id: Number(row.id),
    slug: row.slug,
    rating: Number(row.rating),
    title: row.title,
    summary: row.summary,

    brand:
      manufacturer.name,

    manufacturerSlug:
      manufacturer.slug,

    model: iem.model,
    iemSlug: iem.slug,

    reviewer:
      reviewer.name,

    reviewerSlug:
      reviewer.slug,

    heroImageUrl:
      row.hero_image_url,
  }
}

function mapGenreImpression(
  row: GenreDetailImpressionRow,
): ImpressionSummary {
  const reviewer =
    getSingleRelation(
      row.reviewers,
    )

  const iem =
    getSingleRelation(
      row.iems,
    )

  const manufacturer =
    getSingleRelation(
      iem?.manufacturers,
    )

  if (
    !reviewer ||
    !iem ||
    !manufacturer
  ) {
    throw new Error(
      `Impression ${row.id} has incomplete genre data`,
    )
  }

  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,

    heroImageUrl:
      row.hero_image_url,

    publishedAt:
      row.published_at,

    reviewer: {
      id: Number(
        reviewer.id,
      ),
      name: reviewer.name,
      slug: reviewer.slug,
    },

    iem: {
      id: Number(iem.id),
      model: iem.model,
      slug: iem.slug,

      manufacturer: {
        id: Number(
          manufacturer.id,
        ),
        name:
          manufacturer.name,
        slug:
          manufacturer.slug,
      },
    },
  }
}

/**
 * Public genre directory.
 *
 * Separate from getGenres()
 * so admin behaviour remains
 * unchanged.
 */
export async function getGenreDirectory(): Promise<
  GenreSummary[]
> {
  const [
    genresResult,
    reviewRelationsResult,
    impressionRelationsResult,
    reviewsResult,
    impressionsResult,
  ] = await Promise.all([
    supabase
      .from("genres")
      .select(`
        id,
        name,
        slug,
        sort_order
      `)
      .order(
        "sort_order",
        {
          ascending: true,
        },
      )
      .order(
        "name",
        {
          ascending: true,
        },
      ),

    supabase
      .from("review_genres")
      .select(`
        review_id,
        genre_id
      `),

    supabase
      .from("impression_genres")
      .select(`
        impression_id,
        genre_id
      `),

    supabase
      .from("reviews")
      .select(`
        id,
        iem_id,
        reviewer_id
      `)
      .eq(
        "published",
        true,
      ),

    supabase
      .from("impressions")
      .select(`
        id,
        iem_id,
        reviewer_id
      `)
      .eq(
        "published",
        true,
      ),
  ])

  const firstError =
    genresResult.error ||
    reviewRelationsResult.error ||
    impressionRelationsResult.error ||
    reviewsResult.error ||
    impressionsResult.error

  if (firstError) {
    throw firstError
  }

  const genres =
    (genresResult.data ??
      []) as GenreRow[]

  const reviewRelations =
    (reviewRelationsResult.data ??
      []) as ReviewGenreRelationRow[]

  const impressionRelations =
    (impressionRelationsResult.data ??
      []) as ImpressionGenreRelationRow[]

  const publishedReviews =
    (reviewsResult.data ??
      []) as PublishedReviewRow[]

  const publishedImpressions =
    (impressionsResult.data ??
      []) as PublishedImpressionRow[]

  const publishedReviewMap =
    new Map<
      number,
      PublishedReviewRow
    >(
      publishedReviews.map(
        (review) => [
          Number(review.id),
          review,
        ],
      ),
    )

  const publishedImpressionMap =
    new Map<
      number,
      PublishedImpressionRow
    >(
      publishedImpressions.map(
        (impression) => [
          Number(
            impression.id,
          ),
          impression,
        ],
      ),
    )

  return genres
    .map((genre) => {
      const reviewIds =
        new Set<number>()

      const impressionIds =
        new Set<number>()

      for (
        const relation of
        reviewRelations
      ) {
        if (
          Number(
            relation.genre_id,
          ) ===
          Number(genre.id)
        ) {
          reviewIds.add(
            Number(
              relation.review_id,
            ),
          )
        }
      }

      for (
        const relation of
        impressionRelations
      ) {
        if (
          Number(
            relation.genre_id,
          ) ===
          Number(genre.id)
        ) {
          impressionIds.add(
            Number(
              relation.impression_id,
            ),
          )
        }
      }

      const iemIds =
        new Set<number>()

      const reviewReviewerIds =
        new Set<number>()

      const contributorIds =
        new Set<number>()

      let reviewCount = 0
      let impressionCount = 0

      for (
        const reviewId of
        reviewIds
      ) {
        const review =
          publishedReviewMap.get(
            reviewId,
          )

        if (!review) {
          continue
        }

        reviewCount += 1

        if (
          review.iem_id !=
          null
        ) {
          iemIds.add(
            Number(
              review.iem_id,
            ),
          )
        }

        if (
          review.reviewer_id !=
          null
        ) {
          const reviewerId =
            Number(
              review.reviewer_id,
            )

          reviewReviewerIds.add(
            reviewerId,
          )

          contributorIds.add(
            reviewerId,
          )
        }
      }

      for (
        const impressionId of
        impressionIds
      ) {
        const impression =
          publishedImpressionMap.get(
            impressionId,
          )

        if (!impression) {
          continue
        }

        impressionCount += 1

        if (
          impression.iem_id !=
          null
        ) {
          iemIds.add(
            Number(
              impression.iem_id,
            ),
          )
        }

        if (
          impression.reviewer_id !=
          null
        ) {
          contributorIds.add(
            Number(
              impression.reviewer_id,
            ),
          )
        }
      }

      return {
        id: Number(
          genre.id,
        ),

        name: genre.name,
        slug: genre.slug,

        reviewCount,

        impressionCount,

        coverageCount:
          reviewCount +
          impressionCount,

        iemCount:
          iemIds.size,

        reviewerCount:
          reviewReviewerIds.size,

        contributorCount:
          contributorIds.size,
      }
    })
    .filter(
      (genre) =>
        genre.coverageCount >
        0,
    )
}

export async function getGenreBySlug(
  slug: string,
): Promise<GenreProfile | null> {
  const {
    data: genre,
    error: genreError,
  } = await supabase
    .from("genres")
    .select(`
      id,
      name,
      slug
    `)
    .eq(
      "slug",
      slug,
    )
    .maybeSingle()

  if (genreError) {
    throw genreError
  }

  if (!genre) {
    return null
  }

  const [
    reviewRelationsResult,
    impressionRelationsResult,
  ] = await Promise.all([
    supabase
      .from("review_genres")
      .select(`
        review_id
      `)
      .eq(
        "genre_id",
        genre.id,
      ),

    supabase
      .from("impression_genres")
      .select(`
        impression_id
      `)
      .eq(
        "genre_id",
        genre.id,
      ),
  ])

  if (
    reviewRelationsResult.error
  ) {
    throw reviewRelationsResult.error
  }

  if (
    impressionRelationsResult.error
  ) {
    throw impressionRelationsResult.error
  }

  const reviewIds =
    Array.from(
      new Set(
        (
          reviewRelationsResult.data ??
          []
        ).map(
          (relation) =>
            Number(
              relation.review_id,
            ),
        ),
      ),
    )

  const impressionIds =
    Array.from(
      new Set(
        (
          impressionRelationsResult.data ??
          []
        ).map(
          (relation) =>
            Number(
              relation.impression_id,
            ),
        ),
      ),
    )

  const [
    reviewsResult,
    impressionsResult,
  ] = await Promise.all([
    reviewIds.length === 0
      ? Promise.resolve({
          data: [],
          error: null,
        })
      : supabase
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
              slug,

              manufacturers (
                id,
                name,
                slug
              )
            )
          `)
          .in(
            "id",
            reviewIds,
          )
          .eq(
            "published",
            true,
          )
          .order(
            "published_at",
            {
              ascending:
                false,
            },
          ),

    impressionIds.length ===
    0
      ? Promise.resolve({
          data: [],
          error: null,
        })
      : supabase
          .from("impressions")
          .select(`
            id,
            slug,
            title,
            summary,
            body,
            hero_image_url,
            published_at,

            reviewers (
              id,
              name,
              slug
            ),

            iems (
              id,
              model,
              slug,

              manufacturers (
                id,
                name,
                slug
              )
            )
          `)
          .in(
            "id",
            impressionIds,
          )
          .eq(
            "published",
            true,
          )
          .order(
            "published_at",
            {
              ascending:
                false,
            },
          ),
  ])

  if (
    reviewsResult.error
  ) {
    throw reviewsResult.error
  }

  if (
    impressionsResult.error
  ) {
    throw impressionsResult.error
  }

  const reviewRows =
    (reviewsResult.data ??
      []) as unknown as GenreDetailReviewRow[]

  const impressionRows =
    (impressionsResult.data ??
      []) as unknown as GenreDetailImpressionRow[]

  const mappedReviews =
    reviewRows.map(
      mapGenreReview,
    )

  const mappedImpressions =
    impressionRows.map(
      mapGenreImpression,
    )

  const iemMap =
    new Map<
      number,
      GenreIemSummary
    >()

  const reviewerMap =
    new Map<
      number,
      GenreReviewerSummary
    >()

  function addReviewCoverage(
    row: GenreDetailReviewRow,
  ) {
    const reviewer =
      getSingleRelation(
        row.reviewers,
      )

    const iem =
      getSingleRelation(
        row.iems,
      )

    const manufacturer =
      getSingleRelation(
        iem?.manufacturers,
      )

    if (
      !reviewer ||
      !iem ||
      !manufacturer
    ) {
      return
    }

    const iemId =
      Number(iem.id)

    const existingIem =
      iemMap.get(iemId)

    if (existingIem) {
      existingIem.reviewCount +=
        1

      existingIem.coverageCount +=
        1
    } else {
      iemMap.set(
        iemId,
        {
          id: iemId,
          model: iem.model,
          slug: iem.slug,

          manufacturerName:
            manufacturer.name,

          manufacturerSlug:
            manufacturer.slug,

          reviewCount: 1,
          impressionCount: 0,
          coverageCount: 1,
        },
      )
    }

    const reviewerId =
      Number(
        reviewer.id,
      )

    const existingReviewer =
      reviewerMap.get(
        reviewerId,
      )

    if (existingReviewer) {
      existingReviewer.reviewCount +=
        1

      existingReviewer.coverageCount +=
        1
    } else {
      reviewerMap.set(
        reviewerId,
        {
          id: reviewerId,
          name:
            reviewer.name,
          slug:
            reviewer.slug,

          reviewCount: 1,
          impressionCount: 0,
          coverageCount: 1,
        },
      )
    }
  }

  function addImpressionCoverage(
    row: GenreDetailImpressionRow,
  ) {
    const reviewer =
      getSingleRelation(
        row.reviewers,
      )

    const iem =
      getSingleRelation(
        row.iems,
      )

    const manufacturer =
      getSingleRelation(
        iem?.manufacturers,
      )

    if (
      !reviewer ||
      !iem ||
      !manufacturer
    ) {
      return
    }

    const iemId =
      Number(iem.id)

    const existingIem =
      iemMap.get(iemId)

    if (existingIem) {
      existingIem.impressionCount +=
        1

      existingIem.coverageCount +=
        1
    } else {
      iemMap.set(
        iemId,
        {
          id: iemId,
          model: iem.model,
          slug: iem.slug,

          manufacturerName:
            manufacturer.name,

          manufacturerSlug:
            manufacturer.slug,

          reviewCount: 0,
          impressionCount: 1,
          coverageCount: 1,
        },
      )
    }

    const reviewerId =
      Number(
        reviewer.id,
      )

    const existingReviewer =
      reviewerMap.get(
        reviewerId,
      )

    if (existingReviewer) {
      existingReviewer.impressionCount +=
        1

      existingReviewer.coverageCount +=
        1
    } else {
      reviewerMap.set(
        reviewerId,
        {
          id: reviewerId,
          name:
            reviewer.name,
          slug:
            reviewer.slug,

          reviewCount: 0,
          impressionCount: 1,
          coverageCount: 1,
        },
      )
    }
  }

  reviewRows.forEach(
    addReviewCoverage,
  )

  impressionRows.forEach(
    addImpressionCoverage,
  )

  const iems =
    Array.from(
      iemMap.values(),
    ).sort(
      (first, second) =>
        second.coverageCount -
          first.coverageCount ||
        first.model.localeCompare(
          second.model,
        ),
    )

  const reviewers =
    Array.from(
      reviewerMap.values(),
    ).sort(
      (first, second) =>
        second.coverageCount -
          first.coverageCount ||
        first.name.localeCompare(
          second.name,
        ),
    )

  const fullReviewReviewerCount =
    reviewers.filter(
      (reviewer) =>
        reviewer.reviewCount >
        0,
    ).length

  return {
    id: Number(
      genre.id,
    ),
    name: genre.name,
    slug: genre.slug,

    reviewCount:
      mappedReviews.length,

    impressionCount:
      mappedImpressions.length,

    coverageCount:
      mappedReviews.length +
      mappedImpressions.length,

    iemCount:
      iems.length,

    reviewerCount:
      fullReviewReviewerCount,

    contributorCount:
      reviewers.length,

    reviews:
      mappedReviews,

    impressions:
      mappedImpressions,

    iems,
    reviewers,
  }
}