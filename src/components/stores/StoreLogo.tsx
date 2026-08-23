import {
  useEffect,
  useState,
} from "react"

import {
  getStoreLogoUrl,
  STORE_LOGO_EXTENSIONS,
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
  const [
    extensionIndex,
    setExtensionIndex,
  ] = useState(0)

  useEffect(() => {
    setExtensionIndex(0)
  }, [slug])

  const extension =
    STORE_LOGO_EXTENSIONS[
      extensionIndex
    ]

  if (!extension) {
    return null
  }

  return (
    <img
      src={getStoreLogoUrl(
        slug,
        extension,
      )}
      alt={`${name} logo`}
      loading={
        eager
          ? "eager"
          : "lazy"
      }
      decoding="async"
      onError={() => {
        setExtensionIndex(
          (current) =>
            current + 1,
        )
      }}
      className={`block object-contain object-center ${className}`}
    />
  )
}

export default StoreLogo