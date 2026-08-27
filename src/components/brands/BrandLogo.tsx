import {
  useEffect,
  useState,
} from "react"

import {
  getBrandLogoUrl,
  MANUFACTURER_LOGO_EXTENSIONS,
} from "../../lib/brandLogos"

type BrandLogoSize =
  | "card"
  | "hero"

type BrandLogoProps = {
  name: string
  slug: string
  size?: BrandLogoSize
  className?: string
  eager?: boolean
}

const SIZE_CLASSES: Record<
  BrandLogoSize,
  string
> = {
  card:
    "max-h-14 max-w-[42%]",

  /*
   * Hero logo may use practically the whole
   * available panel. The surrounding panel
   * itself provides the padding.
   */
  hero:
    "h-full w-full max-h-full max-w-full",
}

function BrandLogo({
  name,
  slug,
  size = "card",
  className = "",
  eager = false,
}: BrandLogoProps) {
  const [
    extensionIndex,
    setExtensionIndex,
  ] = useState(0)

  useEffect(() => {
    setExtensionIndex(0)
  }, [slug])

  const extension =
    MANUFACTURER_LOGO_EXTENSIONS[
      extensionIndex
    ]

  if (!extension) {
    return null
  }

  return (
    <img
      src={getBrandLogoUrl(
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
      className={`block object-contain object-center ${SIZE_CLASSES[size]} ${className}`}
    />
  )
}

export default BrandLogo