import {
  useMemo,
  useState,
} from "react"

import { Link } from "react-router"

import ReviewGrid from "../reviews/ReviewGrid"
import ImpressionCard from "../impressions/ImpressionCard"

import type {
  FeaturedReview,
} from "../../lib/reviews"

import type {
  ImpressionSummary,
} from "../../lib/impressions"

export type ExploreCoverageProduct = {
  id: number
  model: string
  slug: string
  brandName: string
  brandSlug: string
  reviewCount: number
  impressionCount: number
  coverageCount: number
}

type GroupedCoverageProps = {
  subjectName: string
  subjectKind: "artist" | "genre"
  reviews: FeaturedReview[]
  impressions: ImpressionSummary[]
  products: ExploreCoverageProduct[]
}

type CoverageGroup = {
  product: ExploreCoverageProduct
  reviews: FeaturedReview[]
  impressions: ImpressionSummary[]
  latestAt: number
}

function normalizeSearchValue(
  value:
    | string
    | null
    | undefined,
): string {
  return (
    value ??
    ""
  )
    .toLocaleLowerCase()
    .trim()
}

function timestampValue(
  value:
    | string
    | null
    | undefined,
): number {
  if (!value) {
    return 0
  }

  const time =
    new Date(
      value,
    ).getTime()

  return Number.isNaN(time)
    ? 0
    : time
}

function reviewMatches(
  review: FeaturedReview,
  query: string,
): boolean {
  return [
    review.brand,
    review.model,
    review.title,
    review.summary,
    review.reviewer,
  ].some(
    (value) =>
      normalizeSearchValue(
        value,
      ).includes(query),
  )
}

function impressionMatches(
  impression: ImpressionSummary,
  query: string,
): boolean {
  return [
    impression.product.brand.name,
    impression.product.model,
    impression.title,
    impression.summary,
    impression.body,
    impression.reviewer.name,
  ].some(
    (value) =>
      normalizeSearchValue(
        value,
      ).includes(query),
  )
}

function GroupedCoverage({
  subjectName,
  subjectKind,
  reviews,
  impressions,
  products,
}: GroupedCoverageProps) {
  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("")

  const normalizedQuery =
    normalizeSearchValue(
      searchQuery,
    )

  const groups =
    useMemo(() => {
      const productMap =
        new Map<
          string,
          ExploreCoverageProduct
        >(
          products.map(
            (product) => [
              product.slug,
              product,
            ],
          ),
        )

      const reviewMap =
        new Map<
          string,
          FeaturedReview[]
        >()

      const impressionMap =
        new Map<
          string,
          ImpressionSummary[]
        >()

      reviews.forEach(
        (review) => {
          const existing =
            reviewMap.get(
              review.productSlug,
            ) ?? []

          existing.push(
            review,
          )

          reviewMap.set(
            review.productSlug,
            existing,
          )
        },
      )

      impressions.forEach(
        (impression) => {
          const productSlug =
            impression.product.slug

          const existing =
            impressionMap.get(
              productSlug,
            ) ?? []

          existing.push(
            impression,
          )

          impressionMap.set(
            productSlug,
            existing,
          )
        },
      )

      const productSlugs =
        new Set<string>([
          ...productMap.keys(),
          ...reviewMap.keys(),
          ...impressionMap.keys(),
        ])

      const result:
        CoverageGroup[] = []

      productSlugs.forEach(
        (productSlug) => {
          const product =
            productMap.get(
              productSlug,
            )

          if (!product) {
            return
          }

          const productSearchMatches =
            [
              product.brandName,
              product.model,
            ].some(
              (value) =>
                normalizeSearchValue(
                  value,
                ).includes(
                  normalizedQuery,
                ),
            )

          const allReviews =
            reviewMap.get(
              productSlug,
            ) ?? []

          const allImpressions =
            impressionMap.get(
              productSlug,
            ) ?? []

          const filteredReviews =
            !normalizedQuery ||
            productSearchMatches
              ? allReviews
              : allReviews.filter(
                  (review) =>
                    reviewMatches(
                      review,
                      normalizedQuery,
                    ),
                )

          const filteredImpressions =
            !normalizedQuery ||
            productSearchMatches
              ? allImpressions
              : allImpressions.filter(
                  (impression) =>
                    impressionMatches(
                      impression,
                      normalizedQuery,
                    ),
                )

          if (
            filteredReviews.length ===
              0 &&
            filteredImpressions.length ===
              0
          ) {
            return
          }

          const latestReviewAt =
            Math.max(
              0,
              ...filteredReviews.map(
                (review) =>
                  timestampValue(
                    review.publishedAt,
                  ),
              ),
            )

          const latestImpressionAt =
            Math.max(
              0,
              ...filteredImpressions.map(
                (impression) =>
                  timestampValue(
                    impression.publishedAt,
                  ),
              ),
            )

          result.push({
            product,
            reviews:
              filteredReviews,
            impressions:
              filteredImpressions,
            latestAt:
              Math.max(
                latestReviewAt,
                latestImpressionAt,
              ),
          })
        },
      )

      return result.sort(
        (first, second) =>
          second.latestAt -
            first.latestAt ||
          second.product.coverageCount -
            first.product.coverageCount ||
          first.product.model.localeCompare(
            second.product.model,
          ),
      )
    }, [
      reviews,
      impressions,
      products,
      normalizedQuery,
    ])

  const visibleReviewCount =
    groups.reduce(
      (
        total,
        group,
      ) =>
        total +
        group.reviews.length,
      0,
    )

  const visibleImpressionCount =
    groups.reduce(
      (
        total,
        group,
      ) =>
        total +
        group.impressions.length,
      0,
    )

  const visibleCoverageCount =
    visibleReviewCount +
    visibleImpressionCount

  const totalCoverageCount =
    reviews.length +
    impressions.length

  const contextWord =
    subjectKind === "artist"
      ? "featuring"
      : "covering"

  return (
    <section className="mt-14">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Coverage
        </p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Coverage{" "}
          {contextWord}{" "}
          {subjectName}
        </h2>

        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          {totalCoverageCount}{" "}
          {totalCoverageCount ===
          1
            ? "published piece"
            : "published pieces"}{" "}
          across{" "}
          {products.length}{" "}
          {products.length ===
          1
            ? "piece"
            : "pieces"}{" "}
          of gear.
        </p>
      </div>

      <div className="mt-8">
        <label
          htmlFor="coverage-search"
          className="sr-only"
        >
          Search within{" "}
          {subjectName}{" "}
          coverage
        </label>

        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />
            <path d="m20 20-3.5-3.5" />
          </svg>

          <input
            id="coverage-search"
            type="search"
            value={
              searchQuery
            }
            onChange={(
              event,
            ) =>
              setSearchQuery(
                event.target.value,
              )
            }
            placeholder={`Search within ${subjectName} coverage…`}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-4 pl-13 pr-5 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
          />
        </div>

        {normalizedQuery && (
          <p className="mt-3 text-sm text-[var(--muted)]">
            {visibleCoverageCount}{" "}
            {visibleCoverageCount ===
            1
              ? "result"
              : "results"}{" "}
            across{" "}
            {groups.length}{" "}
            {groups.length ===
            1
              ? "piece"
              : "pieces"}{" "}
            of gear.
          </p>
        )}
      </div>

      {groups.length ===
      0 ? (
        <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
          No matching coverage
          found.
        </div>
      ) : (
        <div className="mt-10 space-y-14">
          {groups.map(
            (group) => (
              <section
                key={
                  group.product.id
                }
                className="border-t border-[var(--border)] pt-8 first:border-t-0 first:pt-0"
              >
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                      {
                        group.product.brandName
                      }
                    </p>

                    <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                      {
                        group.product.model
                      }
                    </h3>

                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {
                        group.reviews.length
                      }{" "}
                      {group.reviews.length ===
                      1
                        ? "review"
                        : "reviews"}
                      {" · "}
                      {
                        group.impressions.length
                      }{" "}
                      {group.impressions.length ===
                      1
                        ? "impression"
                        : "impressions"}
                    </p>
                  </div>

                  <Link
                    to={`/gear/${group.product.slug}`}
                    className="shrink-0 font-semibold text-[var(--accent)] transition hover:opacity-75"
                  >
                    View gear{" "}
                    <span aria-hidden="true">
                      →
                    </span>
                  </Link>
                </div>

                {group.reviews.length >
                  0 && (
                  <ReviewGrid
                    reviews={
                      group.reviews
                    }
                  />
                )}

                {group.impressions.length >
                  0 && (
                  <div
                    className={`grid gap-8 ${
                      group.reviews
                        .length > 0
                        ? "mt-8"
                        : ""
                    }`}
                  >
                    {group.impressions.map(
                      (
                        impression,
                      ) => (
                        <ImpressionCard
                          key={
                            impression.id
                          }
                          impression={
                            impression
                          }
                        />
                      ),
                    )}
                  </div>
                )}
              </section>
            ),
          )}
        </div>
      )}
    </section>
  )
}

export default GroupedCoverage
