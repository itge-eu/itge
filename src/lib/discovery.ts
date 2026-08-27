import { supabase } from "./supabase"

import type {
  DiscoveryContentType,
  DiscoveryEntity,
  DiscoveryIem,
  DiscoveryImpressionItem,
  DiscoveryItem,
  DiscoveryReviewItem,
  DiscoveryState,
  SelectedDiscoveryFilters,
} from "../types/discovery"

import type {
  SearchSuggestion,
  SearchSuggestionType,
} from "../types/search"

type ArtistRelationRow = {
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
}

type GenreRelationRow = {
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

type RelatedIem = {
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

type RelatedReviewer = {
  id: number
  name: string
  slug: string
}

type DiscoveryReviewRow = {
  id: number
  slug: string
  rating: number
  title: string
  summary: string
  body: string | null
  hero_image_url: string | null
  published_at: string | null

  reviewers:
    | RelatedReviewer
    | RelatedReviewer[]
    | null

  iems:
    | RelatedIem
    | RelatedIem[]
    | null

  review_artists?:
    | ArtistRelationRow[]
    | null

  review_genres?:
    | GenreRelationRow[]
    | null
}

type DiscoveryImpressionRow = {
  id: number
  slug: string
  title: string | null
  summary: string | null
  body: string | null
  hero_image_url: string | null
  published_at: string | null

  reviewers:
    | RelatedReviewer
    | RelatedReviewer[]
    | null

  iems:
    | RelatedIem
    | RelatedIem[]
    | null

  impression_artists?:
    | ArtistRelationRow[]
    | null

  impression_genres?:
    | GenreRelationRow[]
    | null
}

const FILTER_TYPES: SearchSuggestionType[] =
  [
    "iem",
    "brand",
    "artist",
    "genre",
    "reviewer",
  ]

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

function mapArtists(
  rows:
    | ArtistRelationRow[]
    | null
    | undefined,
): DiscoveryEntity[] {
  return (rows ?? []).flatMap(
    (row) => {
      const artist =
        getSingleRelation(
          row.artists,
        )

      if (!artist) {
        return []
      }

      return [
        {
          id: Number(
            artist.id,
          ),
          name: artist.name,
          slug: artist.slug,
        },
      ]
    },
  )
}

function mapGenres(
  rows:
    | GenreRelationRow[]
    | null
    | undefined,
): DiscoveryEntity[] {
  return (rows ?? []).flatMap(
    (row) => {
      const genre =
        getSingleRelation(
          row.genres,
        )

      if (!genre) {
        return []
      }

      return [
        {
          id: Number(
            genre.id,
          ),
          name: genre.name,
          slug: genre.slug,
        },
      ]
    },
  )
}

function buildCommonEntities(
  reviewerRelation:
    | RelatedReviewer
    | RelatedReviewer[]
    | null,

  iemRelation:
    | RelatedIem
    | RelatedIem[]
    | null,

  itemLabel: string,
) {
  const reviewer =
    getSingleRelation(
      reviewerRelation,
    )

  const iem =
    getSingleRelation(
      iemRelation,
    )

  const brand =
    getSingleRelation(
      iem?.brands,
    )

  if (
    !reviewer ||
    !iem ||
    !brand
  ) {
    throw new Error(
      `${itemLabel} has incomplete discovery data`,
    )
  }

  const brandEntity: DiscoveryEntity =
    {
      id: Number(
        brand.id,
      ),
      name:
        brand.name,
      slug:
        brand.slug,
    }

  const iemEntity: DiscoveryIem =
    {
      id: Number(iem.id),
      name: iem.model,
      slug: iem.slug,

      brandId:
        Number(
          brand.id,
        ),

      brandName:
        brand.name,
    }

  const reviewerEntity: DiscoveryEntity =
    {
      id: Number(
        reviewer.id,
      ),
      name: reviewer.name,
      slug: reviewer.slug,
    }

  return {
    reviewer,
    iem,
    brand,
    brandEntity,
    iemEntity,
    reviewerEntity,
  }
}

function mapDiscoveryReview(
  row: DiscoveryReviewRow,
): DiscoveryReviewItem {
  const entities =
    buildCommonEntities(
      row.reviewers,
      row.iems,
      `Review ${row.id}`,
    )

  return {
    type: "review",

    publishedAt:
      row.published_at,

    review: {
      id: Number(row.id),
      slug: row.slug,
      rating:
        Number(row.rating),
    
      title: row.title,
      summary: row.summary,
      body: row.body,
    
      brand:
        entities.brand
          .name,
    
      brandSlug:
        entities.brand
          .slug,
    
      model:
        entities.iem.model,
    
      iemSlug:
        entities.iem.slug,
    
      reviewer:
        entities.reviewer.name,
    
      reviewerSlug:
        entities.reviewer.slug,
    
      heroImageUrl:
        row.hero_image_url,
    
      publishedAt:
        row.published_at,
    },

    iem:
      entities.iemEntity,

    brand:
      entities.brandEntity,

    reviewer:
      entities.reviewerEntity,

    artists:
      mapArtists(
        row.review_artists,
      ),

    genres:
      mapGenres(
        row.review_genres,
      ),
  }
}

function mapDiscoveryImpression(
  row: DiscoveryImpressionRow,
): DiscoveryImpressionItem {
  const entities =
    buildCommonEntities(
      row.reviewers,
      row.iems,
      `Impression ${row.id}`,
    )

  return {
    type: "impression",

    publishedAt:
      row.published_at,

    impression: {
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
        id: Number(
          entities.reviewer.id,
        ),
        name:
          entities.reviewer.name,
        slug:
          entities.reviewer.slug,
      },

      iem: {
        id: Number(
          entities.iem.id,
        ),
        model:
          entities.iem.model,
        slug:
          entities.iem.slug,

        brand: {
          id: Number(
            entities.brand
              .id,
          ),
          name:
            entities.brand
              .name,
          slug:
            entities.brand
              .slug,
        },
      },
    },

    iem:
      entities.iemEntity,

    brand:
      entities.brandEntity,

    reviewer:
      entities.reviewerEntity,

    artists:
      mapArtists(
        row.impression_artists,
      ),

    genres:
      mapGenres(
        row.impression_genres,
      ),
  }
}

function timestampValue(
  value: string | null,
): number {
  if (!value) {
    return 0
  }

  const valueAsTime =
    new Date(value).getTime()

  return Number.isNaN(
    valueAsTime,
  )
    ? 0
    : valueAsTime
}

export async function getDiscoveryItems(): Promise<
  DiscoveryItem[]
> {
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

        iems (
          id,
          model,
          slug,

          brands (
            id,
            name,
            slug
          )
        ),

        review_artists (
          artists (
            id,
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
      .eq(
        "published",
        true,
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

        reviewers (
          id,
          name,
          slug
        ),

        iems (
          id,
          model,
          slug,

          brands (
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
      .eq(
        "published",
        true,
      ),
  ])

  if (reviewsResult.error) {
    throw reviewsResult.error
  }

  if (
    impressionsResult.error
  ) {
    throw impressionsResult.error
  }

  const reviewRows =
    (reviewsResult.data ??
      []) as unknown as DiscoveryReviewRow[]

  const impressionRows =
    (impressionsResult.data ??
      []) as unknown as DiscoveryImpressionRow[]

  const items: DiscoveryItem[] =
    [
      ...reviewRows.map(
        mapDiscoveryReview,
      ),

      ...impressionRows.map(
        mapDiscoveryImpression,
      ),
    ]

  return items.sort(
    (first, second) =>
      timestampValue(
        second.publishedAt,
      ) -
      timestampValue(
        first.publishedAt,
      ),
  )
}

export function buildDiscoveryState(
  discoveryItems: DiscoveryItem[],
  selectedFilters: SelectedDiscoveryFilters,
  contentType: DiscoveryContentType,
): DiscoveryState {
  const itemsForContentType =
    discoveryItems.filter(
      (item) =>
        contentType === "all" ||
        item.type === contentType,
    )

  const matchingItems =
    itemsForContentType.filter(
      (item) =>
        itemMatchesFilters(
          item,
          selectedFilters,
        ),
    )

  const suggestions = {
    iem: buildSuggestionsForType(
      itemsForContentType,
      selectedFilters,
      "iem",
    ),

    brand:
      buildSuggestionsForType(
        itemsForContentType,
        selectedFilters,
        "brand",
      ),

    reviewer:
      buildSuggestionsForType(
        itemsForContentType,
        selectedFilters,
        "reviewer",
      ),

    artist:
      buildSuggestionsForType(
        itemsForContentType,
        selectedFilters,
        "artist",
      ),

    genre:
      buildSuggestionsForType(
        itemsForContentType,
        selectedFilters,
        "genre",
      ),
  }

  return {
    matchingItems,
    suggestions,
  }
}

function buildSuggestionsForType(
  discoveryItems: DiscoveryItem[],
  selectedFilters: SelectedDiscoveryFilters,
  type: SearchSuggestionType,
): SearchSuggestion[] {
  const relevantItems =
    discoveryItems.filter(
      (item) =>
        itemMatchesFilters(
          item,
          selectedFilters,
          type,
        ),
    )

  const suggestions =
    collectSuggestions(
      relevantItems,
      type,
    )

  return ensureSelectedSuggestion(
    suggestions,
    selectedFilters[type],
  )
}

function itemMatchesFilters(
  item: DiscoveryItem,
  selectedFilters: SelectedDiscoveryFilters,
  ignoredType?: SearchSuggestionType,
): boolean {
  for (
    const type of
    FILTER_TYPES
  ) {
    if (
      type === ignoredType
    ) {
      continue
    }

    const selected =
      selectedFilters[type]

    if (!selected) {
      continue
    }

    if (
      !itemMatchesFilter(
        item,
        type,
        selected,
      )
    ) {
      return false
    }
  }

  return true
}

function itemMatchesFilter(
  item: DiscoveryItem,
  type: SearchSuggestionType,
  selected: SearchSuggestion,
): boolean {
  switch (type) {
    case "iem":
      return (
        item.iem.id ===
        selected.id
      )

    case "brand":
      return (
        item.brand.id ===
        selected.id
      )

    case "reviewer":
      return (
        item.reviewer.id ===
        selected.id
      )

    case "artist":
      return item.artists.some(
        (artist) =>
          artist.id ===
          selected.id,
      )

    case "genre":
      return item.genres.some(
        (genre) =>
          genre.id ===
          selected.id,
      )
  }
}

function collectSuggestions(
  items: DiscoveryItem[],
  type: SearchSuggestionType,
): SearchSuggestion[] {
  const suggestions =
    new Map<
      number,
      SearchSuggestion
    >()

  for (const item of items) {
    const entities =
      getEntitiesForType(
        item,
        type,
      )

    const uniqueEntities =
      new Map(
        entities.map(
          (entity) => [
            entity.id,
            entity,
          ],
        ),
      )

    for (
      const entity of
      uniqueEntities.values()
    ) {
      const existing =
        suggestions.get(
          entity.id,
        )

      if (existing) {
        existing.reviewCount += 1
      
        if (item.type === "review") {
          existing.reviewResultCount =
            (existing.reviewResultCount ?? 0) + 1
        } else {
          existing.impressionResultCount =
            (existing.impressionResultCount ?? 0) + 1
        }
      
        continue
      }

      suggestions.set(
        entity.id,
        {
          id: entity.id,
          type,
          name: entity.name,
          slug: entity.slug,

          subtitle:
            type === "iem" &&
            "brandName" in
              entity
              ? entity.brandName
              : undefined,

          reviewCount: 1,

          reviewResultCount:
            item.type === "review" ? 1 : 0,
          
          impressionResultCount:
            item.type === "impression" ? 1 : 0,
        },
      )
    }
  }

  return Array.from(
    suggestions.values(),
  ).sort(
    compareSuggestions,
  )
}

function getEntitiesForType(
  item: DiscoveryItem,
  type: SearchSuggestionType,
): Array<
  DiscoveryEntity | DiscoveryIem
> {
  switch (type) {
    case "iem":
      return [item.iem]

    case "brand":
      return [
        item.brand,
      ]

    case "reviewer":
      return [
        item.reviewer,
      ]

    case "artist":
      return item.artists

    case "genre":
      return item.genres
  }
}

function ensureSelectedSuggestion(
  suggestions:
    SearchSuggestion[],
  selected:
    SearchSuggestion | null,
): SearchSuggestion[] {
  if (!selected) {
    return suggestions
  }

  const alreadyPresent =
    suggestions.some(
      (suggestion) =>
        suggestion.id ===
          selected.id &&
        suggestion.type ===
          selected.type,
    )

  if (alreadyPresent) {
    return suggestions
  }

  return [
    {
      ...selected,
      reviewCount: 0,
    },
    ...suggestions,
  ]
}

function compareSuggestions(
  first: SearchSuggestion,
  second: SearchSuggestion,
): number {
  const countDifference =
    second.reviewCount -
    first.reviewCount

  if (
    countDifference !== 0
  ) {
    return countDifference
  }

  return first.name.localeCompare(
    second.name,
  )
}