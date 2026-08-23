import {
  supabase,
} from "./supabase"

export type Store = {
  id: number
  name: string
  slug: string
  website: string | null
  country: string | null
  description: string | null
}

export async function getSupportingStores(): Promise<
  Store[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("stores")
      .select(`
        id,
        name,
        slug,
        website,
        country,
        description
      `)
      .eq(
        "supports_itge",
        true,
      )
      .order(
        "name",
        {
          ascending: true,
        },
      )

  if (error) {
    throw error
  }

  return (
    data ?? []
  ).map(
    (store) => ({
      id:
        Number(
          store.id,
        ),

      name:
        store.name,

      slug:
        store.slug,

      website:
        store.website ??
        null,

      country:
        store.country ??
        null,

      description:
        store.description ??
        null,
    }),
  )
}