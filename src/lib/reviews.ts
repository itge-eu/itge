import { supabase } from "./supabase"

export type FeaturedReview = {
  id: number
  slug: string
  rating: number
  title: string
  summary: string
  brand: string
  model: string
  reviewer: string
  heroImageUrl: string | null
}

export type FullReview = FeaturedReview & {
  body: string | null
  pros: string | null;
  cons: string | null;
}

type ReviewRow = {
  id: number
  slug: string
  rating: number
  title: string
  summary: string
  body?: string | null
  pros?: string | null
  cons?: string | null
  hero_image_url: string | null
  reviewers: {
    name: string
  } | null
  iems: {
    model: string
    manufacturers: {
      name: string
    } | null
  } | null
}

function mapReview(row: ReviewRow): FeaturedReview {
  if (!row.reviewers || !row.iems || !row.iems.manufacturers) {
    throw new Error(`Review ${row.id} has incomplete related data`)
  }

  return {
    id: row.id,
    slug: row.slug,
    rating: Number(row.rating),
    title: row.title,
    summary: row.summary,
    reviewer: row.reviewers.name,
    model: row.iems.model,
    brand: row.iems.manufacturers.name,
    heroImageUrl: row.hero_image_url,
  }
}

export async function getFeaturedReviews(): Promise<FeaturedReview[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      slug,
      rating,
      title,
      summary,
      hero_image_url,
      reviewers (
        name
      ),
      iems (
        model,
        manufacturers (
          name
        )
      )
    `)
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  const rows = (data ?? []) as unknown as ReviewRow[]

  return rows.map(mapReview)
}

export async function getReviewBySlug(
  slug: string,
): Promise<FullReview | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      slug,
      rating,
      title,
      summary,
	  pros,
	  cons,
      body,
      hero_image_url,
      reviewers (
        name
      ),
      iems (
        model,
        manufacturers (
          name
        )
      )
    `)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  const row = data as unknown as ReviewRow

  return {
    ...mapReview(row),
    body: row.body ?? null,
    pros: row.pros ?? null,
    cons: row.cons ?? null,
  }
}