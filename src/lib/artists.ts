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
  imageUrl: string | null

  reviewCount: number
  impressionCount: number
  coverageCount: number

  productCount: number
  reviewerCount: number
  contributorCount: number
}

export type ArtistProductSummary = {
  id: number
  model: string
  slug: string
  heroImageUrl: string | null

  brandName: string
  brandSlug: string

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

    products: ArtistProductSummary[]
    reviewers: ArtistReviewerSummary[]
  }

type ArtistRow = {
  id: number
  musicbrainz_id: string
  name: string
  slug: string
  country: string | null
  artist_type: string | null
  image_url: string | null
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
  reviewer_id: number | null
}

type PublishedReviewCoverageRow = {
  review_id: number
  product_id: number
}

type PublishedImpressionRow = {
  id: number
  product_id: number | null
  reviewer_id: number | null
}

type ArtistDetailReviewRow = {
  id: number
  slug: string
  rating: number
  title: string
  summary: string
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
}

type ArtistDetailProductRow = {
  id: number
  model: string
  slug: string
  hero_image_url: string | null

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

type ArtistDetailReviewCoverageRow = {
  review_id: number
  product_id: number

  reviews:
    | ArtistDetailReviewRow
    | ArtistDetailReviewRow[]
    | null

  products:
    | ArtistDetailProductRow
    | ArtistDetailProductRow[]
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

  products:
    | ArtistDetailProductRow
    | ArtistDetailProductRow[]
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

function mapArtistReviewCoverage(
  row: ArtistDetailReviewCoverageRow,
): FeaturedReview {
  const review =
    getSingleRelation(
      row.reviews,
    )

  const product =
    getSingleRelation(
      row.products,
    )

  const reviewer =
    getSingleRelation(
      review?.reviewers,
    )

  const brand =
    getSingleRelation(
      product?.brands,
    )

  if (
    !review ||
    !reviewer ||
    !product ||
    !brand
  ) {
    throw new Error(
      `Review coverage ${row.review_id}/${row.product_id} has incomplete artist data`,
    )
  }

  return {
    id: Number(review.id),
    slug: review.slug,
    rating: Number(review.rating),
    title: review.title,
    summary: review.summary,

    brand: brand.name,
    brandSlug: brand.slug,

    model: product.model,
    productSlug: product.slug,

    reviewer: reviewer.name,
    reviewerSlug: reviewer.slug,

    heroImageUrl:
      review.hero_image_url ??
      product.hero_image_url ??
      null,

    publishedAt:
      review.published_at,
  }
}

function mapArtistImpression(
  row: ArtistDetailImpressionRow,
): ImpressionSummary {
  const reviewer =
    getSingleRelation(
      row.reviewers,
    )

  const product =
    getSingleRelation(
      row.products,
    )

  const brand =
    getSingleRelation(
      product?.brands,
    )

  if (
    !reviewer ||
    !product ||
    !brand
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
      row.hero_image_url ??
      product.hero_image_url,

    publishedAt:
      row.published_at,

    reviewer: {
      id: Number(reviewer.id),
      name: reviewer.name,
      slug: reviewer.slug,
    },

    product: {
      id: Number(product.id),
      model: product.model,
      slug: product.slug,

      brand: {
        id: Number(brand.id),
        name: brand.name,
        slug: brand.slug,
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
    reviewCoverageResult,
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
        artist_type,
        image_url
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
        reviewer_id
      `)
      .eq(
        "published",
        true,
      ),

    supabase
      .from("review_products")
      .select(`
        review_id,
        product_id,

        reviews!inner (
          published
        )
      `)
      .eq(
        "reviews.published",
        true,
      ),

    supabase
      .from("impressions")
      .select(`
        id,
        product_id,
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
    reviewCoverageResult.error ||
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

  const publishedReviewCoverage =
    (reviewCoverageResult.data ??
      []) as unknown as PublishedReviewCoverageRow[]

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

  const reviewCoverageMap =
    new Map<
      number,
      number[]
    >()

  for (
    const coverage of
    publishedReviewCoverage
  ) {
    const reviewId =
      Number(
        coverage.review_id,
      )

    const productId =
      Number(
        coverage.product_id,
      )

    const productIds =
      reviewCoverageMap.get(
        reviewId,
      ) ?? []

    productIds.push(
      productId,
    )

    reviewCoverageMap.set(
      reviewId,
      productIds,
    )
  }

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

      const productIds =
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

        const coveredProductIds =
          reviewCoverageMap.get(
            reviewId,
          ) ?? []

        reviewCount +=
          coveredProductIds.length

        for (
          const productId of
          coveredProductIds
        ) {
          productIds.add(
            productId,
          )
        }

        if (
          review.reviewer_id !=
          null &&
          coveredProductIds.length >
            0
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
          impression.product_id !=
          null
        ) {
          productIds.add(
            Number(
              impression.product_id,
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

        imageUrl:
          artist.image_url,

        reviewCount,

        impressionCount,

        coverageCount:
          reviewCount +
          impressionCount,

        productCount:
          productIds.size,

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
      artist_type,
      image_url
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
    reviewCoverageResult,
    impressionsResult,
  ] = await Promise.all([
    reviewIds.length === 0
      ? Promise.resolve({
          data: [],
          error: null,
        })
      : supabase
          .from(
            "review_products",
          )
          .select(`
            review_id,
            product_id,

            reviews!inner (
              id,
              slug,
              rating,
              title,
              summary,
              hero_image_url,
              published_at,
              published,

              reviewers (
                id,
                name,
                slug
              )
            ),

            products (
              id,
              model,
              slug,
              hero_image_url,

              brands (
                id,
                name,
                slug
              )
            )
          `)
          .in(
            "review_id",
            reviewIds,
          )
          .eq(
            "reviews.published",
            true,
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

            products (
              id,
              model,
              slug,
              hero_image_url,

              brands (
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
    reviewCoverageResult.error
  ) {
    throw reviewCoverageResult.error
  }

  if (
    impressionsResult.error
  ) {
    throw impressionsResult.error
  }

  const reviewRows =
    (
      reviewCoverageResult.data ??
      []
    ) as unknown as ArtistDetailReviewCoverageRow[]

  reviewRows.sort(
    (first, second) => {
      const firstReview =
        getSingleRelation(
          first.reviews,
        )

      const secondReview =
        getSingleRelation(
          second.reviews,
        )

      return (
        timestampValue(
          secondReview?.published_at ??
            null,
        ) -
        timestampValue(
          firstReview?.published_at ??
            null,
        )
      )
    },
  )

  const impressionRows =
    (
      impressionsResult.data ??
      []
    ) as unknown as ArtistDetailImpressionRow[]

  const mappedReviews =
    reviewRows.map(
      mapArtistReviewCoverage,
    )

  const mappedImpressions =
    impressionRows.map(
      mapArtistImpression,
    )

  const productMap =
    new Map<
      number,
      ArtistProductSummary
    >()

  const reviewerMap =
    new Map<
      number,
      ArtistReviewerSummary
    >()

  function addReviewCoverage(
    row: ArtistDetailReviewCoverageRow,
  ) {
    const review =
      getSingleRelation(
        row.reviews,
      )

    const reviewer =
      getSingleRelation(
        review?.reviewers,
      )

    const product =
      getSingleRelation(
        row.products,
      )

    const brand =
      getSingleRelation(
        product?.brands,
      )

    if (
      !review ||
      !reviewer ||
      !product ||
      !brand
    ) {
      return
    }

    const productId =
      Number(product.id)

    const existingProduct =
      productMap.get(
        productId,
      )

    if (existingProduct) {
      existingProduct.reviewCount +=
        1

      existingProduct.coverageCount +=
        1
    } else {
      productMap.set(
        productId,
        {
          id: productId,
          model: product.model,
          slug: product.slug,

          heroImageUrl:
            product.hero_image_url,

          brandName:
            brand.name,

          brandSlug:
            brand.slug,

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
    row: ArtistDetailImpressionRow,
  ) {
    const reviewer =
      getSingleRelation(
        row.reviewers,
      )

    const product =
      getSingleRelation(
        row.products,
      )

    const brand =
      getSingleRelation(
        product?.brands,
      )

    if (
      !reviewer ||
      !product ||
      !brand
    ) {
      return
    }

    const productId =
      Number(product.id)

    const existingProduct =
      productMap.get(
        productId,
      )

    if (existingProduct) {
      existingProduct.impressionCount +=
        1

      existingProduct.coverageCount +=
        1
    } else {
      productMap.set(
        productId,
        {
          id: productId,
          model: product.model,
          slug: product.slug,

          heroImageUrl:
            product.hero_image_url,

          brandName:
            brand.name,

          brandSlug:
            brand.slug,

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

  const products =
    Array.from(
      productMap.values(),
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
      artist.id,
    ),

    musicbrainzId:
      artist.musicbrainz_id,

    name:
      artist.name,

    slug:
      artist.slug,

    country:
      artist.country,

    artistType:
      artist.artist_type,

    imageUrl:
      artist.image_url,

    reviewCount:
      mappedReviews.length,

    impressionCount:
      mappedImpressions.length,

    coverageCount:
      mappedReviews.length +
      mappedImpressions.length,

    productCount:
      products.length,

    reviewerCount:
      fullReviewReviewerCount,

    contributorCount:
      reviewers.length,

    reviews:
      mappedReviews,

    impressions:
      mappedImpressions,

    products,
    reviewers,
  }
}