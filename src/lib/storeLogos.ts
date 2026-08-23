export const STORE_LOGO_EXTENSIONS = [
  "svg",
  "png",
  "webp",
  "jpg",
  "jpeg",
] as const

export type StoreLogoExtension =
  (typeof STORE_LOGO_EXTENSIONS)[number]

export function getStoreLogoUrl(
  slug: string,
  extension: StoreLogoExtension,
) {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/store-avatars/avatars/${slug}.${extension}`
}