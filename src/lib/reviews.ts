import { supabase } from "./supabase"

export type ReviewArtist = {
  id: number
  musicbrainzId: string
  name: string
  slug: string
}

export type ReviewGenre = {
  id: number
  name: string
  slug: string
}

export type FeaturedReview = {
  id: number
  slug: string
  rating: number
  title: string
  summary: string
  brand: string
  model: string
  iemSlug: string
  reviewer: string
  reviewerSlug: string
  heroImageUrl: string | null
}

export type FullReview = FeaturedReview & {
  body: string | null
  pros: string | null
  cons: string | null
  artists: ReviewArtist[]
  genres: ReviewGenre[]
}

type ReviewArtistRow = {
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

type ReviewGenreRow = {
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

type ReviewRow = {
  id: number
  slug: string
  rating: number
  title: string
  summary: string
  body?: string | null
  pros?: string | null
  cons?: string | null
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
            }
          | {
              name: string
            }[]
          | null
      }
    | {
        model: string
		slug: string
        manufacturers:
          | {
              name: string
            }
          | {
              name: string
            }[]
          | null
      }[]
    | null
  review_artists?: ReviewArtistRow[] | null
  review_genres?: ReviewGenreRow[] | null
}

function getSingleRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation ?? null
}

function normalizeValue(value: string): string {
  return value.trim().toLocaleLowerCase()
}

function mapReview(row: ReviewRow): FeaturedReview {
  const reviewer = getSingleRelation(row.reviewers)
  const iem = getSingleRelation(row.iems)
  const manufacturer = getSingleRelation(
    iem?.manufacturers,
  )

  if (!reviewer || !iem || !manufacturer) {
    throw new Error(
      `Review ${row.id} has incomplete related data`,
    )
  }

  return {
    id: row.id,
    slug: row.slug,
    rating: Number(row.rating),
    title: row.title,
    summary: row.summary,
    reviewer: reviewer.name,
    reviewerSlug: reviewer.slug,
    model: iem.model,
	iemSlug: iem.slug,
    brand: manufacturer.name,
    heroImageUrl: row.hero_image_url,
  }
}

function mapReviewArtists(
  rows: ReviewArtistRow[] | null | undefined,
): ReviewArtist[] {
  return (rows ?? []).flatMap((row) => {
    const artist = getSingleRelation(row.artists)

    if (!artist) {
      return []
    }

    return [
      {
        id: Number(artist.id),
        musicbrainzId: artist.musicbrainz_id,
        name: artist.name,
        slug: artist.slug,
      },
    ]
  })
}

function mapReviewGenres(
  rows: ReviewGenreRow[] | null | undefined,
): ReviewGenre[] {
  return (rows ?? []).flatMap((row) => {
    const genre = getSingleRelation(row.genres)

    if (!genre) {
      return []
    }

    return [
      {
        id: Number(genre.id),
        name: genre.name,
        slug: genre.slug,
      },
    ]
  })
}

export async function getFeaturedReviews(): Promise<
  FeaturedReview[]
> {
  const { data, error } = await supabase
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
          name
        )
      )
    `)
    .eq("published", true)
    .eq("featured", true)
    .order("published_at", { ascending: false })

  if (error) {
    throw error
  }

  const rows = (data ?? []) as unknown as ReviewRow[]

  return rows.map(mapReview)
}

export type ReviewFilters = {
  artistSlug?: string
  genreSlug?: string
  iemName?: string
  manufacturerName?: string
  reviewerName?: string
}

export type ReviewsResult = {
  reviews: FeaturedReview[]
  artistName: string | null
  genreName: string | null
}

export async function getAllReviews(
  filters: ReviewFilters = {},
): Promise<ReviewsResult> {
  const artistSlug =
    filters.artistSlug?.trim() || null
  const genreSlug =
    filters.genreSlug?.trim() || null
  const iemName =
    filters.iemName?.trim() || null
  const manufacturerName =
    filters.manufacturerName?.trim() || null
  const reviewerName =
    filters.reviewerName?.trim() || null

  let artistName: string | null = null
  let genreName: string | null = null

  let artistReviewIds: number[] | null = null
  let genreReviewIds: number[] | null = null

  if (artistSlug) {
    const { data: artistData, error: artistError } =
      await supabase
        .from("artists")
        .select(`
          id,
          name
        `)
        .eq("slug", artistSlug)
        .maybeSingle()

    if (artistError) {
      throw artistError
    }

    if (!artistData) {
      return {
        reviews: [],
        artistName: null,
        genreName: null,
      }
    }

    artistName = artistData.name

    const {
      data: relationData,
      error: relationError,
    } = await supabase
      .from("review_artists")
      .select("review_id")
      .eq("artist_id", artistData.id)

    if (relationError) {
      throw relationError
    }

    artistReviewIds = (relationData ?? []).map(
      (relation) => Number(relation.review_id),
    )
  }

  if (genreSlug) {
    const { data: genreData, error: genreError } =
      await supabase
        .from("genres")
        .select(`
          id,
          name
        `)
        .eq("slug", genreSlug)
        .maybeSingle()

    if (genreError) {
      throw genreError
    }

    if (!genreData) {
      return {
        reviews: [],
        artistName,
        genreName: null,
      }
    }

    genreName = genreData.name

    const {
      data: relationData,
      error: relationError,
    } = await supabase
      .from("review_genres")
      .select("review_id")
      .eq("genre_id", genreData.id)

    if (relationError) {
      throw relationError
    }

    genreReviewIds = (relationData ?? []).map(
      (relation) => Number(relation.review_id),
    )
  }

  let reviewIds: number[] | null = null

  if (artistReviewIds && genreReviewIds) {
    const genreIdSet = new Set(genreReviewIds)

    reviewIds = artistReviewIds.filter((reviewId) =>
      genreIdSet.has(reviewId),
    )
  } else if (artistReviewIds) {
    reviewIds = artistReviewIds
  } else if (genreReviewIds) {
    reviewIds = genreReviewIds
  }

  if (reviewIds && reviewIds.length === 0) {
    return {
      reviews: [],
      artistName,
      genreName,
    }
  }

  let query = supabase
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
          name
        )
      )
    `)
    .eq("published", true)
    .order("published_at", { ascending: false })

  if (reviewIds) {
    query = query.in("id", reviewIds)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  const rows = (data ?? []) as unknown as ReviewRow[]
  const mappedReviews = rows.map(mapReview)

  const reviews = mappedReviews.filter((review) => {
    if (
      iemName &&
      normalizeValue(review.model) !==
        normalizeValue(iemName)
    ) {
      return false
    }

    if (
      manufacturerName &&
      normalizeValue(review.brand) !==
        normalizeValue(manufacturerName)
    ) {
      return false
    }

    if (
      reviewerName &&
      normalizeValue(review.reviewer) !==
        normalizeValue(reviewerName)
    ) {
      return false
    }

    return true
  })

  return {
    reviews,
    artistName,
    genreName,
  }
}

export async function getReviewBySlug(
  slug: string,
): Promise<FullReview | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      slug,
      rating,
      title,
      summary,
      pros,
      cons,
      body,
      hero_image_url,
      reviewers (
        name,
        slug
      ),
      iems (
        model,
		slug,
        manufacturers (
          name
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
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  const row = data as unknown as ReviewRow

  return {
    ...mapReview(row),
    body: row.body ?? null,
    pros: row.pros ?? null,
    cons: row.cons ?? null,
    artists: mapReviewArtists(row.review_artists),
    genres: mapReviewGenres(row.review_genres),
  }
}