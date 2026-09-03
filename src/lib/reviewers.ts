import { supabase } from "./supabase"
import type { FeaturedReview } from "./reviews"
import {
  getImpressionsByReviewerId,
  type ImpressionSummary,
} from "./impressions"

export type ReviewerProfile = {
  id: number
  name: string
  slug: string
  active: boolean
  title: string
  avatarUrl: string | null
  country: string | null
  headfiUrl: string | null
  reviews: FeaturedReview[]
  impressions: ImpressionSummary[]
}

export type ReviewerSummary = {
  id: number
  name: string
  slug: string
  active: boolean
  title: string
  avatarUrl: string | null
  country: string | null
  reviewCount: number
  impressionCount: number
}

type ReviewerReviewRow = {
  id: number
  slug: string
  rating: number
  title: string
  summary: string

  hero_image_url:
    | string
    | null

  published_at:
    | string
    | null

  published: boolean
  reviewer_id: number
}

type ReviewerProductRow = {
  id: number
  model: string
  slug: string

  hero_image_url:
    | string
    | null

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

type ReviewerReviewProductRow = {
  review_id: number
  product_id: number

  reviews:
    | ReviewerReviewRow
    | ReviewerReviewRow[]
    | null

  products:
    | ReviewerProductRow
    | ReviewerProductRow[]
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

function mapReviewCoverage(
  row: ReviewerReviewProductRow,
): FeaturedReview {
  const review =
    getSingleRelation(
      row.reviews,
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
    !product ||
    !brand
  ) {
    throw new Error(
      `Review coverage ${row.review_id}/${row.product_id} has incomplete member data.`,
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

    reviewer: "",
    reviewerSlug: "",

    heroImageUrl:
      review.hero_image_url ??
      product.hero_image_url ??
      null,

    publishedAt:
      review.published_at,
  }
}

export function countryCodeToName(
  countryCode: string,
): string {
  const normalizedCode =
    countryCode.trim().toUpperCase()

  if (!normalizedCode) {
    return ""
  }

  try {
    const regionNames =
      new Intl.DisplayNames(
        ["en"],
        {
          type: "region",
        },
      )

    return (
      regionNames.of(normalizedCode) ??
      normalizedCode
    )
  } catch {
    return normalizedCode
  }
}

export async function getReviewers(): Promise<
  ReviewerSummary[]
> {
  const {
    data: reviewerRows,
    error: reviewerError,
  } = await supabase
    .from("reviewers")
    .select(`
      id,
      name,
      slug,
      active,
      title,
      avatar_url,
      country
    `)
    .order("name", {
      ascending: true,
    })

  if (reviewerError) {
    throw reviewerError
  }

  const [
    reviewCoverageResult,
    impressionsResult,
  ] = await Promise.all([
    supabase
      .from("review_products")
      .select(`
        review_id,

        reviews!inner (
          reviewer_id,
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
        reviewer_id
      `)
      .eq("published", true),
  ])

  if (reviewCoverageResult.error) {
    throw reviewCoverageResult.error
  }

  if (impressionsResult.error) {
    throw impressionsResult.error
  }

  const reviewCounts =
    new Map<number, number>()

  const impressionCounts =
    new Map<number, number>()

  for (
    const coverage of
    reviewCoverageResult.data ?? []
  ) {
    const review =
      getSingleRelation(
        coverage.reviews as
          | {
              reviewer_id: number
              published: boolean
            }
          | {
              reviewer_id: number
              published: boolean
            }[]
          | null,
      )

    if (!review) {
      continue
    }

    const reviewerId =
      Number(review.reviewer_id)

    reviewCounts.set(
      reviewerId,
      (reviewCounts.get(reviewerId) ?? 0) + 1,
    )
  }

  for (
    const impression of
    impressionsResult.data ?? []
  ) {
    const reviewerId =
      Number(impression.reviewer_id)

    impressionCounts.set(
      reviewerId,
      (impressionCounts.get(reviewerId) ?? 0) + 1,
    )
  }

  return (reviewerRows ?? []).map(
    (reviewer) => ({
      id: Number(reviewer.id),
      name: reviewer.name,
      slug: reviewer.slug,
      active: reviewer.active,
      title: reviewer.title,
      avatarUrl: reviewer.avatar_url,
      country: reviewer.country,

      reviewCount:
        reviewCounts.get(
          Number(reviewer.id),
        ) ?? 0,

      impressionCount:
        impressionCounts.get(
          Number(reviewer.id),
        ) ?? 0,
    }),
  )
}

export async function getReviewerBySlug(
  slug: string,
): Promise<ReviewerProfile | null> {
  const {
    data: reviewer,
    error,
  } = await supabase
    .from("reviewers")
    .select(`
      id,
      name,
      slug,
      active,
      title,
      avatar_url,
      country,
      headfi_url
    `)
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!reviewer) {
    return null
  }

  const {
    data: reviewCoverage,
    error: reviewsError,
  } = await supabase
    .from("review_products")
    .select(`
      review_id,
      product_id,

      products (
        id,
        model,
        slug,
        hero_image_url,

        brands (
          name,
          slug
        )
      ),

      reviews!inner (
        id,
        slug,
        rating,
        title,
        summary,
        hero_image_url,
        published_at,
        published,
        reviewer_id
      )
    `)
    .eq(
      "reviews.reviewer_id",
      reviewer.id,
    )
    .eq(
      "reviews.published",
      true,
    )

  if (reviewsError) {
    throw reviewsError
  }

  const reviews =
    (
      reviewCoverage ?? []
    )
      .map(
        (row) =>
          row as unknown as ReviewerReviewProductRow,
      )
      .sort(
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
      .map(
        (row) => ({
          ...mapReviewCoverage(
            row,
          ),

          reviewer:
            reviewer.name,

          reviewerSlug:
            reviewer.slug,
        }),
      )

  const impressions =
    await getImpressionsByReviewerId(
      Number(reviewer.id),
    )

  return {
    id: Number(reviewer.id),
    name: reviewer.name,
    slug: reviewer.slug,
    active: reviewer.active,
    title: reviewer.title,
    avatarUrl: reviewer.avatar_url,
    country: reviewer.country,
    headfiUrl: reviewer.headfi_url,

    reviews,
    impressions,
  }
}