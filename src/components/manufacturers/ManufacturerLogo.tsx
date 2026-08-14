import {
  useEffect,
  useState,
} from "react"

import {
  getManufacturerLogoUrl,
  MANUFACTURER_LOGO_EXTENSIONS,
} from "../../lib/manufacturerLogos"

type ManufacturerLogoSize =
  | "card"
  | "hero"

type ManufacturerLogoProps = {
  name: string
  slug: string
  size?: ManufacturerLogoSize
  className?: string
  eager?: boolean
}

const SIZE_CLASSES: Record<
  ManufacturerLogoSize,
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

function ManufacturerLogo({
  name,
  slug,
  size = "card",
  className = "",
  eager = false,
}: ManufacturerLogoProps) {
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
      src={getManufacturerLogoUrl(
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

export default ManufacturerLogo