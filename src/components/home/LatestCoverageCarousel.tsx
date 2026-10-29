import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import {
  Link,
} from "react-router"

import type {
  FeaturedReview,
} from "../../lib/reviews"

import type {
  ImpressionSummary,
} from "../../lib/impressions"

import {
  useSeasonalTheme,
} from "../../context/SeasonalThemeContext"

export type LatestCoverageItem =
  | {
      type: "review"
      id: number
      slug: string
      productSlug: string
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
      productSlug: string
      brand: string
      model: string
      member: string
      heroImageUrl: string
    }

type LatestCoverageCarouselProps = {
  items: LatestCoverageItem[]
}

const MANUAL_PAUSE_DURATION =
  7000

const AUTO_SCROLL_SPEED =
  0.08

function LatestCoverageCarousel({
  items,
}: LatestCoverageCarouselProps) {
    const {
    halloweenMode,
  } =
    useSeasonalTheme()

  const scrollRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  const animationFrameRef =
    useRef<number | null>(
      null,
    )

  const lastFrameTimeRef =
    useRef<number | null>(
      null,
    )

  const resumeTimeoutRef =
    useRef<number | null>(
      null,
    )

  const [
    manualPause,
    setManualPause,
  ] =
    useState(false)

  const [
    interactionPause,
    setInteractionPause,
  ] =
    useState(false)

  const repeatedItems = [
    ...items,
    ...items,
  ]

  const getSingleSetWidth =
    useCallback(() => {
      const container =
        scrollRef.current

      if (!container) {
        return 0
      }

      return (
        container.scrollWidth /
        2
      )
    }, [])

  const getScrollDistance =
    useCallback(() => {
      const container =
        scrollRef.current

      if (!container) {
        return 320
      }

      const firstCard =
        container.querySelector<HTMLElement>(
          "[data-coverage-card]",
        )

      if (!firstCard) {
        return 320
      }

      const styles =
        window.getComputedStyle(
          container,
        )

      const gap =
        Number.parseFloat(
          styles.columnGap ||
            styles.gap ||
            "0",
        ) || 0

      return (
        firstCard.offsetWidth +
        gap
      )
    }, [])

  const normalizeScrollPosition =
    useCallback(() => {
      const container =
        scrollRef.current

      if (!container) {
        return
      }

      const singleSetWidth =
        getSingleSetWidth()

      if (
        singleSetWidth <= 0
      ) {
        return
      }

      if (
        container.scrollLeft >=
        singleSetWidth
      ) {
        container.scrollLeft -=
          singleSetWidth
      }

      if (
        container.scrollLeft <
        0
      ) {
        container.scrollLeft +=
          singleSetWidth
      }
    }, [
      getSingleSetWidth,
    ])

  useEffect(() => {
    if (
      items.length < 2 ||
      manualPause ||
      interactionPause
    ) {
      lastFrameTimeRef.current =
        null

      return
    }

    const animate = (
      time: number,
    ) => {
      const container =
        scrollRef.current

      if (!container) {
        return
      }

      if (
        lastFrameTimeRef.current ===
        null
      ) {
        lastFrameTimeRef.current =
          time
      }

      const elapsed =
        time -
        lastFrameTimeRef.current

      lastFrameTimeRef.current =
        time

      container.scrollLeft +=
        AUTO_SCROLL_SPEED *
        elapsed

      normalizeScrollPosition()

      animationFrameRef.current =
        window.requestAnimationFrame(
          animate,
        )
    }

    animationFrameRef.current =
      window.requestAnimationFrame(
        animate,
      )

    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        )

        animationFrameRef.current =
          null
      }

      lastFrameTimeRef.current =
        null
    }
  }, [
    items.length,
    manualPause,
    interactionPause,
    normalizeScrollPosition,
  ])

  const registerManualInteraction =
    useCallback(() => {
      setManualPause(
        true,
      )

      if (
        resumeTimeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          resumeTimeoutRef.current,
        )
      }

      resumeTimeoutRef.current =
        window.setTimeout(
          () => {
            setManualPause(
              false,
            )

            resumeTimeoutRef.current =
              null
          },
          MANUAL_PAUSE_DURATION,
        )
    }, [])

  const handleManualScroll =
    useCallback(
      (
        direction:
          | "previous"
          | "next",
      ) => {
        const container =
          scrollRef.current

        if (!container) {
          return
        }

        registerManualInteraction()

        const distance =
          getScrollDistance()

        if (
          direction ===
            "previous" &&
          container.scrollLeft <
            distance
        ) {
          const singleSetWidth =
            getSingleSetWidth()

          container.scrollLeft +=
            singleSetWidth
        }

        container.scrollBy({
          left:
            direction ===
            "next"
              ? distance
              : -distance,

          behavior: "smooth",
        })
      },
      [
        getScrollDistance,
        getSingleSetWidth,
        registerManualInteraction,
      ],
    )

  useEffect(() => {
    return () => {
      if (
        resumeTimeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          resumeTimeoutRef.current,
        )
      }
    }
  }, [])

  if (items.length === 0) {
    return null
  }

  return (
    <div
      className="relative"
      onMouseEnter={() =>
        setInteractionPause(
          true,
        )
      }
      onMouseLeave={() =>
        setInteractionPause(
          false,
        )
      }
      onFocusCapture={() =>
        setInteractionPause(
          true,
        )
      }
      onBlurCapture={(
        event,
      ) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as
              | Node
              | null,
          )
        ) {
          setInteractionPause(
            false,
          )
        }
      }}
    >
      <div
        className="overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, black 60px, black calc(100% - 60px), transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0, black 60px, black calc(100% - 60px), transparent 100%)",
        }}
      >
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-hidden px-4 sm:gap-5"
        >
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
                halloween={
                  halloweenMode
                }
              />
            ),
          )}
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous coverage"
            onClick={() =>
              handleManualScroll(
                "previous",
              )
            }
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-2xl leading-none text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] sm:left-5"
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Next coverage"
            onClick={() =>
              handleManualScroll(
                "next",
              )
            }
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-2xl leading-none text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] sm:right-5"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}

function CoverageTile({
  item,
  duplicate,
  halloween,
}: {
  item: LatestCoverageItem
  duplicate: boolean
  halloween: boolean
}) {
  const url =
    item.type === "review"
      ? `/reviews/${item.slug}`
      : `/impressions/${item.slug}`

  const dripVariant =
    halloween
      ? getHalloweenDripVariant(
          item,
        )
      : null

  return (
    <Link
      to={url}
      data-coverage-card
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

      {dripVariant !== null && (
        <HalloweenDrips
          variant={
            dripVariant
          }
        />
      )}

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
                <span className="text-[var(--accent)]">
                  ★
                </span>{" "}
                {item.rating.toFixed(
                  1,
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

type HalloweenDripVariant =
  | 0
  | 1
  | 2
  | 3

function getHalloweenDripVariant(
  item: LatestCoverageItem,
): HalloweenDripVariant | null {
  const seed =
    Math.abs(
      item.id * 37 +
        (item.type === "review"
          ? 19
          : 53) +
        hashHalloweenString(
          item.productSlug,
        ),
    )

  // Roughly one card in five
  // stays completely clean.
  if (seed % 100 < 20) {
    return null
  }

  return (seed %
    4) as HalloweenDripVariant
}

function hashHalloweenString(
  value: string,
): number {
  let hash = 0

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash =
      (hash * 31 +
        value.charCodeAt(index)) |
      0
  }

  return Math.abs(hash)
}

function HalloweenDrips({
  variant,
}: {
  variant: HalloweenDripVariant
}) {
  const orange =
    "#ff6500"

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[38%] overflow-visible"
    >
      <svg
        viewBox="0 0 320 120"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        {/* MANY MEDIUM DRIPS */}
        {variant === 0 && (
          <>
            <path
              d="
                M0 0
                H320
                V17

                C302 14 292 18 287 24
                L284 49
                C283 62 276 64 273 51
                L269 23

                C252 18 236 19 220 22
                L217 73
                C216 91 207 92 204 74
                L200 24

                C182 20 165 18 148 21
                L145 42
                C143 55 136 56 133 43
                L130 22

                C110 18 91 20 73 24
                L69 59
                C67 74 59 75 56 60
                L52 23

                C34 18 17 19 0 22
                Z
              "
              fill={orange}
              fillOpacity="0.94"
            />

            <ellipse
              cx="243"
              cy="33"
              rx="3.5"
              ry="8"
              fill={orange}
              fillOpacity="0.9"
            />

            <ellipse
              cx="103"
              cy="34"
              rx="3"
              ry="7"
              fill={orange}
              fillOpacity="0.88"
            />
          </>
        )}

        {/* HEAVY / LONG DRIPS */}
        {variant === 1 && (
          <>
            <path
              d="
                M0 0
                H320
                V22

                C299 18 283 17 264 21
                L260 36
                C257 49 249 49 246 37
                L242 20

                C224 17 207 19 190 23
                L186 91
                C184 109 174 110 171 91
                L167 24

                C148 20 130 18 112 22
                L108 49
                C106 63 98 64 95 50
                L91 23

                C73 19 57 20 41 25
                L37 75
                C35 91 26 92 23 76
                L19 24

                C12 22 6 21 0 23
                Z
              "
              fill={orange}
              fillOpacity="0.95"
            />

            <circle
              cx="181"
              cy="112"
              r="4.5"
              fill={orange}
              fillOpacity="0.88"
            />

            <circle
              cx="31"
              cy="99"
              r="3.5"
              fill={orange}
              fillOpacity="0.82"
            />
          </>
        )}

        {/* UNEVEN DRIPS */}
        {variant === 2 && (
          <>
            <path
              d="
                M0 0
                H320
                V18

                C303 17 289 20 276 25
                L272 67
                C270 84 261 85 258 68
                L254 25

                C236 20 218 20 201 23
                L198 40
                C196 52 189 53 186 41
                L183 22

                C162 18 143 18 124 23
                L120 81
                C118 99 108 100 105 82
                L101 24

                C82 20 65 20 49 24
                L46 43
                C44 55 37 56 34 44
                L31 23

                C20 20 10 20 0 22
                Z
              "
              fill={orange}
              fillOpacity="0.93"
            />

            <ellipse
              cx="113"
              cy="105"
              rx="4"
              ry="8"
              fill={orange}
              fillOpacity="0.86"
            />

            <circle
              cx="265"
              cy="94"
              r="4"
              fill={orange}
              fillOpacity="0.82"
            />
          </>
        )}

        {/* ONE DRAMATIC LONG DRIP */}
        {variant === 3 && (
          <>
            <path
              d="
                M0 0
                H320
                V20

                C304 17 291 18 278 22
                L275 39
                C273 51 266 52 263 40
                L260 22

                C242 18 225 19 208 24
                L204 57
                C202 72 194 73 191 58
                L187 24

                C168 20 150 18 132 22
                L129 35
                C127 46 120 47 117 36
                L114 22

                C96 19 80 20 65 25
                L61 98
                C59 116 49 117 46 98
                L42 25

                C27 20 13 20 0 23
                Z
              "
              fill={orange}
              fillOpacity="0.95"
            />

            <circle
              cx="54"
              cy="116"
              r="4"
              fill={orange}
              fillOpacity="0.88"
            />

            <ellipse
              cx="198"
              cy="82"
              rx="3.5"
              ry="7"
              fill={orange}
              fillOpacity="0.84"
            />

            <circle
              cx="270"
              cy="64"
              r="3"
              fill={orange}
              fillOpacity="0.82"
            />
          </>
        )}
      </svg>
    </div>
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

        productSlug:
          review.productSlug,

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

          productSlug:
            impression.product
              .slug,

          brand:
            impression.product
              .brand.name,

          model:
            impression.product
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

  const chronological = [
    ...reviewItems,
    ...impressionItems,
  ].sort(
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

  const seenProducts =
    new Set<string>()

  const diversified =
    chronological.filter(
      (item) => {
        if (
          seenProducts.has(
            item.productSlug,
          )
        ) {
          return false
        }

        seenProducts.add(
          item.productSlug,
        )

        return true
      },
    )

  return diversified
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