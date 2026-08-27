export type SearchSuggestionType =
  | "product"
  | "brand"
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
  
  reviewResultCount?: number
  impressionResultCount?: number
}