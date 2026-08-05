import { supabase } from "./supabase"

import type {
  SearchSuggestion,
  SearchSuggestionType,
} from "../types/search"

type NamedRow = {
  id: number
  name: string
  slug?: string | null
}

type IemRow = {
  id: number
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function getSingleRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation ?? null
}

function mapNamedRows(
  rows: NamedRow[],
  type: SearchSuggestionType,
): SearchSuggestion[] {
  return rows.map((row) => ({
    id: Number(row.id),
    type,
    name: row.name,
    slug: row.slug || slugify(row.name),
  }))
}

export async function getSearchSuggestions(): Promise<
  SearchSuggestion[]
> {
  const [
    iemsResult,
    manufacturersResult,
    reviewersResult,
    artistsResult,
    genresResult,
  ] = await Promise.all([
    supabase
      .from("iems")
      .select(`
        id,
        model,
        manufacturers (
          name
        )
      `)
      .order("model", { ascending: true }),

    supabase
      .from("manufacturers")
      .select(`
        id,
        name
      `)
      .order("name", { ascending: true }),

    supabase
      .from("reviewers")
      .select(`
        id,
        name,
        slug
      `)
      .order("name", { ascending: true }),

    supabase
      .from("artists")
      .select(`
        id,
        name,
        slug
      `)
      .order("name", { ascending: true }),

    supabase
      .from("genres")
      .select(`
        id,
        name,
        slug
      `)
      .order("name", { ascending: true }),
  ])

  const firstError =
    iemsResult.error ||
    manufacturersResult.error ||
    reviewersResult.error ||
    artistsResult.error ||
    genresResult.error

  if (firstError) {
    throw firstError
  }

  const iemSuggestions = (
    (iemsResult.data ?? []) as unknown as IemRow[]
  ).map((row): SearchSuggestion => {
    const manufacturer = getSingleRelation(row.manufacturers)

    return {
      id: Number(row.id),
      type: "iem",
      name: row.model,
      slug: slugify(row.model),
      subtitle: manufacturer?.name,
    }
  })

  const manufacturerSuggestions = mapNamedRows(
    (manufacturersResult.data ?? []) as NamedRow[],
    "manufacturer",
  )

  const reviewerSuggestions = mapNamedRows(
    (reviewersResult.data ?? []) as NamedRow[],
    "reviewer",
  )

  const artistSuggestions = mapNamedRows(
    (artistsResult.data ?? []) as NamedRow[],
    "artist",
  )

  const genreSuggestions = mapNamedRows(
    (genresResult.data ?? []) as NamedRow[],
    "genre",
  )

  return [
    ...iemSuggestions,
    ...manufacturerSuggestions,
    ...reviewerSuggestions,
    ...artistSuggestions,
    ...genreSuggestions,
  ]
}