import { supabase } from "./supabase"

import type {
  FeaturedReview,
} from "./reviews"

import type {
  ImpressionSummary,
} from "./impressions"

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

    sortOrder:
      Number(
        genre.sort_order,
      ),
  }))
}

export type GenreSummary = {
  id: number
  name: string
  slug: string

  reviewCount: number
  impressionCount: number
  coverageCount: number

  productCount: number
  reviewerCount: number
  contributorCount: number
}

export type GenreProductSummary = {
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
    impressions: ImpressionSummary[]

    products: GenreProductSummary[]
    reviewers: GenreReviewerSummary[]
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

type GenreDetailReviewRow = {
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

type GenreDetailProductRow = {
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

type GenreDetailReviewCoverageRow = {
  review_id: number
  product_id: number

  reviews:
    | GenreDetailReviewRow
    | GenreDetailReviewRow[]
    | null

  products:
    | GenreDetailProductRow
    | GenreDetailProductRow[]
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

  products:
    | GenreDetailProductRow
    | GenreDetailProductRow[]
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

function mapGenreReviewCoverage(
  row: GenreDetailReviewCoverageRow,
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
      `Review coverage ${row.review_id}/${row.product_id} has incomplete genre data`,
    )
  }

  return {
    id: Number(review.id),
    slug: review.slug,
    rating: Number(review.rating),
    title: review.title,
    summary: review.summary,

    brand:
      brand.name,

    brandSlug:
      brand.slug,

    model:
      product.model,

    productSlug:
      product.slug,

    reviewer:
      reviewer.name,

    reviewerSlug:
      reviewer.slug,

    heroImageUrl:
      review.hero_image_url ??
      product.hero_image_url ??
      null,

    publishedAt:
      review.published_at,
  }
}

function mapGenreImpression(
  row: GenreDetailImpressionRow,
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
      row.hero_image_url ??
      product.hero_image_url,

    publishedAt:
      row.published_at,

    reviewer: {
      id:
        Number(
          reviewer.id,
        ),

      name:
        reviewer.name,

      slug:
        reviewer.slug,
    },

    product: {
      id:
        Number(
          product.id,
        ),

      model:
        product.model,

      slug:
        product.slug,

      brand: {
        id:
          Number(
            brand.id,
          ),

        name:
          brand.name,

        slug:
          brand.slug,
      },
    },
  }
}

export async function getGenreDirectory(): Promise<
  GenreSummary[]
> {
  const [
    genresResult,
    reviewRelationsResult,
    impressionRelationsResult,
    reviewsResult,
    reviewCoverageResult,
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
    genresResult.error ||
    reviewRelationsResult.error ||
    impressionRelationsResult.error ||
    reviewsResult.error ||
    reviewCoverageResult.error ||
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

        impressionCount +=
          1

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
        id:
          Number(
            genre.id,
          ),

        name:
          genre.name,

        slug:
          genre.slug,

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
    ) as unknown as GenreDetailReviewCoverageRow[]

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
    ) as unknown as GenreDetailImpressionRow[]

  const mappedReviews =
    reviewRows.map(
      mapGenreReviewCoverage,
    )

  const mappedImpressions =
    impressionRows.map(
      mapGenreImpression,
    )

  const productMap =
    new Map<
      number,
      GenreProductSummary
    >()

  const reviewerMap =
    new Map<
      number,
      GenreReviewerSummary
    >()

  function addReviewCoverage(
    row: GenreDetailReviewCoverageRow,
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
      Number(
        product.id,
      )

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
          id:
            productId,

          model:
            product.model,

          slug:
            product.slug,

          heroImageUrl:
            product.hero_image_url,

          brandName:
            brand.name,

          brandSlug:
            brand.slug,

          reviewCount:
            1,

          impressionCount:
            0,

          coverageCount:
            1,
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
          id:
            reviewerId,

          name:
            reviewer.name,

          slug:
            reviewer.slug,

          reviewCount:
            1,

          impressionCount:
            0,

          coverageCount:
            1,
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
      Number(
        product.id,
      )

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
          id:
            productId,

          model:
            product.model,

          slug:
            product.slug,

          heroImageUrl:
            product.hero_image_url,

          brandName:
            brand.name,

          brandSlug:
            brand.slug,

          reviewCount:
            0,

          impressionCount:
            1,

          coverageCount:
            1,
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
          id:
            reviewerId,

          name:
            reviewer.name,

          slug:
            reviewer.slug,

          reviewCount:
            0,

          impressionCount:
            1,

          coverageCount:
            1,
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
    id:
      Number(
        genre.id,
      ),

    name:
      genre.name,

    slug:
      genre.slug,

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