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

export type DiscoveryEntity = {
  id: number
  name: string
  slug: string
}

export type DiscoveryProduct =
  DiscoveryEntity & {
    brandId: number
    brandName: string
  }

type DiscoveryItemBase = {
  publishedAt: string | null

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
    SearchSuggestionType,
    SearchSuggestion | null
  >

export type DiscoverySuggestions =
  Record<
    SearchSuggestionType,
    SearchSuggestion[]
  >

export type DiscoveryState = {
  matchingItems: DiscoveryItem[]
  suggestions: DiscoverySuggestions
}

export const EMPTY_DISCOVERY_FILTERS: SelectedDiscoveryFilters =
  {
    product: null,
    brand: null,
    reviewer: null,
    artist: null,
    genre: null,
  }

export const EMPTY_DISCOVERY_SUGGESTIONS: DiscoverySuggestions =
  {
    product: [],
    brand: [],
    reviewer: [],
    artist: [],
    genre: [],
  }