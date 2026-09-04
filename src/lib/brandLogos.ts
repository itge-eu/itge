import { supabase } from "./supabase"

export function getBrandLogoUrl(
  slug: string,
) {
  const { data } =
    supabase.storage
      .from("brand-avatars")
      .getPublicUrl(
        `avatars/${slug}.png`,
      )

  return data.publicUrl
}
