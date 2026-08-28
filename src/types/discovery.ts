import type { FeaturedReview } from "../lib/reviews"
import type { ImpressionSummary } from "../lib/impressions"

import type {
  SearchSuggestion,
  SearchSuggestionType,
} from "./search"

export type DiscoveryContentType =
  | "all"
  | "review"
  | "impression"

export type DiscoveryFilterType =
  | "gear_type"
  | SearchSuggestionType

export type DiscoveryFilterSuggestion =
  Omit<SearchSuggestion, "type"> & {
    type: DiscoveryFilterType
  }

export type DiscoveryEntity = {
  id: number
  name: string
  slug: string
}

export type DiscoveryGearType =
  DiscoveryEntity

export type DiscoveryProduct =
  DiscoveryEntity & {
    brandId: number
    brandName: string
    gearType: DiscoveryGearType
  }

type DiscoveryItemBase = {
  publishedAt: string | null

  gearType: DiscoveryGearType
  product: DiscoveryProduct
  brand: DiscoveryEntity
  reviewer: DiscoveryEntity

  artists: DiscoveryEntity[]
  genres: DiscoveryEntity[]
}

export type DiscoveryReviewItem =
  DiscoveryItemBase & {
    type: "review"
    review: FeaturedReview
  }

export type DiscoveryImpressionItem =
  DiscoveryItemBase & {
    type: "impression"
    impression: ImpressionSummary
  }

export type DiscoveryItem =
  | DiscoveryReviewItem
  | DiscoveryImpressionItem

export type SelectedDiscoveryFilters =
  Record<
    DiscoveryFilterType,
    DiscoveryFilterSuggestion | null
  >

export type DiscoverySuggestions =
  Record<
    DiscoveryFilterType,
    DiscoveryFilterSuggestion[]
  >

export type DiscoveryState = {
  matchingItems: DiscoveryItem[]
  suggestions: DiscoverySuggestions
}

export const EMPTY_DISCOVERY_FILTERS: SelectedDiscoveryFilters =
  {
    gear_type: null,
    product: null,
    brand: null,
    reviewer: null,
    artist: null,
    genre: null,
  }

export const EMPTY_DISCOVERY_SUGGESTIONS: DiscoverySuggestions =
  {
    gear_type: [],
    product: [],
    brand: [],
    reviewer: [],
    artist: [],
    genre: [],
  }