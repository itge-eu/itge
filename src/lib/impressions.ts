import { supabase } from "./supabase"

export type ImpressionSummary = {
  id: number
  slug: string
  title: string | null
  summary: string | null
  body: string | null
  heroImageUrl: string | null
  publishedAt: string | null

  reviewer: {
    id: number
    name: string
    slug: string
  }

  iem: {
    id: number
    model: string
    slug: string

    manufacturer: {
      id: number
      name: string
      slug: string
    }
  }
}

export type ImpressionArtist = {
  id: number
  name: string
  slug: string
}

export type ImpressionGenre = {
  id: number
  name: string
  slug: string
}

export type FullImpression = ImpressionSummary & {
  source: string
  sourceUrl: string | null
  sourcePostId: string | null

  artists: ImpressionArtist[]
  genres: ImpressionGenre[]
}

type ImpressionRow = {
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

type FullImpressionRow = ImpressionRow & {
  source: string
  source_url: string | null
  source_post_id: string | null

  impression_artists?:
    | {
        artists:
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

  impression_genres?:
    | {
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

function mapImpression(
  row: ImpressionRow,
): ImpressionSummary {
  const reviewer = getSingleRelation(row.reviewers)
  const iem = getSingleRelation(row.iems)
  const manufacturer = getSingleRelation(
    iem?.manufacturers,
  )

  if (!reviewer || !iem || !manufacturer) {
    throw new Error(
      `Impression ${row.id} has incomplete related data`,
    )
  }

  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    heroImageUrl: row.hero_image_url,
    publishedAt: row.published_at,

    reviewer: {
      id: Number(reviewer.id),
      name: reviewer.name,
      slug: reviewer.slug,
    },

    iem: {
      id: Number(iem.id),
      model: iem.model,
      slug: iem.slug,

      manufacturer: {
        id: Number(manufacturer.id),
        name: manufacturer.name,
        slug: manufacturer.slug,
      },
    },
  }
}

function mapArtists(
  rows: FullImpressionRow["impression_artists"],
): ImpressionArtist[] {
  return (rows ?? []).flatMap((row) => {
    const artist = getSingleRelation(row.artists)

    if (!artist) {
      return []
    }

    return [
      {
        id: Number(artist.id),
        name: artist.name,
        slug: artist.slug,
      },
    ]
  })
}

function mapGenres(
  rows: FullImpressionRow["impression_genres"],
): ImpressionGenre[] {
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

export type ImpressionFilters = {
  artistSlug?: string
  genreSlug?: string
  iemName?: string
  manufacturerName?: string
  reviewerName?: string
}

export type ImpressionsResult = {
  impressions: ImpressionSummary[]
}

function normalizeValue(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase()
}

export async function getAllImpressions(): Promise<
  ImpressionSummary[]
> {
  const { data, error } = await supabase
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
    .eq("published", true)
    .order("published_at", {
      ascending: false,
    })

  if (error) {
    throw error
  }

  const rows =
    (data ?? []) as unknown as ImpressionRow[]

  return rows.map(mapImpression)
}

export async function getFilteredAllImpressions(
  filters: ImpressionFilters = {},
): Promise<ImpressionsResult> {
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

  let artistImpressionIds:
    | number[]
    | null = null

  let genreImpressionIds:
    | number[]
    | null = null

  if (artistSlug) {
    const {
      data: artistData,
      error: artistError,
    } =
      await supabase
        .from("artists")
        .select("id")
        .eq(
          "slug",
          artistSlug,
        )
        .maybeSingle()

    if (artistError) {
      throw artistError
    }

    if (!artistData) {
      return {
        impressions: [],
      }
    }

    const {
      data: relationData,
      error: relationError,
    } =
      await supabase
        .from(
          "impression_artists",
        )
        .select(
          "impression_id",
        )
        .eq(
          "artist_id",
          artistData.id,
        )

    if (relationError) {
      throw relationError
    }

    artistImpressionIds =
      (
        relationData ?? []
      ).map(
        (relation) =>
          Number(
            relation.impression_id,
          ),
      )
  }

  if (genreSlug) {
    const {
      data: genreData,
      error: genreError,
    } =
      await supabase
        .from("genres")
        .select("id")
        .eq(
          "slug",
          genreSlug,
        )
        .maybeSingle()

    if (genreError) {
      throw genreError
    }

    if (!genreData) {
      return {
        impressions: [],
      }
    }

    const {
      data: relationData,
      error: relationError,
    } =
      await supabase
        .from(
          "impression_genres",
        )
        .select(
          "impression_id",
        )
        .eq(
          "genre_id",
          genreData.id,
        )

    if (relationError) {
      throw relationError
    }

    genreImpressionIds =
      (
        relationData ?? []
      ).map(
        (relation) =>
          Number(
            relation.impression_id,
          ),
      )
  }

  let impressionIds:
    | number[]
    | null = null

  if (
    artistImpressionIds &&
    genreImpressionIds
  ) {
    const genreIdSet =
      new Set(
        genreImpressionIds,
      )

    impressionIds =
      artistImpressionIds.filter(
        (impressionId) =>
          genreIdSet.has(
            impressionId,
          ),
      )
  } else if (
    artistImpressionIds
  ) {
    impressionIds =
      artistImpressionIds
  } else if (
    genreImpressionIds
  ) {
    impressionIds =
      genreImpressionIds
  }

  if (
    impressionIds &&
    impressionIds.length === 0
  ) {
    return {
      impressions: [],
    }
  }

  let query =
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
      .eq(
        "published",
        true,
      )
      .order(
        "published_at",
        {
          ascending: false,
        },
      )

  if (impressionIds) {
    query =
      query.in(
        "id",
        impressionIds,
      )
  }

  const {
    data,
    error,
  } = await query

  if (error) {
    throw error
  }

  const rows =
    (
      data ?? []
    ) as unknown as ImpressionRow[]

  const mappedImpressions =
    rows.map(
      mapImpression,
    )

  const impressions =
    mappedImpressions.filter(
      (impression) => {
        if (
          iemName &&
          normalizeValue(
            impression.iem.model,
          ) !==
            normalizeValue(
              iemName,
            )
        ) {
          return false
        }

        if (
          manufacturerName &&
          normalizeValue(
            impression.iem
              .manufacturer.name,
          ) !==
            normalizeValue(
              manufacturerName,
            )
        ) {
          return false
        }

        if (
          reviewerName &&
          normalizeValue(
            impression.reviewer
              .name,
          ) !==
            normalizeValue(
              reviewerName,
            )
        ) {
          return false
        }

        return true
      },
    )

  return {
    impressions,
  }
}

export async function getImpressionBySlug(
  slug: string,
): Promise<FullImpression | null> {
  const normalizedSlug = slug.trim()

  if (!normalizedSlug) {
    return null
  }

  const { data, error } = await supabase
    .from("impressions")
    .select(`
      id,
      slug,
      title,
      summary,
      body,
      hero_image_url,
      published_at,
      source,
      source_url,
      source_post_id,

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
      ),

      impression_artists (
        artists (
          id,
          name,
          slug
        )
      ),

      impression_genres (
        genres (
          id,
          name,
          slug
        )
      )
    `)
    .eq("slug", normalizedSlug)
    .eq("published", true)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  const row =
    data as unknown as FullImpressionRow

  return {
    ...mapImpression(row),

    source: row.source,
    sourceUrl: row.source_url,
    sourcePostId: row.source_post_id,

    artists: mapArtists(
      row.impression_artists,
    ),

    genres: mapGenres(
      row.impression_genres,
    ),
  }
}

async function getFilteredImpressions(
  column: "reviewer_id" | "iem_id",
  id: number,
): Promise<ImpressionSummary[]> {
  const { data, error } = await supabase
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
    .eq("published", true)
    .eq(column, id)
    .order("published_at", {
      ascending: false,
    })

  if (error) {
    throw error
  }

  const rows =
    (data ?? []) as unknown as ImpressionRow[]

  return rows.map(mapImpression)
}

export async function getImpressionsByReviewerId(
  reviewerId: number,
): Promise<ImpressionSummary[]> {
  return getFilteredImpressions(
    "reviewer_id",
    reviewerId,
  )
}

export async function getImpressionsByIemId(
  iemId: number,
): Promise<ImpressionSummary[]> {
  return getFilteredImpressions(
    "iem_id",
    iemId,
  )
}