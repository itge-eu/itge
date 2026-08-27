import { Link } from "react-router"

type ReviewsHeaderProps = {
  artistName: string | null
  genreName: string | null
  additionalFilterType?: string | null
  additionalFilterName?: string | null
  hasFilters: boolean
}

function ReviewsHeader({
  artistName,
  genreName,
  additionalFilterType,
  additionalFilterName,
  hasFilters,
}: ReviewsHeaderProps) {
  let heading = "Reviews"
  let description = "Browse every published review on ITGE."

  if (artistName && genreName) {
    heading = `Reviews mentioning ${artistName} in ${genreName}`
    description =
      `Published ITGE reviews tagged with ${genreName} ` +
      `that mention ${artistName}.`
  } else if (artistName) {
    heading = `Reviews mentioning ${artistName}`
    description =
      `Published ITGE reviews that mention ${artistName}.`
  } else if (genreName) {
    heading = `${genreName} reviews`
    description =
      `Published ITGE reviews covering ${genreName}.`
  } else if (additionalFilterName) {
    switch (additionalFilterType) {
      case "product":
        heading = `Reviews of ${additionalFilterName}`
        description =
          `Published ITGE reviews of ${additionalFilterName}.`
        break

      case "brand":
        heading = `${additionalFilterName} reviews`
        description =
          `Published ITGE reviews of IEMs by ${additionalFilterName}.`
        break

      case "reviewer":
        heading = `Reviews by ${additionalFilterName}`
        description =
          `Published ITGE reviews written by ${additionalFilterName}.`
        break

      default:
        heading = "Filtered reviews"
        description = "Published ITGE reviews matching this filter."
    }
  } else if (hasFilters) {
    heading = "Filtered reviews"
    description = "No matching filter was found."
  }

  return (
    <header className="mb-10">
      {hasFilters && (
        <Link
          to="/reviews"
          className="mb-6 inline-block text-sm font-medium text-[var(--accent)] transition hover:opacity-75"
        >
          ← Back to all reviews
        </Link>
      )}

      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        {heading}
      </h1>

      <p className="mt-3 text-[var(--muted)]">
        {description}
      </p>
    </header>
  )
}

export default ReviewsHeader