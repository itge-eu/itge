import { supabase } from "./supabase"

import type {
  FeaturedReview,
  ReviewArtist,
  ReviewGenre,
} from "./reviews"

import {
  getImpressionsByIemId,
  type ImpressionSummary,
} from "./impressions"

export type IemReviewer = {
  name: string
  slug: string
  reviewCount: number
}

export type IemDirectoryItem = {
  id: number
  model: string
  slug: string

  brand: {
    id: number
    name: string
    slug: string
  }

  heroImageUrl: string | null

  reviewCount: number
  reviewerCount: number
  averageRating: number | null
  latestReviewAt: string | null

  /*
   * Impression-aware directory fields.
   *
   * Optional temporarily because brands.ts
   * still constructs the older review-only shape.
   * We'll make these required again when brand
   * integration is updated next.
   */
  impressionCount?: number
  coverageCount?: number
  contributorCount?: number
  latestActivityAt?: string | null
}

export type IemProfile = {
  id: number
  model: string
  slug: string

  brand: {
    id: number
    name: string
    slug: string
  }

  releaseYear: number | null
  driverConfiguration: string | null
  launchPrice: number | null
  launchCurrency: string | null

  averageRating: number | null
  heroImageUrl: string | null

  reviewers: IemReviewer[]
  artists: ReviewArtist[]
  genres: ReviewGenre[]
  reviews: FeaturedReview[]
  impressions: ImpressionSummary[]
}

type IemRow = {
  id: number
  model: string
  slug: string

  release_year: number | null
  driver_configuration: string | null
  launch_price: string | number | null
  launch_currency: string | null

  brands:
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

type IemDirectoryReviewRow = {
  id: number
  rating: number
  hero_image_url: string | null
  published_at: string | null

  reviewers:
    | {
        slug: string
      }
    | {
        slug: string
      }[]
    | null
}

type IemDirectoryImpressionRow = {
  id: number
  hero_image_url: string | null
  published_at: string | null

  reviewers:
    | {
        slug: string
      }
    | {
        slug: string
      }[]
    | null
}

type IemDirectoryRow = {
  id: number
  model: string
  slug: string

  brands:
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

  reviews:
    | IemDirectoryReviewRow[]
    | null

  impressions:
    | IemDirectoryImpressionRow[]
    | null
}

type ReviewArtistRelationRow = {
  artists:
    | {
        id: number
        musicbrainz_id: string
        name: string
        slug: string
      }
    | {
        id: number
        musicbrainz_id: string
        name: string
        slug: string
      }[]
    | null
}

type ReviewGenreRelationRow = {
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

type IemReviewRow = {
  id: number
  slug: string
  rating: number
  title: string
  summary: string
  hero_image_url: string | null

  reviewers:
    | {
        name: string
        slug: string
      }
    | {
        name: string
        slug: string
      }[]
    | null

  iems:
    | {
        model: string
        slug: string

        brands:
          | {
              name: string
              slug: string
            }
          | {
              name: string
              slug: string
            }[]
          | null
      }
    | {
        model: string
        slug: string

        brands:
          | {
              name: string
              slug: string
            }
          | {
              name: string
              slug: string
            }[]
          | null
      }[]
    | null

  review_artists?:
    | ReviewArtistRelationRow[]
    | null

  review_genres?:
    | ReviewGenreRelationRow[]
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

function mapFeaturedReview(
  row: IemReviewRow,
): FeaturedReview {
  const reviewer =
    getSingleRelation(row.reviewers)

  const iem =
    getSingleRelation(row.iems)

  const brand =
    getSingleRelation(
      iem?.brands,
    )

  if (
    !reviewer ||
    !iem ||
    !brand
  ) {
    throw new Error(
      `Review ${row.id} has incomplete IEM page data`,
    )
  }

  return {
    id: Number(row.id),
    slug: row.slug,
    rating: Number(row.rating),
    title: row.title,
    summary: row.summary,

    brand: brand.name,
    brandSlug:
      brand.slug,

    model: iem.model,
    iemSlug: iem.slug,

    reviewer: reviewer.name,
    reviewerSlug: reviewer.slug,

    heroImageUrl:
      row.hero_image_url,
  }
}

function collectReviewers(
  rows: IemReviewRow[],
): IemReviewer[] {
  const reviewers =
    new Map<string, IemReviewer>()

  rows.forEach((row) => {
    const reviewer =
      getSingleRelation(
        row.reviewers,
      )

    if (!reviewer) {
      return
    }

    const existing =
      reviewers.get(
        reviewer.slug,
      )

    if (existing) {
      existing.reviewCount += 1
      return
    }

    reviewers.set(
      reviewer.slug,
      {
        name: reviewer.name,
        slug: reviewer.slug,
        reviewCount: 1,
      },
    )
  })

  return Array.from(
    reviewers.values(),
  ).sort(
    (first, second) => {
      const countDifference =
        second.reviewCount -
        first.reviewCount

      if (
        countDifference !== 0
      ) {
        return countDifference
      }

      return first.name.localeCompare(
        second.name,
      )
    },
  )
}

function collectArtists(
  rows: IemReviewRow[],
): ReviewArtist[] {
  const artists =
    new Map<
      number,
      ReviewArtist
    >()

  rows.forEach((row) => {
    ;(
      row.review_artists ?? []
    ).forEach((relation) => {
      const artist =
        getSingleRelation(
          relation.artists,
        )

      if (
        !artist ||
        artists.has(
          Number(artist.id),
        )
      ) {
        return
      }

      artists.set(
        Number(artist.id),
        {
          id: Number(
            artist.id,
          ),
          musicbrainzId:
            artist.musicbrainz_id,
          name: artist.name,
          slug: artist.slug,
        },
      )
    })
  })

  return Array.from(
    artists.values(),
  ).sort(
    (first, second) =>
      first.name.localeCompare(
        second.name,
      ),
  )
}

function collectGenres(
  rows: IemReviewRow[],
): ReviewGenre[] {
  const genres =
    new Map<
      number,
      ReviewGenre
    >()

  rows.forEach((row) => {
    ;(
      row.review_genres ?? []
    ).forEach((relation) => {
      const genre =
        getSingleRelation(
          relation.genres,
        )

      if (
        !genre ||
        genres.has(
          Number(genre.id),
        )
      ) {
        return
      }

      genres.set(
        Number(genre.id),
        {
          id: Number(
            genre.id,
          ),
          name: genre.name,
          slug: genre.slug,
        },
      )
    })
  })

  return Array.from(
    genres.values(),
  ).sort(
    (first, second) =>
      first.name.localeCompare(
        second.name,
      ),
  )
}

function calculateAverageRating(
  reviews: FeaturedReview[],
): number | null {
  if (
    reviews.length === 0
  ) {
    return null
  }

  const total =
    reviews.reduce(
      (sum, review) =>
        sum + review.rating,
      0,
    )

  return (
    total /
    reviews.length
  )
}

function timestampValue(
  value: string | null,
): number {
  if (!value) {
    return 0
  }

  const time =
    new Date(value).getTime()

  return Number.isNaN(time)
    ? 0
    : time
}

export async function getIemBySlug(
  slug: string,
): Promise<IemProfile | null> {
  const normalizedSlug =
    slug.trim()

  if (!normalizedSlug) {
    return null
  }

  const {
    data: iemData,
    error: iemError,
  } = await supabase
    .from("iems")
    .select(`
      id,
      model,
      slug,
      release_year,
      driver_configuration,
      launch_price,
      launch_currency,

      brands (
        id,
        name,
        slug
      )
    `)
    .eq(
      "slug",
      normalizedSlug,
    )
    .maybeSingle()

  if (iemError) {
    throw iemError
  }

  if (!iemData) {
    return null
  }

  const iem =
    iemData as unknown as IemRow

  const brand =
    getSingleRelation(
      iem.brands,
    )

  if (!brand) {
    throw new Error(
      `IEM ${iem.id} has no associated brand`,
    )
  }

  const {
    data: reviewData,
    error: reviewError,
  } = await supabase
    .from("reviews")
    .select(`
      id,
      slug,
      rating,
      title,
      summary,
      hero_image_url,

      reviewers (
        name,
        slug
      ),

      iems (
        model,
        slug,

        brands (
          name,
          slug
        )
      ),

      review_artists (
        artists (
          id,
          musicbrainz_id,
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
    .eq(
      "iem_id",
      Number(iem.id),
    )
    .eq(
      "published",
      true,
    )
    .order(
      "published_at",
      {
        ascending: false,
      },
    )

  if (reviewError) {
    throw reviewError
  }

  const rows =
    (reviewData ??
      []) as unknown as IemReviewRow[]

  const reviews =
    rows.map(
      mapFeaturedReview,
    )

  const impressions =
    await getImpressionsByIemId(
      Number(iem.id),
    )

  const heroImageUrl =
    reviews.find(
      (review) =>
        review.heroImageUrl !==
        null,
    )?.heroImageUrl ??
    impressions.find(
      (impression) =>
        impression.heroImageUrl !==
        null,
    )?.heroImageUrl ??
    null

  return {
    id: Number(iem.id),
    model: iem.model,
    slug: iem.slug,

    brand: {
      id: Number(
        brand.id,
      ),
      name: brand.name,
      slug: brand.slug,
    },

    releaseYear:
      iem.release_year ==
      null
        ? null
        : Number(
            iem.release_year,
          ),

    driverConfiguration:
      iem.driver_configuration,

    launchPrice:
      iem.launch_price ==
      null
        ? null
        : Number(
            iem.launch_price,
          ),

    launchCurrency:
      iem.launch_currency,

    averageRating:
      calculateAverageRating(
        reviews,
      ),

    heroImageUrl,

    reviewers:
      collectReviewers(rows),

    artists:
      collectArtists(rows),

    genres:
      collectGenres(rows),

    reviews,
    impressions,
  }
}

export async function getIems(): Promise<
  IemDirectoryItem[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("iems")
    .select(`
      id,
      model,
      slug,

      brands (
        id,
        name,
        slug
      ),

      reviews (
        id,
        rating,
        hero_image_url,
        published_at,

        reviewers (
          slug
        )
      ),

      impressions (
        id,
        hero_image_url,
        published_at,

        reviewers (
          slug
        )
      )
    `)
    .eq(
      "reviews.published",
      true,
    )
    .eq(
      "impressions.published",
      true,
    )

  if (error) {
    throw error
  }

  const rows =
    (data ??
      []) as unknown as IemDirectoryRow[]

  return rows.flatMap(
    (row) => {
      const brand =
        getSingleRelation(
          row.brands,
        )

      if (!brand) {
        return []
      }

      const reviews = [
        ...(row.reviews ??
          []),
      ].sort(
        (first, second) =>
          timestampValue(
            second.published_at,
          ) -
          timestampValue(
            first.published_at,
          ),
      )

      const impressions = [
        ...(row.impressions ??
          []),
      ].sort(
        (first, second) =>
          timestampValue(
            second.published_at,
          ) -
          timestampValue(
            first.published_at,
          ),
      )

      /*
       * Directory should only contain
       * IEMs represented by actual
       * published ITGE content.
       */
      if (
        reviews.length === 0 &&
        impressions.length ===
          0
      ) {
        return []
      }

      const reviewReviewerSlugs =
        new Set<string>()

      const contributorSlugs =
        new Set<string>()

      reviews.forEach(
        (review) => {
          const reviewer =
            getSingleRelation(
              review.reviewers,
            )

          if (!reviewer) {
            return
          }

          reviewReviewerSlugs.add(
            reviewer.slug,
          )

          contributorSlugs.add(
            reviewer.slug,
          )
        },
      )

      impressions.forEach(
        (impression) => {
          const reviewer =
            getSingleRelation(
              impression.reviewers,
            )

          if (!reviewer) {
            return
          }

          contributorSlugs.add(
            reviewer.slug,
          )
        },
      )

      const ratingTotal =
        reviews.reduce(
          (
            total,
            review,
          ) =>
            total +
            Number(
              review.rating,
            ),
          0,
        )

      const averageRating =
        reviews.length === 0
          ? null
          : ratingTotal /
            reviews.length

      const latestReviewAt =
        reviews[0]
          ?.published_at ??
        null

      const latestImpressionAt =
        impressions[0]
          ?.published_at ??
        null

      const latestActivityAt =
        timestampValue(
          latestReviewAt,
        ) >=
        timestampValue(
          latestImpressionAt,
        )
          ? latestReviewAt
          : latestImpressionAt

      const heroImageUrl =
        reviews.find(
          (review) =>
            review.hero_image_url !==
            null,
        )?.hero_image_url ??
        impressions.find(
          (impression) =>
            impression.hero_image_url !==
            null,
        )?.hero_image_url ??
        null

      return [
        {
          id: Number(
            row.id,
          ),

          model: row.model,
          slug: row.slug,

          brand: {
            id: Number(
              brand.id,
            ),
            name:
              brand.name,
            slug:
              brand.slug,
          },

          heroImageUrl,

          reviewCount:
            reviews.length,

          impressionCount:
            impressions.length,

          coverageCount:
            reviews.length +
            impressions.length,

          reviewerCount:
            reviewReviewerSlugs.size,

          contributorCount:
            contributorSlugs.size,

          averageRating,

          latestReviewAt,

          latestActivityAt,
        },
      ]
    },
  )
}