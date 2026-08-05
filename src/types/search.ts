export type SearchSuggestionType =
  | "iem"
  | "manufacturer"
  | "reviewer"
  | "artist"
  | "genre"

export type SearchSuggestion = {
  id: number
  type: SearchSuggestionType
  name: string
  slug: string
  subtitle?: string
  reviewCount: number
}