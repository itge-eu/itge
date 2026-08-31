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

const MANUAL_PAUSE_DURATION =
  7000

const AUTO_SCROLL_SPEED =
  0.08

function LatestCoverageCarousel({
  items,
}: LatestCoverageCarouselProps) {
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
                ★{" "}
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
            impression.product
              .brand
              .name,

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