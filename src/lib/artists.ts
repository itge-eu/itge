import { supabase } from "./supabase"

import type {
  FeaturedReview,
} from "./reviews"

import type {
  ImpressionSummary,
} from "./impressions"

export type ArtistSummary = {
  id: number
  musicbrainzId: string
  name: string
  slug: string
  country: string | null
  artistType: string | null

  reviewCount: number
  impressionCount: number
  coverageCount: number

  iemCount: number

  /*
   * Reviewers with at least one full review
   * referencing this artist.
   */
  reviewerCount: number

  /*
   * Unique people across reviews + impressions.
   */
  contributorCount: number
}

export type ArtistIemSummary = {
  id: number
  model: string
  slug: string

  manufacturerName: string
  manufacturerSlug: string

  reviewCount: number
  impressionCount: number
  coverageCount: number
}

export type ArtistReviewerSummary = {
  id: number
  name: string
  slug: string

  reviewCount: number
  impressionCount: number
  coverageCount: number
}

export type ArtistProfile =
  ArtistSummary & {
    reviews: FeaturedReview[]
    impressions: ImpressionSummary[]

    iems: ArtistIemSummary[]
    reviewers: ArtistReviewerSummary[]
  }

type ArtistRow = {
  id: number
  musicbrainz_id: string
  name: string
  slug: string
  country: string | null
  artist_type: string | null
}

type ReviewArtistRelationRow = {
  review_id: number
  artist_id: number
}

type ImpressionArtistRelationRow = {
  impression_id: number
  artist_id: number
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

type ArtistDetailReviewRow = {
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

type ArtistDetailImpressionRow = {
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
  relation: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation ?? null
}

function mapArtistReview(
  row: ArtistDetailReviewRow,
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
      `Review ${row.id} has incomplete artist data`,
    )
  }

  return {
    id: Number(row.id),
    slug: row.slug,
    rating: Number(row.rating),
    title: row.title,
    summary: row.summary,

    brand: manufacturer.name,
    manufacturerSlug:
      manufacturer.slug,

    model: iem.model,
    iemSlug: iem.slug,

    reviewer: reviewer.name,
    reviewerSlug:
      reviewer.slug,

    heroImageUrl:
      row.hero_image_url,
  }
}

function mapArtistImpression(
  row: ArtistDetailImpressionRow,
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
      `Impression ${row.id} has incomplete artist data`,
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
      id: Number(reviewer.id),
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

export async function getArtists(): Promise<
  ArtistSummary[]
> {
  const [
    artistsResult,
    reviewRelationsResult,
    impressionRelationsResult,
    reviewsResult,
    impressionsResult,
  ] = await Promise.all([
    supabase
      .from("artists")
      .select(`
        id,
        musicbrainz_id,
        name,
        slug,
        country,
        artist_type
      `)
      .order(
        "name",
        {
          ascending: true,
        },
      ),

    supabase
      .from("review_artists")
      .select(`
        review_id,
        artist_id
      `),

    supabase
      .from("impression_artists")
      .select(`
        impression_id,
        artist_id
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
    artistsResult.error ||
    reviewRelationsResult.error ||
    impressionRelationsResult.error ||
    reviewsResult.error ||
    impressionsResult.error

  if (firstError) {
    throw firstError
  }

  const artists =
    (artistsResult.data ??
      []) as ArtistRow[]

  const reviewRelations =
    (reviewRelationsResult.data ??
      []) as ReviewArtistRelationRow[]

  const impressionRelations =
    (impressionRelationsResult.data ??
      []) as ImpressionArtistRelationRow[]

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

  return artists
    .map((artist) => {
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
            relation.artist_id,
          ) ===
          Number(artist.id)
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
            relation.artist_id,
          ) ===
          Number(artist.id)
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
          review.iem_id != null
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
          artist.id,
        ),

        musicbrainzId:
          artist.musicbrainz_id,

        name: artist.name,
        slug: artist.slug,
        country:
          artist.country,

        artistType:
          artist.artist_type,

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
      (artist) =>
        artist.coverageCount >
        0,
    )
}

export async function getArtistBySlug(
  slug: string,
): Promise<ArtistProfile | null> {
  const {
    data: artist,
    error: artistError,
  } = await supabase
    .from("artists")
    .select(`
      id,
      musicbrainz_id,
      name,
      slug,
      country,
      artist_type
    `)
    .eq("slug", slug)
    .maybeSingle()

  if (artistError) {
    throw artistError
  }

  if (!artist) {
    return null
  }

  const [
    reviewRelationsResult,
    impressionRelationsResult,
  ] = await Promise.all([
    supabase
      .from("review_artists")
      .select(`
        review_id
      `)
      .eq(
        "artist_id",
        artist.id,
      ),

    supabase
      .from("impression_artists")
      .select(`
        impression_id
      `)
      .eq(
        "artist_id",
        artist.id,
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

    impressionIds.length === 0
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

  if (reviewsResult.error) {
    throw reviewsResult.error
  }

  if (
    impressionsResult.error
  ) {
    throw impressionsResult.error
  }

  const reviewRows =
    (reviewsResult.data ??
      []) as unknown as ArtistDetailReviewRow[]

  const impressionRows =
    (impressionsResult.data ??
      []) as unknown as ArtistDetailImpressionRow[]

  const mappedReviews =
    reviewRows.map(
      mapArtistReview,
    )

  const mappedImpressions =
    impressionRows.map(
      mapArtistImpression,
    )

  const iemMap =
    new Map<
      number,
      ArtistIemSummary
    >()

  const reviewerMap =
    new Map<
      number,
      ArtistReviewerSummary
    >()

  function addReviewCoverage(
    row: ArtistDetailReviewRow,
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
      Number(reviewer.id)

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
          name: reviewer.name,
          slug: reviewer.slug,

          reviewCount: 1,
          impressionCount: 0,
          coverageCount: 1,
        },
      )
    }
  }

  function addImpressionCoverage(
    row: ArtistDetailImpressionRow,
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
      Number(reviewer.id)

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
          name: reviewer.name,
          slug: reviewer.slug,

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
    id: Number(artist.id),

    musicbrainzId:
      artist.musicbrainz_id,

    name: artist.name,
    slug: artist.slug,
    country: artist.country,

    artistType:
      artist.artist_type,

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