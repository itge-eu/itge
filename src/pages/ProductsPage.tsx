import {
  useEffect,
  useMemo,
  useState,
} from "react"

import DirectoryControls from "../components/directory/DirectoryControls"
import DirectorySearchInput from "../components/directory/DirectorySearchInput"
import ProductCard from "../components/products/ProductCard"
import DirectoryResultsBar from "../components/directory/DirectoryResultsBar"

import {
  getProducts,
  getProductTypeLabel,
  type ProductDirectoryItem,
  type ProductType,
} from "../lib/products"

import usePageMetadata from "../hooks/usePageMetadata"

type ProductSort =
  | "most-covered"
  | "highest-rated"
  | "recent"
  | "alphabetical"

const PRODUCT_TYPES: {
  value: ProductType
  label: string
}[] = [
  {
    value: "iem",
    label: "IEMs",
  },
  {
    value: "headphone",
    label: "Headphones",
  },
  {
    value: "source",
    label: "Source gear",
  },
  {
    value: "cable_accessory",
    label: "Cables & accessories",
  },
]

const SORT_OPTIONS: {
  value: ProductSort
  label: string
}[] = [
  {
    value: "most-covered",
    label: "Most covered",
  },
  {
    value: "highest-rated",
    label: "Highest review rating",
  },
  {
    value: "recent",
    label: "Recently covered",
  },
  {
    value: "alphabetical",
    label: "A–Z",
  },
]

function ProductsPage() {
  const [
    products,
    setProducts,
  ] =
    useState<
      ProductDirectoryItem[]
    >([])

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("")

  const [
    selectedTypes,
    setSelectedTypes,
  ] =
    useState<
      ProductType[]
    >([])

  const [
    sort,
    setSort,
  ] =
    useState<ProductSort>(
      "most-covered",
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null)

  usePageMetadata({
    title:
      "Gear | ITGE",

    description:
      "Browse IEMs, headphones, source gear and accessories covered by IEM Tour Group Europe.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setLoading(true)
      setError(null)

      try {
        const result =
          await getProducts()

        if (!cancelled) {
          setProducts(
            result,
          )
        }
      } catch (
        loadError
      ) {
        console.error(
          "Could not load gear directory:",
          loadError,
        )

        if (!cancelled) {
          setProducts(
            [],
          )

          setError(
            "The gear directory could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(
            false,
          )
        }
      }
    }

    void loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  const typeCounts =
    useMemo(() => {
      const counts:
        Record<
          ProductType,
          number
        > = {
          iem: 0,
          headphone: 0,
          source: 0,
          cable_accessory: 0,
        }

      products.forEach(
        (product) => {
          counts[
            product.productType
          ] += 1
        },
      )

      return counts
    }, [products])

  const visibleProducts =
    useMemo(() => {
      const normalizedQuery =
        searchQuery
          .trim()
          .toLocaleLowerCase()

      const filtered =
        products.filter(
          (product) => {
            if (
              selectedTypes.length >
                0 &&
              !selectedTypes.includes(
                product.productType,
              )
            ) {
              return false
            }

            if (
              !normalizedQuery
            ) {
              return true
            }

            const searchableText =
              [
                product.brand.name,
                product.model,
                getProductTypeLabel(
                  product.productType,
                ),
              ]
                .join(" ")
                .toLocaleLowerCase()

            return searchableText.includes(
              normalizedQuery,
            )
          },
        )

      return [...filtered].sort(
        (
          first,
          second,
        ) => {
          if (
            sort ===
            "highest-rated"
          ) {
            const ratingDifference =
              (second.averageRating ??
                -1) -
              (first.averageRating ??
                -1)

            if (
              ratingDifference !==
              0
            ) {
              return ratingDifference
            }

            return (
              (second.coverageCount ??
                0) -
              (first.coverageCount ??
                0)
            )
          }

          if (
            sort ===
            "recent"
          ) {
            const firstLatest =
              first.latestActivityAt ??
              first.latestReviewAt

            const secondLatest =
              second.latestActivityAt ??
              second.latestReviewAt

            const firstTime =
              firstLatest
                ? new Date(
                    firstLatest,
                  ).getTime()
                : 0

            const secondTime =
              secondLatest
                ? new Date(
                    secondLatest,
                  ).getTime()
                : 0

            return (
              secondTime -
              firstTime
            )
          }

          if (
            sort ===
            "alphabetical"
          ) {
            return `${first.brand.name} ${first.model}`.localeCompare(
              `${second.brand.name} ${second.model}`,
            )
          }

          const coverageDifference =
            (second.coverageCount ??
              0) -
            (first.coverageCount ??
              0)

          if (
            coverageDifference !==
            0
          ) {
            return coverageDifference
          }

          const contributorDifference =
            (second.contributorCount ??
              0) -
            (first.contributorCount ??
              0)

          if (
            contributorDifference !==
            0
          ) {
            return contributorDifference
          }

          const ratingDifference =
            (second.averageRating ??
              -1) -
            (first.averageRating ??
              -1)

          if (
            ratingDifference !==
            0
          ) {
            return ratingDifference
          }

          return `${first.brand.name} ${first.model}`.localeCompare(
            `${second.brand.name} ${second.model}`,
          )
        },
      )
    }, [
      products,
      searchQuery,
      selectedTypes,
      sort,
    ])

  const brandCount =
    useMemo(
      () =>
        new Set(
          products.map(
            (product) =>
              product.brand.id,
          ),
        ).size,
      [products],
    )

  const totalReviewCount =
    useMemo(
      () =>
        products.reduce(
          (
            total,
            product,
          ) =>
            total +
            product.reviewCount,
          0,
        ),
      [products],
    )

  const totalImpressionCount =
    useMemo(
      () =>
        products.reduce(
          (
            total,
            product,
          ) =>
            total +
            (product.impressionCount ??
              0),
          0,
        ),
      [products],
    )

  function toggleType(
    type: ProductType,
  ) {
    setSelectedTypes(
      (current) =>
        current.includes(
          type,
        )
          ? current.filter(
              (item) =>
                item !==
                type,
            )
          : [
              ...current,
              type,
            ],
    )
  }

  function clearFilters() {
    setSelectedTypes(
      [],
    )

    setSearchQuery(
      "",
    )
  }

  const activeFilterCount =
    selectedTypes.length +
    (searchQuery.trim()
      ? 1
      : 0)

  const hasFilters =
    activeFilterCount > 0

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            ITGE library
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
            Gear
          </h1>
        </header>

        {!loading &&
          !error &&
          products.length >
            0 && (
            <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label="Gear represented"
                value={
                  products.length.toString()
                }
              />

              <SummaryCard
                label="Brands"
                value={
                  brandCount.toString()
                }
              />

              <SummaryCard
                label="Reviews"
                value={
                  totalReviewCount.toString()
                }
              />

              <SummaryCard
                label="Impressions"
                value={
                  totalImpressionCount.toString()
                }
              />
            </section>
          )}

        <DirectoryControls className="mt-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Gear type
              </p>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="shrink-0 text-sm font-semibold text-[var(--accent)] transition hover:opacity-75"
              >
                Clear (
                {
                  activeFilterCount
                }
                )
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {PRODUCT_TYPES.map(
              (type) => (
                <TypeFilterButton
                  key={
                    type.value
                  }
                  label={
                    type.label
                  }
                  count={
                    typeCounts[
                      type.value
                    ]
                  }
                  active={
                    selectedTypes.includes(
                      type.value,
                    )
                  }
                  onClick={() =>
                    toggleType(
                      type.value,
                    )
                  }
                />
              ),
            )}
          </div>

          <div className="mt-5 border-t border-[var(--border)] pt-5">
            <DirectorySearchInput
              id="gear-search"
              value={
                searchQuery
              }
              onChange={
                setSearchQuery
              }
              placeholder="Search by product or brand…"
            />
          </div>
        </DirectoryControls>

        <DirectoryResultsBar
          count={visibleProducts.length}
          singular="result"
          plural="results"
          loading={loading}
          sortValue={sort}
          sortOptions={SORT_OPTIONS}
          onSortChange={setSort}
          sortId="gear-sort"
          caption="showing all"
        />

        {loading ? (
          <DirectoryMessage>
            Loading gear
            directory…
          </DirectoryMessage>
        ) : error ? (
          <DirectoryMessage>
            <p className="font-semibold text-[var(--foreground)]">
              Unable to load
              gear
            </p>

            <p className="mt-2">
              {error}
            </p>
          </DirectoryMessage>
        ) : products.length ===
          0 ? (
          <DirectoryMessage>
            No gear with
            published reviews or
            impressions is
            available yet.
          </DirectoryMessage>
        ) : visibleProducts.length ===
          0 ? (
          <DirectoryMessage>
            No gear matches the
            current filters.
          </DirectoryMessage>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map(
              (product) => (
                <ProductCard
                  key={
                    product.id
                  }
                  product={
                    product
                  }
                />
              ),
            )}
          </section>
        )}
      </div>
    </main>
  )
}

function TypeFilterButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      aria-pressed={
        active
      }
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
          : "border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]"
      }`}
    >
      {label}

      <span
        className={`ml-2 ${
          active
            ? "opacity-75"
            : "text-[var(--muted)]"
        }`}
      >
        {count}
      </span>
    </button>
  )
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-sm text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold">
        {value}
      </p>
    </div>
  )
}

function DirectoryMessage({
  children,
}: {
  children:
    React.ReactNode
}) {
  return (
    <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
      {children}
    </div>
  )
}

export default ProductsPage