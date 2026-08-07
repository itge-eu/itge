import { supabase } from "./supabase"

import type {
  FeaturedReview,
  ReviewArtist,
  ReviewGenre,
} from "./reviews"

export type IemReviewer = {
  name: string
  slug: string
  reviewCount: number
}

export type IemDirectoryItem = {
  id: number
  model: string
  slug: string
  manufacturer: {
    id: number
    name: string
	slug: string
  }
  heroImageUrl: string | null
  reviewCount: number
  reviewerCount: number
  averageRating: number | null
  latestReviewAt: string | null
}

export type IemProfile = {
  id: number
  model: string
  slug: string

  manufacturer: {
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
}

type IemRow = {
  id: number
  model: string
  slug: string
  release_year: number | null
  driver_configuration: string | null
  launch_price: string | number | null
  launch_currency: string | null

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

type IemDirectoryRow = {
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

  reviews:
    | {
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
      }[]
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

  review_artists?: ReviewArtistRelationRow[] | null
  review_genres?: ReviewGenreRelationRow[] | null
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
  const reviewer = getSingleRelation(row.reviewers)
  const iem = getSingleRelation(row.iems)
  const manufacturer = getSingleRelation(
    iem?.manufacturers,
  )

  if (!reviewer || !iem || !manufacturer) {
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
    brand: manufacturer.name,
    model: iem.model,
    iemSlug: iem.slug,
    reviewer: reviewer.name,
    reviewerSlug: reviewer.slug,
    heroImageUrl: row.hero_image_url,
  }
}

function collectReviewers(
  rows: IemReviewRow[],
): IemReviewer[] {
  const reviewers = new Map<string, IemReviewer>()

  rows.forEach((row) => {
    const reviewer = getSingleRelation(row.reviewers)

    if (!reviewer) {
      return
    }

    const existing = reviewers.get(reviewer.slug)

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

  return Array.from(reviewers.values()).sort(
    (first, second) => {
      const countDifference =
        second.reviewCount - first.reviewCount

      if (countDifference !== 0) {
        return countDifference
      }

      return first.name.localeCompare(second.name)
    },
  )
}

function collectArtists(
  rows: IemReviewRow[],
): ReviewArtist[] {
  const artists = new Map<number, ReviewArtist>()

  rows.forEach((row) => {
    ;(row.review_artists ?? []).forEach(
      (relation) => {
        const artist = getSingleRelation(
          relation.artists,
        )

        if (!artist || artists.has(Number(artist.id))) {
          return
        }

        artists.set(Number(artist.id), {
          id: Number(artist.id),
          musicbrainzId: artist.musicbrainz_id,
          name: artist.name,
          slug: artist.slug,
        })
      },
    )
  })

  return Array.from(artists.values()).sort(
    (first, second) =>
      first.name.localeCompare(second.name),
  )
}

function collectGenres(
  rows: IemReviewRow[],
): ReviewGenre[] {
  const genres = new Map<number, ReviewGenre>()

  rows.forEach((row) => {
    ;(row.review_genres ?? []).forEach(
      (relation) => {
        const genre = getSingleRelation(
          relation.genres,
        )

        if (!genre || genres.has(Number(genre.id))) {
          return
        }

        genres.set(Number(genre.id), {
          id: Number(genre.id),
          name: genre.name,
          slug: genre.slug,
        })
      },
    )
  })

  return Array.from(genres.values()).sort(
    (first, second) =>
      first.name.localeCompare(second.name),
  )
}

function calculateAverageRating(
  reviews: FeaturedReview[],
): number | null {
  if (reviews.length === 0) {
    return null
  }

  const total = reviews.reduce(
    (sum, review) => sum + review.rating,
    0,
  )

  return total / reviews.length
}

export async function getIemBySlug(
  slug: string,
): Promise<IemProfile | null> {
  const normalizedSlug = slug.trim()

  if (!normalizedSlug) {
    return null
  }

  const { data: iemData, error: iemError } =
    await supabase
      .from("iems")
      .select(`
        id,
        model,
        slug,
		release_year,
        driver_configuration,
        launch_price,
        launch_currency,
        manufacturers (
          id,
          name,
		  slug
        )
      `)
      .eq("slug", normalizedSlug)
      .maybeSingle()

  if (iemError) {
    throw iemError
  }

  if (!iemData) {
    return null
  }

  const iem = iemData as unknown as IemRow
  const manufacturer = getSingleRelation(
    iem.manufacturers,
  )

  if (!manufacturer) {
    throw new Error(
      `IEM ${iem.id} has no associated manufacturer`,
    )
  }

  const { data: reviewData, error: reviewError } =
    await supabase
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
          manufacturers (
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
      .eq("iem_id", Number(iem.id))
      .eq("published", true)
      .order("published_at", {
        ascending: false,
      })

  if (reviewError) {
    throw reviewError
  }

  const rows =
    (reviewData ?? []) as unknown as IemReviewRow[]

  const reviews = rows.map(mapFeaturedReview)

  const heroImageUrl =
    reviews.find(
      (review) => review.heroImageUrl !== null,
    )?.heroImageUrl ?? null

  return {
    id: Number(iem.id),
    model: iem.model,
    slug: iem.slug,

    manufacturer: {
      id: Number(manufacturer.id),
      name: manufacturer.name,
	  slug: manufacturer.slug,
    },
	
	releaseYear:
      iem.release_year == null
        ? null
        : Number(iem.release_year),
    
    driverConfiguration:
      iem.driver_configuration,
    
    launchPrice:
      iem.launch_price == null
        ? null
        : Number(iem.launch_price),
    
    launchCurrency:
      iem.launch_currency,

    averageRating:
      calculateAverageRating(reviews),

    heroImageUrl,

    reviewers: collectReviewers(rows),
    artists: collectArtists(rows),
    genres: collectGenres(rows),
    reviews,
  }
}

export async function getIems(): Promise<
  IemDirectoryItem[]
> {
  const { data, error } = await supabase
    .from("iems")
    .select(`
      id,
      model,
      slug,

      manufacturers (
        id,
        name,
		slug
      ),

      reviews!inner (
        id,
        rating,
        hero_image_url,
        published_at,

        reviewers (
          slug
        )
      )
    `)
    .eq("reviews.published", true)

  if (error) {
    throw error
  }

  const rows =
    (data ?? []) as unknown as IemDirectoryRow[]

  return rows.flatMap((row) => {
    const manufacturer = getSingleRelation(
      row.manufacturers,
    )

    if (!manufacturer) {
      return []
    }

    const reviews = [...(row.reviews ?? [])].sort(
      (first, second) => {
        const firstTime = first.published_at
          ? new Date(first.published_at).getTime()
          : 0

        const secondTime = second.published_at
          ? new Date(second.published_at).getTime()
          : 0

        return secondTime - firstTime
      },
    )

    if (reviews.length === 0) {
      return []
    }

    const reviewerSlugs = new Set<string>()

    reviews.forEach((review) => {
      const reviewer = getSingleRelation(
        review.reviewers,
      )

      if (reviewer) {
        reviewerSlugs.add(reviewer.slug)
      }
    })

    const ratingTotal = reviews.reduce(
      (total, review) =>
        total + Number(review.rating),
      0,
    )

    return [
      {
        id: Number(row.id),
        model: row.model,
        slug: row.slug,

        manufacturer: {
          id: Number(manufacturer.id),
          name: manufacturer.name,
		  slug: manufacturer.slug,
        },

        heroImageUrl:
          reviews.find(
            (review) =>
              review.hero_image_url !== null,
          )?.hero_image_url ?? null,

        reviewCount: reviews.length,
        reviewerCount: reviewerSlugs.size,
        averageRating:
          ratingTotal / reviews.length,
        latestReviewAt:
          reviews[0]?.published_at ?? null,
      },
    ]
  })
}