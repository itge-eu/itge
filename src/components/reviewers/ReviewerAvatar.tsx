import { useEffect, useState } from "react"

import { getReviewerAvatarUrl } from "../../lib/reviewerAvatars"

type ReviewerAvatarSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"

type ReviewerAvatarShape =
  | "circle"
  | "rounded"

type ReviewerAvatarProps = {
  name: string
  slug: string
  size?: ReviewerAvatarSize
  shape?: ReviewerAvatarShape
  className?: string
  eager?: boolean
}

const SIZE_CLASSES: Record<
  ReviewerAvatarSize,
  string
> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-28 w-28 text-3xl",
}

const SHAPE_CLASSES: Record<
  ReviewerAvatarShape,
  string
> = {
  circle: "rounded-full",
  rounded: "rounded-2xl",
}

function ReviewerAvatar({
  name,
  slug,
  size = "md",
  shape = "circle",
  className = "",
  eager = false,
}: ReviewerAvatarProps) {
  const [imageFailed, setImageFailed] =
    useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [slug])

  const sizeClass = SIZE_CLASSES[size]
  const shapeClass = SHAPE_CLASSES[shape]

  if (imageFailed) {
    return (
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--surface-soft)] font-semibold text-[var(--accent)] ${sizeClass} ${shapeClass} ${className}`}
      >
        {getInitials(name)}
      </span>
    )
  }

  return (
    <img
      src={getReviewerAvatarUrl(slug)}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setImageFailed(true)}
      className={`shrink-0 border border-[var(--border)] bg-[var(--surface-soft)] object-cover ${sizeClass} ${shapeClass} ${className}`}
    />
  )
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return initials || "?"
}

export default ReviewerAvatar