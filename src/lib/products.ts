import { supabase } from "./supabase"

import type {
  FeaturedReview,
  ReviewArtist,
  ReviewGenre,
} from "./reviews"

import {
  getImpressionsByProductId,
  type ImpressionSummary,
} from "./impressions"

export type ProductType =
  | "iem"
  | "headphone"
  | "source"
  | "cable_accessory"

export type ProductReviewer = {
  name: string
  slug: string
  reviewCount: number
}

export type ProductDirectoryItem = {
  id: number
  model: string
  slug: string
  productType: ProductType
  featured?: boolean
  launchPrice?: number | null

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

  impressionCount?: number
  coverageCount?: number
  contributorCount?: number
  latestActivityAt?: string | null
}

export type ProductProfile = {
  id: number
  model: string
  slug: string
  productType: ProductType

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

  reviewers: ProductReviewer[]
  artists: ReviewArtist[]
  genres: ReviewGenre[]
  reviews: FeaturedReview[]
  impressions: ImpressionSummary[]
}

type ProductRow = {
  id: number
  model: string
  slug: string

  product_type:
    | ProductType
    | null

  hero_image_url:
    | string
    | null

  release_year:
    | number
    | null

  driver_configuration:
    | string
    | null

  launch_price:
    | string
    | number
    | null

  launch_currency:
    | string
    | null

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

type ProductDirectoryImpressionRow = {
  id: number

  hero_image_url:
    | string
    | null

  published_at:
    | string
    | null

  published: boolean

  reviewers:
    | {
        slug: string
      }
    | {
        slug: string
      }[]
    | null
}

type ProductDirectoryRow = {
  id: number
  model: string
  slug: string

  product_type:
    | ProductType
    | null

  featured:
    | boolean
    | null

  launch_price:
    | string
    | number
    | null

  hero_image_url:
    | string
    | null

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

  impressions:
    | ProductDirectoryImpressionRow[]
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

type ProductReviewRow = {
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
    | {
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
      }[]
    | null

  review_artists?:
    | ReviewArtistRelationRow[]
    | null

  review_genres?:
    | ReviewGenreRelationRow[]
    | null
}

type ReviewProductLinkRow = {
  product_id: number

  reviews:
    | ProductReviewRow
    | ProductReviewRow[]
    | null
}

function getSingleRelation<T>(
  relation:
    | T
    | T[]
    | null
    | undefined,
): T | null {
  if (
    Array.isArray(
      relation,
    )
  ) {
    return (
      relation[0] ??
      null
    )
  }

  return relation ?? null
}

export function getProductTypeLabel(
  type: ProductType,
): string {
  switch (type) {
    case "headphone":
      return "Headphone"

    case "source":
      return "Source gear"

    case "cable_accessory":
      return "Cable / accessory"

    case "iem":
    default:
      return "IEM"
  }
}

function normalizeProductType(
  value:
    | ProductType
    | null
    | undefined,
): ProductType {
  return value ?? "iem"
}

function mapFeaturedReview(
  row: ProductReviewRow,
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
      `Review ${row.id} has incomplete product page data`,
    )
  }

  return {
    id:
      Number(
        row.id,
      ),

    slug:
      row.slug,

    rating:
      Number(
        row.rating,
      ),

    title:
      row.title,

    summary:
      row.summary,

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
      row.hero_image_url ??
      product.hero_image_url ??
      null,

    publishedAt:
      row.published_at,
  }
}

function collectReviewers(
  rows:
    ProductReviewRow[],
): ProductReviewer[] {
  const reviewers =
    new Map<
      string,
      ProductReviewer
    >()

  rows.forEach(
    (row) => {
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
        existing.reviewCount +=
          1

        return
      }

      reviewers.set(
        reviewer.slug,
        {
          name:
            reviewer.name,

          slug:
            reviewer.slug,

          reviewCount:
            1,
        },
      )
    },
  )

  return Array.from(
    reviewers.values(),
  ).sort(
    (
      first,
      second,
    ) => {
      const countDifference =
        second.reviewCount -
        first.reviewCount

      if (
        countDifference !==
        0
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
  rows:
    ProductReviewRow[],
): ReviewArtist[] {
  const artists =
    new Map<
      number,
      ReviewArtist
    >()

  rows.forEach(
    (row) => {
      ;(
        row.review_artists ??
        []
      ).forEach(
        (relation) => {
          const artist =
            getSingleRelation(
              relation.artists,
            )

          if (
            !artist ||
            artists.has(
              Number(
                artist.id,
              ),
            )
          ) {
            return
          }

          artists.set(
            Number(
              artist.id,
            ),
            {
              id:
                Number(
                  artist.id,
                ),

              musicbrainzId:
                artist.musicbrainz_id,

              name:
                artist.name,

              slug:
                artist.slug,
            },
          )
        },
      )
    },
  )

  return Array.from(
    artists.values(),
  ).sort(
    (
      first,
      second,
    ) =>
      first.name.localeCompare(
        second.name,
      ),
  )
}

function collectGenres(
  rows:
    ProductReviewRow[],
): ReviewGenre[] {
  const genres =
    new Map<
      number,
      ReviewGenre
    >()

  rows.forEach(
    (row) => {
      ;(
        row.review_genres ??
        []
      ).forEach(
        (relation) => {
          const genre =
            getSingleRelation(
              relation.genres,
            )

          if (
            !genre ||
            genres.has(
              Number(
                genre.id,
              ),
            )
          ) {
            return
          }

          genres.set(
            Number(
              genre.id,
            ),
            {
              id:
                Number(
                  genre.id,
                ),

              name:
                genre.name,

              slug:
                genre.slug,
            },
          )
        },
      )
    },
  )

  return Array.from(
    genres.values(),
  ).sort(
    (
      first,
      second,
    ) =>
      first.name.localeCompare(
        second.name,
      ),
  )
}

function calculateAverageRating(
  reviews:
    FeaturedReview[],
): number | null {
  if (
    reviews.length ===
    0
  ) {
    return null
  }

  const total =
    reviews.reduce(
      (
        sum,
        review,
      ) =>
        sum +
        review.rating,
      0,
    )

  return (
    total /
    reviews.length
  )
}

function timestampValue(
  value:
    | string
    | null,
): number {
  if (!value) {
    return 0
  }

  const time =
    new Date(
      value,
    ).getTime()

  return Number.isNaN(
    time,
  )
    ? 0
    : time
}

function extractReviewRows(
  links:
    ReviewProductLinkRow[],
): ProductReviewRow[] {
  return links
    .flatMap(
      (link) => {
        const review =
          getSingleRelation(
            link.reviews,
          )

        if (
          !review ||
          !review.published
        ) {
          return []
        }

        return [
          review,
        ]
      },
    )
    .sort(
      (
        first,
        second,
      ) =>
        timestampValue(
          second.published_at,
        ) -
        timestampValue(
          first.published_at,
        ),
    )
}

async function getReviewLinksForProduct(
  productId: number,
): Promise<
  ReviewProductLinkRow[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "review_products",
      )
      .select(`
        product_id,

        reviews (
          id,
          slug,
          rating,
          title,
          summary,
          hero_image_url,
          published_at,
          published,

          reviewers (
            name,
            slug
          ),

          products!reviews_iem_id_fkey (
            model,
            slug,
            hero_image_url,

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
        )
      `)
      .eq(
        "product_id",
        productId,
      )

  if (error) {
    throw error
  }

  return (
    data ??
    []
  ) as unknown as ReviewProductLinkRow[]
}

async function getAllReviewLinks(): Promise<
  ReviewProductLinkRow[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "review_products",
      )
      .select(`
        product_id,

        reviews (
          id,
          slug,
          rating,
          title,
          summary,
          hero_image_url,
          published_at,
          published,

          reviewers (
            name,
            slug
          ),

          products!reviews_iem_id_fkey (
            model,
            slug,
            hero_image_url,

            brands (
              name,
              slug
            )
          )
        )
      `)

  if (error) {
    throw error
  }

  return (
    data ??
    []
  ) as unknown as ReviewProductLinkRow[]
}

export async function getProductBySlug(
  slug: string,
): Promise<
  ProductProfile | null
> {
  const normalizedSlug =
    slug.trim()

  if (
    !normalizedSlug
  ) {
    return null
  }

  const {
    data:
      productData,

    error:
      productError,
  } =
    await supabase
      .from(
        "products",
      )
      .select(`
        id,
        model,
        slug,
        product_type,
        hero_image_url,
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

  if (
    productError
  ) {
    throw productError
  }

  if (
    !productData
  ) {
    return null
  }

  const product =
    productData as unknown as ProductRow

  const brand =
    getSingleRelation(
      product.brands,
    )

  if (!brand) {
    throw new Error(
      `Product ${product.id} has no associated brand`,
    )
  }

  const reviewLinks =
    await getReviewLinksForProduct(
      Number(
        product.id,
      ),
    )

  const rows =
    extractReviewRows(
      reviewLinks,
    )

  const reviews =
    rows.map(
      mapFeaturedReview,
    )

  const impressions =
    await getImpressionsByProductId(
      Number(
        product.id,
      ),
    )

  const fallbackHeroImageUrl =
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

  const heroImageUrl =
    product.hero_image_url ??
    fallbackHeroImageUrl

  return {
    id:
      Number(
        product.id,
      ),

    model:
      product.model,

    slug:
      product.slug,

    productType:
      normalizeProductType(
        product.product_type,
      ),

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

    releaseYear:
      product.release_year ==
      null
        ? null
        : Number(
            product.release_year,
          ),

    driverConfiguration:
      product.driver_configuration,

    launchPrice:
      product.launch_price ==
      null
        ? null
        : Number(
            product.launch_price,
          ),

    launchCurrency:
      product.launch_currency,

    averageRating:
      calculateAverageRating(
        reviews,
      ),

    heroImageUrl,

    reviewers:
      collectReviewers(
        rows,
      ),

    artists:
      collectArtists(
        rows,
      ),

    genres:
      collectGenres(
        rows,
      ),

    reviews,
    impressions,
  }
}

export async function getProducts(): Promise<
  ProductDirectoryItem[]
> {
  const [
    productsResult,
    reviewLinks,
  ] =
    await Promise.all([
      supabase
        .from(
          "products",
        )
        .select(`
          id,
          model,
          slug,
          product_type,
          featured,
          launch_price,
          hero_image_url,

          brands (
            id,
            name,
            slug
          ),

          impressions (
            id,
            hero_image_url,
            published_at,
            published,

            reviewers (
              slug
            )
          )
        `),

      getAllReviewLinks(),
    ])

  if (
    productsResult.error
  ) {
    throw productsResult.error
  }

  const rows =
    (
      productsResult.data ??
      []
    ) as unknown as ProductDirectoryRow[]

  const reviewsByProduct =
    new Map<
      number,
      ProductReviewRow[]
    >()

  reviewLinks.forEach(
    (link) => {
      const review =
        getSingleRelation(
          link.reviews,
        )

      if (
        !review ||
        !review.published
      ) {
        return
      }

      const productId =
        Number(
          link.product_id,
        )

      const existing =
        reviewsByProduct.get(
          productId,
        )

      if (existing) {
        existing.push(
          review,
        )

        return
      }

      reviewsByProduct.set(
        productId,
        [
          review,
        ],
      )
    },
  )

  reviewsByProduct.forEach(
    (reviews) => {
      reviews.sort(
        (
          first,
          second,
        ) =>
          timestampValue(
            second.published_at,
          ) -
          timestampValue(
            first.published_at,
          ),
      )
    },
  )

  return rows.flatMap(
    (row) => {
      const brand =
        getSingleRelation(
          row.brands,
        )

      if (!brand) {
        return []
      }

      const reviews =
        reviewsByProduct.get(
          Number(
            row.id,
          ),
        ) ??
        []

      const impressions = [
        ...(
          row.impressions ??
          []
        ),
      ]
        .filter(
          (impression) =>
            impression.published,
        )
        .sort(
          (
            first,
            second,
          ) =>
            timestampValue(
              second.published_at,
            ) -
            timestampValue(
              first.published_at,
            ),
        )

      if (
        reviews.length ===
          0 &&
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

          if (
            !reviewer
          ) {
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

          if (
            !reviewer
          ) {
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
        reviews.length ===
        0
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

      const fallbackHeroImageUrl =
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

      const heroImageUrl =
        row.hero_image_url ??
        fallbackHeroImageUrl

      return [
        {
          id:
            Number(
              row.id,
            ),

          model:
            row.model,

          slug:
            row.slug,

          productType:
            normalizeProductType(
              row.product_type,
            ),

          featured:
            row.featured ??
            false,

          launchPrice:
            row.launch_price ==
            null
              ? null
              : Number(
                  row.launch_price,
                ),

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