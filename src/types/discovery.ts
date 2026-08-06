import type { FeaturedReview } from "../lib/reviews"
import type {
  SearchSuggestion,
  SearchSuggestionType,
} from "./search"

export type DiscoveryEntity = {
  id: number
  name: string
  slug: string
}

export type DiscoveryIem = DiscoveryEntity & {
  manufacturerId: number
  manufacturerName: string
}

export type DiscoveryReview = {
  review: FeaturedReview

  iem: DiscoveryIem
  manufacturer: DiscoveryEntity
  reviewer: DiscoveryEntity

  artists: DiscoveryEntity[]
  genres: DiscoveryEntity[]
}

export type SelectedDiscoveryFilters = Record<
  SearchSuggestionType,
  SearchSuggestion | null
>

export type DiscoverySuggestions = Record<
  SearchSuggestionType,
  SearchSuggestion[]
>

export type DiscoveryState = {
  matchingReviews: FeaturedReview[]
  suggestions: DiscoverySuggestions
}

export const EMPTY_DISCOVERY_FILTERS: SelectedDiscoveryFilters = {
  iem: null,
  manufacturer: null,
  reviewer: null,
  artist: null,
  genre: null,
}

export const EMPTY_DISCOVERY_SUGGESTIONS: DiscoverySuggestions = {
  iem: [],
  manufacturer: [],
  reviewer: [],
  artist: [],
  genre: [],
}