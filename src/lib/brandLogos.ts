import { supabase } from "./supabase"

export const MANUFACTURER_LOGO_EXTENSIONS = [
  "webp",
  "png",
  "jpg",
  "jpeg",
  "svg",
] as const

export type BrandLogoExtension =
  (typeof MANUFACTURER_LOGO_EXTENSIONS)[number]

export function getBrandLogoUrl(
  slug: string,
  extension: BrandLogoExtension,
) {
  const { data } =
    supabase.storage
      .from("brand-avatars")
      .getPublicUrl(
        `avatars/${slug}.${extension}`,
      )

  return data.publicUrl
}