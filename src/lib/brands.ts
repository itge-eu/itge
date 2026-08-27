import { supabase } from "./supabase"

import type {
  FeaturedReview,
} from "./reviews"

import type {
  ImpressionSummary,
} from "./impressions"

import type {
  ProductDirectoryItem,
} from "./products"

export type BrandContributor = {
  name: string
  slug: string
  reviewCount: number
  impressionCount: number
  coverageCount: number
}

export type BrandProfile = {
  id: number
  name: string
  slug: string
  website: string | null

  heroImageUrl: string | null
  averageRating: number | null

  reviewCount: number
  impressionCount: number
  coverageCount: number
  contributorCount: number

  contributors: BrandContributor[]
  products: ProductDirectoryItem[]

  latestReviews: FeaturedReview[]
  latestImpressions: ImpressionSummary[]
}

export type BrandDirectoryItem = {
  id: number
  name: string
  slug: string

  productCount: number
  reviewCount: number
  impressionCount: number
  coverageCount: number
}

type BrandRow = {
  id: number
  name: string
  slug: string
  website: string | null
}

type BrandReviewRow = {
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

  products:
    | {
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
      }
    | {
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
      }[]
    | null
}

type BrandImpressionRow = {
  id: number
  slug: string
  title: string
  summary: string | null
  body: string | null
  hero_image_url: string | null
  published_at: string | null
  source_url: string | null

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
    | {
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
      }
    | {
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

function mapFeaturedReview(
  row: BrandReviewRow,
): FeaturedReview {
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
      `Review ${row.id} has incomplete brand page data`,
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

    model: product.model,
    productSlug: product.slug,

    reviewer: reviewer.name,
    reviewerSlug:
      reviewer.slug,

    heroImageUrl:
      row.hero_image_url,
  }
}

function mapImpression(
  row: BrandImpressionRow,
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
      `Impression ${row.id} has incomplete brand page data`,
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

function collectContributors(
  reviewRows: BrandReviewRow[],
  impressionRows: BrandImpressionRow[],
): BrandContributor[] {
  const contributors =
    new Map<
      string,
      BrandContributor
    >()

  reviewRows.forEach((row) => {
    const reviewer =
      getSingleRelation(
        row.reviewers,
      )

    if (!reviewer) {
      return
    }

    const existing =
      contributors.get(
        reviewer.slug,
      )

    if (existing) {
      existing.reviewCount += 1
      existing.coverageCount += 1
      return
    }

    contributors.set(
      reviewer.slug,
      {
        name: reviewer.name,
        slug: reviewer.slug,
        reviewCount: 1,
        impressionCount: 0,
        coverageCount: 1,
      },
    )
  })

  impressionRows.forEach(
    (row) => {
      const reviewer =
        getSingleRelation(
          row.reviewers,
        )

      if (!reviewer) {
        return
      }

      const existing =
        contributors.get(
          reviewer.slug,
        )

      if (existing) {
        existing.impressionCount +=
          1
        existing.coverageCount += 1
        return
      }

      contributors.set(
        reviewer.slug,
        {
          name: reviewer.name,
          slug: reviewer.slug,
          reviewCount: 0,
          impressionCount: 1,
          coverageCount: 1,
        },
      )
    },
  )

  return Array.from(
    contributors.values(),
  ).sort(
    (first, second) => {
      const coverageDifference =
        second.coverageCount -
        first.coverageCount

      if (
        coverageDifference !== 0
      ) {
        return coverageDifference
      }

      return first.name.localeCompare(
        second.name,
      )
    },
  )
}

function collectProducts(
  reviewRows: BrandReviewRow[],
  impressionRows: BrandImpressionRow[],
): ProductDirectoryItem[] {
  type CollectedProduct = {
    id: number
    model: string
    slug: string

    brand: {
      id: number
      name: string
      slug: string
    }

    reviews: BrandReviewRow[]
    impressions: BrandImpressionRow[]
  }

  const products =
    new Map<
      number,
      CollectedProduct
    >()

  function ensureProduct(
    product: {
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
    },
  ): CollectedProduct | null {
    const brand =
      getSingleRelation(
        product.brands,
      )

    if (!brand) {
      return null
    }

    const id =
      Number(product.id)

    const existing =
      products.get(id)

    if (existing) {
      return existing
    }

    const created: CollectedProduct =
      {
        id,
        model: product.model,
        slug: product.slug,

        brand: {
          id: Number(
            brand.id,
          ),
          name:
            brand.name,
          slug:
            brand.slug,
        },

        reviews: [],
        impressions: [],
      }

    products.set(id, created)

    return created
  }

  reviewRows.forEach((row) => {
    const product =
      getSingleRelation(
        row.products,
      )

    if (!product) {
      return
    }

    ensureProduct(product)?.reviews.push(
      row,
    )
  })

  impressionRows.forEach(
    (row) => {
      const product =
        getSingleRelation(
          row.products,
        )

      if (!product) {
        return
      }

      ensureProduct(
        product,
      )?.impressions.push(
        row,
      )
    },
  )

  return Array.from(
    products.values(),
  )
    .map((product) => {
      const sortedReviews = [
        ...product.reviews,
      ].sort(
        (first, second) =>
          timestampValue(
            second.published_at,
          ) -
          timestampValue(
            first.published_at,
          ),
      )

      const sortedImpressions = [
        ...product.impressions,
      ].sort(
        (first, second) =>
          timestampValue(
            second.published_at,
          ) -
          timestampValue(
            first.published_at,
          ),
      )

      const reviewReviewerSlugs =
        new Set<string>()

      const contributorSlugs =
        new Set<string>()

      sortedReviews.forEach(
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

      sortedImpressions.forEach(
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
        sortedReviews.reduce(
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

      const latestReviewAt =
        sortedReviews[0]
          ?.published_at ??
        null

      const latestImpressionAt =
        sortedImpressions[0]
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
        sortedReviews.find(
          (review) =>
            review.hero_image_url !==
            null,
        )?.hero_image_url ??
        sortedImpressions.find(
          (impression) =>
            impression.hero_image_url !==
            null,
        )?.hero_image_url ??
        null

      return {
        id: product.id,
        model: product.model,
        slug: product.slug,

        brand:
          product.brand,

        heroImageUrl,

        reviewCount:
          sortedReviews.length,

        impressionCount:
          sortedImpressions.length,

        coverageCount:
          sortedReviews.length +
          sortedImpressions.length,

        reviewerCount:
          reviewReviewerSlugs.size,

        contributorCount:
          contributorSlugs.size,

        averageRating:
          sortedReviews.length ===
          0
            ? null
            : ratingTotal /
              sortedReviews.length,

        latestReviewAt,
        latestActivityAt,
      }
    })
    .sort(
      (first, second) => {
        const coverageDifference =
          (second.coverageCount ??
            0) -
          (first.coverageCount ??
            0)

        if (
          coverageDifference !==
          0
        ) {
          return coverageDifference
        }

        return first.model.localeCompare(
          second.model,
        )
      },
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

export async function getBrandBySlug(
  slug: string,
): Promise<BrandProfile | null> {
  const normalizedSlug =
    slug.trim()

  if (!normalizedSlug) {
    return null
  }

  const {
    data: brandData,
    error: brandError,
  } = await supabase
    .from("brands")
    .select(`
      id,
      name,
      slug,
      website
    `)
    .eq(
      "slug",
      normalizedSlug,
    )
    .maybeSingle()

  if (brandError) {
    throw brandError
  }

  if (!brandData) {
    return null
  }

  const brand =
    brandData as BrandRow

  const [
    reviewsResult,
    impressionsResult,
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select(`
        id,
        slug,
        rating,
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

        products!inner (
          id,
          model,
          slug,

          brands!inner (
            id,
            name,
            slug
          )
        )
      `)
      .eq(
        "products.brand_id",
        Number(
          brand.id,
        ),
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
      ),

    supabase
      .from("impressions")
      .select(`
        id,
        slug,
        title,
        summary,
		body,
        hero_image_url,
        published_at,
        source_url,

        reviewers (
		  id,
          name,
          slug
        ),

        products!inner (
          id,
          model,
          slug,

          brands!inner (
            id,
            name,
            slug
          )
        )
      `)
      .eq(
        "products.brand_id",
        Number(
          brand.id,
        ),
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
      ),
  ])

  if (reviewsResult.error) {
    throw reviewsResult.error
  }

  if (impressionsResult.error) {
    throw impressionsResult.error
  }

  const reviewRows =
    (reviewsResult.data ??
      []) as unknown as BrandReviewRow[]

  const impressionRows =
    (impressionsResult.data ??
      []) as unknown as BrandImpressionRow[]

  const reviews =
    reviewRows.map(
      mapFeaturedReview,
    )

  const impressions =
    impressionRows.map(
      mapImpression,
    )

  const contributors =
    collectContributors(
      reviewRows,
      impressionRows,
    )

  const products =
    collectProducts(
      reviewRows,
      impressionRows,
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
    id: Number(
      brand.id,
    ),
    name: brand.name,
    slug: brand.slug,
    website:
      brand.website,

    heroImageUrl,

    averageRating:
      calculateAverageRating(
        reviews,
      ),

    reviewCount:
      reviews.length,

    impressionCount:
      impressions.length,

    coverageCount:
      reviews.length +
      impressions.length,

    contributorCount:
      contributors.length,

    contributors,
    products,

    latestReviews:
      reviews.slice(0, 6),

    latestImpressions:
      impressions.slice(0, 6),
  }
}

export async function getBrands(): Promise<
  BrandDirectoryItem[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("brands")
    .select(`
      id,
      name,
      slug,

      products (
        id,

        reviews (
          id,
          published
        ),

        impressions (
          id,
          published
        )
      )
    `)

  if (error) {
    throw error
  }

  const rows =
    (data ??
      []) as unknown as {
      id: number
      name: string
      slug: string

      products:
        | {
            id: number

            reviews:
              | {
                  id: number
                  published: boolean
                }[]
              | null

            impressions:
              | {
                  id: number
                  published: boolean
                }[]
              | null
          }[]
        | null
    }[]

  return rows
    .map((brand) => {
      const products =
        brand.products ??
        []

      const coveredProducts =
        products.filter(
          (product) => {
            const hasReview =
              (
                product.reviews ??
                []
              ).some(
                (review) =>
                  review.published,
              )

            const hasImpression =
              (
                product.impressions ??
                []
              ).some(
                (impression) =>
                  impression.published,
              )

            return (
              hasReview ||
              hasImpression
            )
          },
        )

      const reviewCount =
        coveredProducts.reduce(
          (total, product) =>
            total +
            (
              product.reviews ??
              []
            ).filter(
              (review) =>
                review.published,
            ).length,
          0,
        )

      const impressionCount =
        coveredProducts.reduce(
          (total, product) =>
            total +
            (
              product.impressions ??
              []
            ).filter(
              (impression) =>
                impression.published,
            ).length,
          0,
        )

      return {
        id: Number(
          brand.id,
        ),
        name:
          brand.name,
        slug:
          brand.slug,

        productCount:
          coveredProducts.length,

        reviewCount,

        impressionCount,

        coverageCount:
          reviewCount +
          impressionCount,
      }
    })
    .filter(
      (brand) =>
        brand.coverageCount >
        0,
    )
    .sort(
      (first, second) =>
        first.name.localeCompare(
          second.name,
        ),
    )
}