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
  bio: string | null
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
  bio: string | null
  avatarUrl: string | null
  country: string | null
  reviewCount: number
  impressionCount: number
}

type ReviewRow = {
  id: number
  slug: string
  rating: number
  title: string
  summary: string
  hero_image_url: string | null

  iems:
    | {
        model: string
        slug: string

        manufacturers:
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

        manufacturers:
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
}

function getSingleRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation ?? null
}

function mapReview(
  row: ReviewRow,
): FeaturedReview {
  const iem = getSingleRelation(row.iems)

  const manufacturer = getSingleRelation(
    iem?.manufacturers,
  )

  if (!iem || !manufacturer) {
    throw new Error(
      `Review ${row.id} has incomplete data.`,
    )
  }

  return {
    id: row.id,
    slug: row.slug,
    rating: Number(row.rating),
    title: row.title,
    summary: row.summary,
    brand: manufacturer.name,
    manufacturerSlug: manufacturer.slug,
    model: iem.model,
    iemSlug: iem.slug,
    reviewer: "",
    reviewerSlug: "",
    heroImageUrl: row.hero_image_url,
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
      bio,
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
    reviewsResult,
    impressionsResult,
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select(`
        id,
        reviewer_id
      `)
      .eq("published", true),

    supabase
      .from("impressions")
      .select(`
        id,
        reviewer_id
      `)
      .eq("published", true),
  ])

  if (reviewsResult.error) {
    throw reviewsResult.error
  }

  if (impressionsResult.error) {
    throw impressionsResult.error
  }

  const reviewCounts =
    new Map<number, number>()

  const impressionCounts =
    new Map<number, number>()

  for (const review of reviewsResult.data ?? []) {
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
      bio: reviewer.bio,
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
      bio,
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
    data: reviews,
    error: reviewsError,
  } = await supabase
    .from("reviews")
    .select(`
      id,
      slug,
      rating,
      title,
      summary,
      hero_image_url,

      iems (
        model,
        slug,

        manufacturers (
          name,
          slug
        )
      )
    `)
    .eq(
      "reviewer_id",
      reviewer.id,
    )
    .eq("published", true)
    .order("published_at", {
      ascending: false,
    })

  if (reviewsError) {
    throw reviewsError
  }

  const impressions =
    await getImpressionsByReviewerId(
      Number(reviewer.id),
    )

  return {
    id: Number(reviewer.id),
    name: reviewer.name,
    slug: reviewer.slug,
    active: reviewer.active,
    bio: reviewer.bio,
    avatarUrl: reviewer.avatar_url,
    country: reviewer.country,
    headfiUrl: reviewer.headfi_url,

    reviews: (reviews ?? []).map(
      (review) => ({
        ...mapReview(
          review as unknown as ReviewRow,
        ),
        reviewer: reviewer.name,
        reviewerSlug: reviewer.slug,
      }),
    ),

    impressions,
  }
}