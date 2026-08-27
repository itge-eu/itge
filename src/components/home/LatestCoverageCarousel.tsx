import { Link } from "react-router"

import type {
  FeaturedReview,
} from "../../lib/reviews"

import type {
  ImpressionSummary,
} from "../../lib/impressions"

export type LatestCoverageItem =
  | {
      type: "review"
      id: number
      slug: string
      brand: string
      model: string
      member: string
      rating: number
      heroImageUrl: string
    }
  | {
      type: "impression"
      id: number
      slug: string
      brand: string
      model: string
      member: string
      heroImageUrl: string
    }

type LatestCoverageCarouselProps = {
  items: LatestCoverageItem[]
}

function LatestCoverageCarousel({
  items,
}: LatestCoverageCarouselProps) {
  if (items.length === 0) {
    return null
  }

  /*
   * Duplicate the sequence so the CSS animation
   * can loop continuously without a visible jump.
   */
  const repeatedItems = [
    ...items,
    ...items,
  ]

  return (
    <div className="coverage-carousel overflow-hidden">
      <div className="coverage-carousel-track flex w-max gap-4 px-4 sm:gap-5">
        {repeatedItems.map(
          (
            item,
            index,
          ) => (
            <CoverageTile
              key={`${item.type}-${item.id}-${index}`}
              item={item}
              duplicate={
                index >=
                items.length
              }
            />
          ),
        )}
      </div>
    </div>
  )
}

function CoverageTile({
  item,
  duplicate,
}: {
  item: LatestCoverageItem
  duplicate: boolean
}) {
  const url =
    item.type === "review"
      ? `/reviews/${item.slug}`
      : `/impressions/${item.slug}`

  return (
    <Link
      to={url}
      aria-hidden={
        duplicate
          ? "true"
          : undefined
      }
      tabIndex={
        duplicate
          ? -1
          : undefined
      }
      className="group relative block aspect-[4/3] w-[72vw] max-w-[340px] shrink-0 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] sm:w-[300px] lg:w-[320px]"
    >
      <img
        src={
          item.heroImageUrl
        }
        alt={`${item.brand} ${item.model}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

      <div className="relative flex h-full flex-col p-5 text-white">
        <div>
          <span className="rounded-full border border-white/25 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur-sm">
            {item.type ===
            "review"
              ? "Review"
              : "Impression"}
          </span>
        </div>

        <div className="mt-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            {item.brand}
          </p>

          <h3 className="mt-1 text-2xl font-semibold leading-tight">
            {item.model}
          </h3>

          <div className="mt-3 flex items-center justify-between gap-4 text-xs text-white/75">
            <span>
              {item.type ===
              "review"
                ? `Reviewed by ${item.member}`
                : `Impression by ${item.member}`}
            </span>

            {item.type ===
              "review" && (
              <span className="shrink-0 rounded-full border border-white/25 bg-black/20 px-2 py-1 font-semibold text-white">
                {item.rating.toFixed(
                  1,
                )}
                /5
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export function buildLatestCoverageItems(
  reviews: FeaturedReview[],
  impressions: ImpressionSummary[],
): LatestCoverageItem[] {
  const reviewItems =
    reviews
      .filter(
        (review) =>
          Boolean(
            review.heroImageUrl,
          ),
      )
      .map((review) => ({
        type:
          "review" as const,

        id:
          review.id,

        slug:
          review.slug,

        brand:
          review.brand,

        model:
          review.model,

        member:
          review.reviewer,

        rating:
          review.rating,

        heroImageUrl:
          review.heroImageUrl!,
        
        publishedAt:
          review.publishedAt,
      }))

  const impressionItems =
    impressions
      .filter(
        (impression) =>
          Boolean(
            impression.heroImageUrl,
          ),
      )
      .map(
        (impression) => ({
          type:
            "impression" as const,

          id:
            impression.id,

          slug:
            impression.slug,

          brand:
            impression.iem
              .manufacturer
              .name,

          model:
            impression.iem
              .model,

          member:
            impression.reviewer
              .name,

          heroImageUrl:
            impression.heroImageUrl!,

          publishedAt:
            impression.publishedAt,
        }),
      )

  return [
    ...reviewItems,
    ...impressionItems,
  ]
    .sort(
      (
        first,
        second,
      ) =>
        timestamp(
          second.publishedAt,
        ) -
        timestamp(
          first.publishedAt,
        ),
    )
    .slice(
      0,
      16,
    )
    .map(
      ({
        publishedAt:
          _publishedAt,
        ...item
      }) => item,
    )
}

function timestamp(
  value:
    | string
    | null
    | undefined,
): number {
  if (!value) {
    return 0
  }

  const parsed =
    new Date(
      value,
    ).getTime()

  return Number.isNaN(
    parsed,
  )
    ? 0
    : parsed
}

export default LatestCoverageCarousel