import { supabase } from "./supabase"

import type {
  FeaturedReview,
} from "./reviews"

import type {
  IemDirectoryItem,
} from "./iems"

export type ManufacturerReviewer = {
  name: string
  slug: string
  reviewCount: number
}

export type ManufacturerProfile = {
  id: number
  name: string
  slug: string
  website: string | null

  heroImageUrl: string | null
  averageRating: number | null

  reviewCount: number
  reviewerCount: number

  reviewers: ManufacturerReviewer[]
  iems: IemDirectoryItem[]
  latestReviews: FeaturedReview[]
}

export type ManufacturerDirectoryItem = {
  id: number
  name: string
  slug: string
  iemCount: number
  reviewCount: number
}

type ManufacturerRow = {
  id: number
  name: string
  slug: string
  website: string | null
}

type ManufacturerReviewRow = {
  id: number
  slug: string
  rating: number
  title: string
  summary: string
  hero_image_url: string | null
  published_at: string | null

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

function mapFeaturedReview(
  row: ManufacturerReviewRow,
): FeaturedReview {
  const reviewer = getSingleRelation(
    row.reviewers,
  )

  const iem = getSingleRelation(
    row.iems,
  )

  const manufacturer = getSingleRelation(
    iem?.manufacturers,
  )

  if (!reviewer || !iem || !manufacturer) {
    throw new Error(
      `Review ${row.id} has incomplete manufacturer page data`,
    )
  }

  return {
    id: Number(row.id),
    slug: row.slug,
    rating: Number(row.rating),
    title: row.title,
    summary: row.summary,

    brand: manufacturer.name,
	manufacturerSlug: manufacturer.slug,
    model: iem.model,
    iemSlug: iem.slug,

    reviewer: reviewer.name,
    reviewerSlug: reviewer.slug,

    heroImageUrl: row.hero_image_url,
  }
}

function collectReviewers(
  rows: ManufacturerReviewRow[],
): ManufacturerReviewer[] {
  const reviewers =
    new Map<string, ManufacturerReviewer>()

  rows.forEach((row) => {
    const reviewer = getSingleRelation(
      row.reviewers,
    )

    if (!reviewer) {
      return
    }

    const existing =
      reviewers.get(reviewer.slug)

    if (existing) {
      existing.reviewCount += 1
      return
    }

    reviewers.set(reviewer.slug, {
      name: reviewer.name,
      slug: reviewer.slug,
      reviewCount: 1,
    })
  })

  return Array.from(
    reviewers.values(),
  ).sort((first, second) => {
    const countDifference =
      second.reviewCount - first.reviewCount

    if (countDifference !== 0) {
      return countDifference
    }

    return first.name.localeCompare(
      second.name,
    )
  })
}

function collectIems(
  rows: ManufacturerReviewRow[],
): IemDirectoryItem[] {
  const iems = new Map<
    number,
    {
      id: number
      model: string
      slug: string
      manufacturer: {
        id: number
        name: string
		slug: string
      }
      reviews: ManufacturerReviewRow[]
    }
  >()

  rows.forEach((row) => {
    const iem = getSingleRelation(row.iems)

    const manufacturer =
      getSingleRelation(
        iem?.manufacturers,
      )

    if (!iem || !manufacturer) {
      return
    }

    const existing = iems.get(
      Number(iem.id),
    )

    if (existing) {
      existing.reviews.push(row)
      return
    }

    iems.set(Number(iem.id), {
      id: Number(iem.id),
      model: iem.model,
      slug: iem.slug,

      manufacturer: {
        id: Number(manufacturer.id),
        name: manufacturer.name,
		slug: manufacturer.slug,
      },

      reviews: [row],
    })
  })

  return Array.from(iems.values())
    .map((iem) => {
      const sortedReviews = [
        ...iem.reviews,
      ].sort((first, second) => {
        const firstTime =
          first.published_at
            ? new Date(
                first.published_at,
              ).getTime()
            : 0

        const secondTime =
          second.published_at
            ? new Date(
                second.published_at,
              ).getTime()
            : 0

        return secondTime - firstTime
      })

      const reviewerSlugs =
        new Set<string>()

      sortedReviews.forEach((review) => {
        const reviewer =
          getSingleRelation(
            review.reviewers,
          )

        if (reviewer) {
          reviewerSlugs.add(
            reviewer.slug,
          )
        }
      })

      const ratingTotal =
        sortedReviews.reduce(
          (total, review) =>
            total +
            Number(review.rating),
          0,
        )

      return {
        id: iem.id,
        model: iem.model,
        slug: iem.slug,
        manufacturer: iem.manufacturer,

        heroImageUrl:
          sortedReviews.find(
            (review) =>
              review.hero_image_url !==
              null,
          )?.hero_image_url ?? null,

        reviewCount:
          sortedReviews.length,

        reviewerCount:
          reviewerSlugs.size,

        averageRating:
          sortedReviews.length === 0
            ? null
            : ratingTotal /
              sortedReviews.length,

        latestReviewAt:
          sortedReviews[0]
            ?.published_at ?? null,
      }
    })
    .sort((first, second) => {
      const reviewDifference =
        second.reviewCount -
        first.reviewCount

      if (reviewDifference !== 0) {
        return reviewDifference
      }

      return first.model.localeCompare(
        second.model,
      )
    })
}

function calculateAverageRating(
  reviews: FeaturedReview[],
): number | null {
  if (reviews.length === 0) {
    return null
  }

  const total = reviews.reduce(
    (sum, review) =>
      sum + review.rating,
    0,
  )

  return total / reviews.length
}

export async function getManufacturerBySlug(
  slug: string,
): Promise<ManufacturerProfile | null> {
  const normalizedSlug = slug.trim()

  if (!normalizedSlug) {
    return null
  }

  const {
    data: manufacturerData,
    error: manufacturerError,
  } = await supabase
    .from("manufacturers")
    .select(`
      id,
      name,
      slug,
      website
    `)
    .eq("slug", normalizedSlug)
    .maybeSingle()

  if (manufacturerError) {
    throw manufacturerError
  }

  if (!manufacturerData) {
    return null
  }

  const manufacturer =
    manufacturerData as ManufacturerRow

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
      published_at,

      reviewers (
        name,
        slug
      ),

      iems!inner (
        id,
        model,
        slug,

        manufacturers!inner (
          id,
          name,
		  slug
        )
      )
    `)
    .eq(
      "iems.manufacturer_id",
      Number(manufacturer.id),
    )
    .eq("published", true)
    .order("published_at", {
      ascending: false,
    })

  if (reviewError) {
    throw reviewError
  }

  const rows =
    (reviewData ??
      []) as unknown as ManufacturerReviewRow[]

  const reviews = rows.map(
    mapFeaturedReview,
  )

  const reviewers =
    collectReviewers(rows)

  const iems =
    collectIems(rows)

  const heroImageUrl =
    reviews.find(
      (review) =>
        review.heroImageUrl !== null,
    )?.heroImageUrl ?? null

  return {
    id: Number(manufacturer.id),
    name: manufacturer.name,
    slug: manufacturer.slug,
    website: manufacturer.website,

    heroImageUrl,
    averageRating:
      calculateAverageRating(reviews),

    reviewCount: reviews.length,
    reviewerCount:
      reviewers.length,

    reviewers,
    iems,

    latestReviews:
      reviews.slice(0, 6),
  }
}

export async function getManufacturers(): Promise<
  ManufacturerDirectoryItem[]
> {
  const { data, error } = await supabase
    .from("manufacturers")
    .select(`
      id,
      name,
      slug,

      iems (
        id,
        reviews (
          id,
          published
        )
      )
    `)

  if (error) {
    throw error
  }

  const rows = (data ?? []) as unknown as {
    id: number
    name: string
    slug: string

    iems:
      | {
          id: number
          reviews:
            | {
                id: number
                published: boolean
              }[]
            | null
        }[]
      | null
  }[]

  return rows
    .map((manufacturer) => {
      const iems = manufacturer.iems ?? []

      const reviewedIems = iems.filter((iem) =>
        (iem.reviews ?? []).some(
          (review) => review.published,
        ),
      )

      const reviewCount = reviewedIems.reduce(
        (total, iem) =>
          total +
          (iem.reviews ?? []).filter(
            (review) => review.published,
          ).length,
        0,
      )

      return {
        id: Number(manufacturer.id),
        name: manufacturer.name,
        slug: manufacturer.slug,
        iemCount: reviewedIems.length,
        reviewCount,
      }
    })
    .filter(
      (manufacturer) =>
        manufacturer.reviewCount > 0,
    )
    .sort((first, second) =>
      first.name.localeCompare(second.name),
    )
}