import { supabase } from "./supabase"

export type ReviewArtist = {
  id: number
  musicbrainzId: string
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
  reviewer: string
  heroImageUrl: string | null
}

export type FullReview = FeaturedReview & {
  body: string | null
  pros: string | null
  cons: string | null
  artists: ReviewArtist[]
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
      }
    | {
        name: string
      }[]
    | null
  iems:
    | {
        model: string
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
}

function getSingleRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation ?? null
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
    model: iem.model,
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
        name
      ),
      iems (
        model,
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
}

export type ReviewsResult = {
  reviews: FeaturedReview[]
  artistName: string | null
}

export async function getAllReviews(
  filters: ReviewFilters = {},
): Promise<ReviewsResult> {
  const artistSlug = filters.artistSlug?.trim() || null

  let artistName: string | null = null
  let reviewIds: number[] | null = null

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
      }
    }

    artistName = artistData.name

    const { data: relationData, error: relationError } =
      await supabase
        .from("review_artists")
        .select("review_id")
        .eq("artist_id", artistData.id)

    if (relationError) {
      throw relationError
    }

    reviewIds = (relationData ?? []).map(
      (relation) => Number(relation.review_id),
    )

    if (reviewIds.length === 0) {
      return {
        reviews: [],
        artistName,
      }
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
        name
      ),
      iems (
        model,
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

  return {
    reviews: rows.map(mapReview),
    artistName,
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
        name
      ),
      iems (
        model,
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
  }
}