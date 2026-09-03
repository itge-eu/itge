import { supabase } from "./supabase"

import type {
  DiscoveryContentType,
  DiscoveryEntity,
  DiscoveryFilterSuggestion,
  DiscoveryFilterType,
  DiscoveryGearType,
  DiscoveryProduct,
  DiscoveryImpressionItem,
  DiscoveryItem,
  DiscoveryReviewItem,
  DiscoveryState,
  SelectedDiscoveryFilters,
} from "../types/discovery"

import type {
  ProductType,
} from "./products"

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

type RelatedProduct = {
  id: number
  model: string
  slug: string

  product_type:
    | ProductType
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

  body:
    | string
    | null

  hero_image_url:
    | string
    | null

  published_at:
    | string
    | null

  published: boolean

  reviewers:
    | RelatedReviewer
    | RelatedReviewer[]
    | null

  review_artists?:
    | ArtistRelationRow[]
    | null

  review_genres?:
    | GenreRelationRow[]
    | null
}

type DiscoveryReviewProductRow = {
  product_id: number

  products:
    | RelatedProduct
    | RelatedProduct[]
    | null

  reviews:
    | DiscoveryReviewRow
    | DiscoveryReviewRow[]
    | null
}

type DiscoveryImpressionRow = {
  id: number
  slug: string

  title:
    | string
    | null

  summary:
    | string
    | null

  body:
    | string
    | null

  hero_image_url:
    | string
    | null

  published_at:
    | string
    | null

  reviewers:
    | RelatedReviewer
    | RelatedReviewer[]
    | null

  products:
    | RelatedProduct
    | RelatedProduct[]
    | null

  impression_artists?:
    | ArtistRelationRow[]
    | null

  impression_genres?:
    | GenreRelationRow[]
    | null
}

const FILTER_TYPES:
  DiscoveryFilterType[] =
  [
    "gear_type",
    "product",
    "brand",
    "reviewer",
    "artist",
    "genre",
  ]

const GEAR_TYPES: Record<
  ProductType,
  DiscoveryGearType
> = {
  iem: {
    id: 1,
    name: "IEMs",
    slug: "iem",
  },

  headphone: {
    id: 2,
    name: "Headphones",
    slug: "headphone",
  },

  source: {
    id: 3,
    name: "Source gear",
    slug: "source",
  },

  cable_accessory: {
    id: 4,
    name:
      "Cables & accessories",
    slug:
      "cable_accessory",
  },
}

function normalizeProductType(
  value:
    | ProductType
    | null
    | undefined,
): ProductType {
  return (
    value ??
    "iem"
  )
}

function getGearType(
  value:
    | ProductType
    | null
    | undefined,
): DiscoveryGearType {
  return GEAR_TYPES[
    normalizeProductType(
      value,
    )
  ]
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

function mapArtists(
  rows:
    | ArtistRelationRow[]
    | null
    | undefined,
): DiscoveryEntity[] {
  return (
    rows ?? []
  ).flatMap(
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
          id:
            Number(
              artist.id,
            ),

          name:
            artist.name,

          slug:
            artist.slug,
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
  return (
    rows ?? []
  ).flatMap(
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
          id:
            Number(
              genre.id,
            ),

          name:
            genre.name,

          slug:
            genre.slug,
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

  productRelation:
    | RelatedProduct
    | RelatedProduct[]
    | null,

  itemLabel: string,
) {
  const reviewer =
    getSingleRelation(
      reviewerRelation,
    )

  const product =
    getSingleRelation(
      productRelation,
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
      `${itemLabel} has incomplete discovery data`,
    )
  }

  const gearType =
    getGearType(
      product.product_type,
    )

  const brandEntity:
    DiscoveryEntity = {
      id:
        Number(
          brand.id,
        ),

      name:
        brand.name,

      slug:
        brand.slug,
    }

  const productEntity:
    DiscoveryProduct = {
      id:
        Number(
          product.id,
        ),

      name:
        product.model,

      slug:
        product.slug,

      brandId:
        Number(
          brand.id,
        ),

      brandName:
        brand.name,

      gearType,
    }

  const reviewerEntity:
    DiscoveryEntity = {
      id:
        Number(
          reviewer.id,
        ),

      name:
        reviewer.name,

      slug:
        reviewer.slug,
    }

  return {
    reviewer,
    product,
    brand,
    gearType,
    brandEntity,
    productEntity,
    reviewerEntity,
  }
}

function mapDiscoveryReviewProduct(
  row:
    DiscoveryReviewProductRow,
): DiscoveryReviewItem {
  const review =
    getSingleRelation(
      row.reviews,
    )

  const product =
    getSingleRelation(
      row.products,
    )

  if (
    !review ||
    !product
  ) {
    throw new Error(
      `Review product link for product ${row.product_id} has incomplete discovery data`,
    )
  }

  const entities =
    buildCommonEntities(
      review.reviewers,
      product,
      `Review ${review.id}`,
    )

  return {
    type: "review",

    publishedAt:
      review.published_at,

    review: {
      id:
        Number(
          review.id,
        ),

      slug:
        review.slug,

      rating:
        Number(
          review.rating,
        ),

      title:
        review.title,

      summary:
        review.summary,

      body:
        review.body,

      brand:
        entities.brand
          .name,

      brandSlug:
        entities.brand
          .slug,

      model:
        entities.product
          .model,

      productSlug:
        entities.product
          .slug,

      reviewer:
        entities.reviewer
          .name,

      reviewerSlug:
        entities.reviewer
          .slug,

      heroImageUrl:
        review.hero_image_url ??
        entities.product
          .hero_image_url ??
        null,

      publishedAt:
        review.published_at,
    },

    gearType:
      entities.gearType,

    product:
      entities.productEntity,

    brand:
      entities.brandEntity,

    reviewer:
      entities.reviewerEntity,

    artists:
      mapArtists(
        review.review_artists,
      ),

    genres:
      mapGenres(
        review.review_genres,
      ),
  }
}

function mapDiscoveryImpression(
  row:
    DiscoveryImpressionRow,
): DiscoveryImpressionItem {
  const entities =
    buildCommonEntities(
      row.reviewers,
      row.products,
      `Impression ${row.id}`,
    )

  return {
    type:
      "impression",

    publishedAt:
      row.published_at,

    impression: {
      id:
        Number(
          row.id,
        ),

      slug:
        row.slug,

      title:
        row.title,

      summary:
        row.summary,

      body:
        row.body,

      heroImageUrl:
        row.hero_image_url ??
        entities.product
          .hero_image_url ??
        null,

      publishedAt:
        row.published_at,

      reviewer: {
        id:
          Number(
            entities.reviewer
              .id,
          ),

        name:
          entities.reviewer
            .name,

        slug:
          entities.reviewer
            .slug,
      },

      product: {
        id:
          Number(
            entities.product
              .id,
          ),

        model:
          entities.product
            .model,

        slug:
          entities.product
            .slug,

        brand: {
          id:
            Number(
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

    gearType:
      entities.gearType,

    product:
      entities.productEntity,

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
  value:
    | string
    | null,
): number {
  if (!value) {
    return 0
  }

  const valueAsTime =
    new Date(
      value,
    ).getTime()

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
    reviewProductsResult,
    impressionsResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "review_products",
        )
        .select(`
          product_id,

          products (
            id,
            model,
            slug,
            product_type,
            hero_image_url,

            brands (
              id,
              name,
              slug
            )
          ),

          reviews (
            id,
            slug,
            rating,
            title,
            summary,
            body,
            hero_image_url,
            published_at,
            published,

            reviewers (
              id,
              name,
              slug
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
          )
        `),

      supabase
        .from(
          "impressions",
        )
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

          products (
            id,
            model,
            slug,
            product_type,
            hero_image_url,

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

  if (
    reviewProductsResult.error
  ) {
    throw reviewProductsResult.error
  }

  if (
    impressionsResult.error
  ) {
    throw impressionsResult.error
  }

  const reviewProductRows =
    (
      reviewProductsResult.data ??
      []
    ) as unknown as DiscoveryReviewProductRow[]

  const impressionRows =
    (
      impressionsResult.data ??
      []
    ) as unknown as DiscoveryImpressionRow[]

  const reviewItems =
    reviewProductRows.flatMap(
      (row) => {
        const review =
          getSingleRelation(
            row.reviews,
          )

        if (
          !review ||
          !review.published
        ) {
          return []
        }

        return [
          mapDiscoveryReviewProduct(
            row,
          ),
        ]
      },
    )

  const items:
    DiscoveryItem[] =
    [
      ...reviewItems,

      ...impressionRows.map(
        mapDiscoveryImpression,
      ),
    ]

  return items.sort(
    (
      first,
      second,
    ) =>
      timestampValue(
        second.publishedAt,
      ) -
      timestampValue(
        first.publishedAt,
      ),
  )
}

export function buildDiscoveryState(
  discoveryItems:
    DiscoveryItem[],

  selectedFilters:
    SelectedDiscoveryFilters,

  contentType:
    DiscoveryContentType,
): DiscoveryState {
  const itemsForContentType =
    discoveryItems.filter(
      (item) =>
        contentType ===
          "all" ||
        item.type ===
          contentType,
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
    gear_type:
      buildSuggestionsForType(
        itemsForContentType,
        selectedFilters,
        "gear_type",
      ),

    product:
      buildSuggestionsForType(
        itemsForContentType,
        selectedFilters,
        "product",
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
  discoveryItems:
    DiscoveryItem[],

  selectedFilters:
    SelectedDiscoveryFilters,

  type:
    DiscoveryFilterType,
): DiscoveryFilterSuggestion[] {
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

  return ensureSelectedSuggestions(
    suggestions,
    getSelectedItemsForType(
      selectedFilters,
      type,
    ),
  )
}

function itemMatchesFilters(
  item:
    DiscoveryItem,

  selectedFilters:
    SelectedDiscoveryFilters,

  ignoredType?:
    DiscoveryFilterType,
): boolean {
  for (
    const type of
    FILTER_TYPES
  ) {
    if (
      type ===
      ignoredType
    ) {
      continue
    }

    const selectedItems =
      getSelectedItemsForType(
        selectedFilters,
        type,
      )

    if (
      selectedItems.length ===
      0
    ) {
      continue
    }

    const matchesOne =
      selectedItems.some(
        (selected) =>
          itemMatchesFilter(
            item,
            type,
            selected,
          ),
      )

    if (!matchesOne) {
      return false
    }
  }

  return true
}

function getSelectedItemsForType(
  selectedFilters:
    SelectedDiscoveryFilters,

  type:
    DiscoveryFilterType,
): DiscoveryFilterSuggestion[] {
  switch (type) {
    case "gear_type":
      return selectedFilters.gear_type

    case "product":
      return selectedFilters.product

    case "brand":
      return selectedFilters.brand

    case "reviewer":
      return selectedFilters.reviewer

    case "artist":
      return selectedFilters.artist

    case "genre":
      return selectedFilters.genre
  }
}

function itemMatchesFilter(
  item:
    DiscoveryItem,

  type:
    DiscoveryFilterType,

  selected:
    DiscoveryFilterSuggestion,
): boolean {
  switch (type) {
    case "gear_type":
      return (
        item.gearType.id ===
        selected.id
      )

    case "product":
      return (
        item.product.id ===
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
  items:
    DiscoveryItem[],

  type:
    DiscoveryFilterType,
): DiscoveryFilterSuggestion[] {
  const suggestions =
    new Map<
      number,
      DiscoveryFilterSuggestion
    >()

  for (
    const item of
    items
  ) {
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
        existing.reviewCount +=
          1

        if (
          item.type ===
          "review"
        ) {
          existing.reviewResultCount =
            (
              existing.reviewResultCount ??
              0
            ) + 1
        } else {
          existing.impressionResultCount =
            (
              existing.impressionResultCount ??
              0
            ) + 1
        }

        continue
      }

      suggestions.set(
        entity.id,
        {
          id:
            entity.id,

          type,

          name:
            entity.name,

          slug:
            entity.slug,

          subtitle:
            type ===
              "product" &&
            "brandName" in
              entity
              ? entity.brandName
              : undefined,

          reviewCount:
            1,

          reviewResultCount:
            item.type ===
            "review"
              ? 1
              : 0,

          impressionResultCount:
            item.type ===
            "impression"
              ? 1
              : 0,
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
  item:
    DiscoveryItem,

  type:
    DiscoveryFilterType,
): Array<
  | DiscoveryEntity
  | DiscoveryProduct
> {
  switch (type) {
    case "gear_type":
      return [
        item.gearType,
      ]

    case "product":
      return [
        item.product,
      ]

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

function ensureSelectedSuggestions(
  suggestions:
    DiscoveryFilterSuggestion[],

  selectedItems:
    DiscoveryFilterSuggestion[],
): DiscoveryFilterSuggestion[] {
  const missingSelected =
    selectedItems.filter(
      (selected) =>
        !suggestions.some(
          (suggestion) =>
            suggestion.id ===
              selected.id &&
            suggestion.type ===
              selected.type,
        ),
    )

  if (
    missingSelected.length ===
    0
  ) {
    return suggestions
  }

  return [
    ...missingSelected.map(
      (selected) => ({
        ...selected,
        reviewCount:
          0,
      }),
    ),

    ...suggestions,
  ]
}

function compareSuggestions(
  first:
    DiscoveryFilterSuggestion,

  second:
    DiscoveryFilterSuggestion,
): number {
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
}