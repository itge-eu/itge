export function getStoreLogoUrl(
  slug: string,
) {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/store-avatars/avatars/${slug}.png`
}
