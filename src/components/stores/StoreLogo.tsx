import {
  getStoreLogoUrl,
} from "../../lib/storeLogos"

type StoreLogoProps = {
  name: string
  slug: string
  className?: string
  eager?: boolean
}

function StoreLogo({
  name,
  slug,
  className = "",
  eager = false,
}: StoreLogoProps) {
  return (
    <img
      src={getStoreLogoUrl(
        slug,
      )}
      alt={`${name} logo`}
      loading={
        eager
          ? "eager"
          : "lazy"
      }
      decoding="async"
      className={`block object-contain object-center ${className}`}
    />
  )
}

export default StoreLogo
