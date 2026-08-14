import { supabase } from "./supabase"

export const MANUFACTURER_LOGO_EXTENSIONS = [
  "webp",
  "png",
  "jpg",
  "jpeg",
  "svg",
] as const

export type ManufacturerLogoExtension =
  (typeof MANUFACTURER_LOGO_EXTENSIONS)[number]

export function getManufacturerLogoUrl(
  slug: string,
  extension: ManufacturerLogoExtension,
) {
  const { data } =
    supabase.storage
      .from("manufacturer-avatars")
      .getPublicUrl(
        `avatars/${slug}.${extension}`,
      )

  return data.publicUrl
}