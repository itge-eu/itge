import { supabase } from "./supabase"

import type { FeaturedReview } from "./reviews"

export type ArtistSummary = {
  id: number
  musicbrainzId: string
  name: string
  slug: string
  country: string | null
  artistType: string | null
  reviewCount: number
  iemCount: number
  reviewerCount: number
}

export type ArtistIemSummary = {
  id: number
  model: string
  slug: string
  manufacturerName: string
  manufacturerSlug: string
  reviewCount: number
}

export type ArtistReviewerSummary = {
  id: number
  name: string
  slug: string
  reviewCount: number
}

export type ArtistProfile = ArtistSummary & {
  reviews: FeaturedReview[]
  iems: ArtistIemSummary[]
  reviewers: ArtistReviewerSummary[]
}

type ArtistRow = {
  id: number
  musicbrainz_id: string
  name: string
  slug: string
  country: string | null
  artist_type: string | null
}

type RelationRow = {
  review_id: number
  artist_id: number
}

type PublishedReviewRow = {
  id: number
  iem_id: number | null
  reviewer_id: number | null
}

export async function getArtists(): Promise<
  ArtistSummary[]
> {
  const [
    artistsResult,
    relationsResult,
    reviewsResult,
  ] = await Promise.all([
    supabase
      .from("artists")
      .select(`
        id,
        musicbrainz_id,
        name,
        slug,
        country,
        artist_type
      `)
      .order("name", { ascending: true }),

    supabase
      .from("review_artists")
      .select(`
        review_id,
        artist_id
      `),

    supabase
      .from("reviews")
      .select(`
        id,
        iem_id,
        reviewer_id
      `)
      .eq("published", true),
  ])

  const firstError =
    artistsResult.error ||
    relationsResult.error ||
    reviewsResult.error

  if (firstError) {
    throw firstError
  }

  const artists =
    (artistsResult.data ?? []) as ArtistRow[]

  const relations =
    (relationsResult.data ?? []) as RelationRow[]

  const publishedReviews =
    (reviewsResult.data ??
      []) as PublishedReviewRow[]

  const publishedReviewMap = new Map<
    number,
    PublishedReviewRow
  >(
    publishedReviews.map((review) => [
      Number(review.id),
      review,
    ]),
  )

  return artists
    .map((artist) => {
      const reviewIds = new Set<number>()

      for (const relation of relations) {
        if (
          Number(relation.artist_id) ===
          Number(artist.id)
        ) {
          reviewIds.add(
            Number(relation.review_id),
          )
        }
      }

      const iemIds = new Set<number>()
      const reviewerIds = new Set<number>()

      let reviewCount = 0

      for (const reviewId of reviewIds) {
        const review =
          publishedReviewMap.get(reviewId)

        if (!review) {
          continue
        }

        reviewCount += 1

        if (review.iem_id != null) {
          iemIds.add(Number(review.iem_id))
        }

        if (review.reviewer_id != null) {
          reviewerIds.add(
            Number(review.reviewer_id),
          )
        }
      }

      return {
        id: Number(artist.id),
        musicbrainzId:
          artist.musicbrainz_id,
        name: artist.name,
        slug: artist.slug,
        country: artist.country,
        artistType: artist.artist_type,
        reviewCount,
        iemCount: iemIds.size,
        reviewerCount: reviewerIds.size,
      }
    })
    .filter(
      (artist) => artist.reviewCount > 0,
    )
}

type ArtistDetailReviewRow = {
  id: number
  slug: string
  rating: number
  title: string
  summary: string
  hero_image_url: string | null

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

function mapArtistReview(
  row: ArtistDetailReviewRow,
): FeaturedReview {
  const reviewer = getSingleRelation(
    row.reviewers,
  )

  const iem = getSingleRelation(
    row.iems,
  )

  const manufacturer =
    getSingleRelation(
      iem?.manufacturers,
    )

  if (
    !reviewer ||
    !iem ||
    !manufacturer
  ) {
    throw new Error(
      `Review ${row.id} has incomplete artist data`,
    )
  }

  return {
    id: Number(row.id),
    slug: row.slug,
    rating: Number(row.rating),
    title: row.title,
    summary: row.summary,
    brand: manufacturer.name,
    manufacturerSlug:
      manufacturer.slug,
    model: iem.model,
    iemSlug: iem.slug,
    reviewer: reviewer.name,
    reviewerSlug: reviewer.slug,
    heroImageUrl:
      row.hero_image_url,
  }
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
      artist_type
    `)
    .eq("slug", slug)
    .maybeSingle()

  if (artistError) {
    throw artistError
  }

  if (!artist) {
    return null
  }

  const {
    data: relations,
    error: relationError,
  } = await supabase
    .from("review_artists")
    .select(`
      review_id
    `)
    .eq("artist_id", artist.id)

  if (relationError) {
    throw relationError
  }

  const reviewIds = Array.from(
    new Set(
      (relations ?? []).map(
        (relation) =>
          Number(relation.review_id),
      ),
    ),
  )

  if (reviewIds.length === 0) {
    return {
      id: Number(artist.id),
      musicbrainzId:
        artist.musicbrainz_id,
      name: artist.name,
      slug: artist.slug,
      country: artist.country,
      artistType:
        artist.artist_type,
      reviewCount: 0,
      iemCount: 0,
      reviewerCount: 0,
      reviews: [],
      iems: [],
      reviewers: [],
    }
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

      reviewers (
        id,
        name,
        slug
      ),

      iems (
        id,
        model,
        slug,
        manufacturers (
          id,
          name,
          slug
        )
      )
    `)
    .in("id", reviewIds)
    .eq("published", true)
    .order("published_at", {
      ascending: false,
    })

  if (reviewsError) {
    throw reviewsError
  }

  const rows =
    (reviews ??
      []) as unknown as ArtistDetailReviewRow[]

  const mappedReviews =
    rows.map(mapArtistReview)

  const iemMap = new Map<
    number,
    ArtistIemSummary
  >()

  const reviewerMap = new Map<
    number,
    ArtistReviewerSummary
  >()

  for (const row of rows) {
    const reviewer =
      getSingleRelation(
        row.reviewers,
      )

    const iem =
      getSingleRelation(
        row.iems,
      )

    const manufacturer =
      getSingleRelation(
        iem?.manufacturers,
      )

    if (
      !reviewer ||
      !iem ||
      !manufacturer
    ) {
      continue
    }

    const existingIem =
      iemMap.get(Number(iem.id))

    if (existingIem) {
      existingIem.reviewCount += 1
    } else {
      iemMap.set(
        Number(iem.id),
        {
          id: Number(iem.id),
          model: iem.model,
          slug: iem.slug,
          manufacturerName:
            manufacturer.name,
          manufacturerSlug:
            manufacturer.slug,
          reviewCount: 1,
        },
      )
    }

    const existingReviewer =
      reviewerMap.get(
        Number(reviewer.id),
      )

    if (existingReviewer) {
      existingReviewer.reviewCount += 1
    } else {
      reviewerMap.set(
        Number(reviewer.id),
        {
          id: Number(
            reviewer.id,
          ),
          name: reviewer.name,
          slug: reviewer.slug,
          reviewCount: 1,
        },
      )
    }
  }

  const iems = Array.from(
    iemMap.values(),
  ).sort(
    (first, second) =>
      second.reviewCount -
        first.reviewCount ||
      first.model.localeCompare(
        second.model,
      ),
  )

  const reviewers = Array.from(
    reviewerMap.values(),
  ).sort(
    (first, second) =>
      second.reviewCount -
        first.reviewCount ||
      first.name.localeCompare(
        second.name,
      ),
  )

  return {
    id: Number(artist.id),
    musicbrainzId:
      artist.musicbrainz_id,
    name: artist.name,
    slug: artist.slug,
    country: artist.country,
    artistType:
      artist.artist_type,
    reviewCount:
      mappedReviews.length,
    iemCount: iems.length,
    reviewerCount:
      reviewers.length,
    reviews: mappedReviews,
    iems,
    reviewers,
  }
}