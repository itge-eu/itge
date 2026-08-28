import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Link,
} from "react-router"

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

  const [sort, setSort] =
    useState<ProductSort>(
      "most-covered",
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
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
          setProducts(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load gear directory:",
          loadError,
        )

        if (!cancelled) {
          setProducts([])

          setError(
            "The gear directory could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
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

      return filtered.sort(
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
            sort === "recent"
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
              product
                .brand
                .id,
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
        current.includes(type)
          ? current.filter(
              (item) =>
                item !== type,
            )
          : [
              ...current,
              type,
            ],
    )
  }

  function clearFilters() {
    setSelectedTypes([])
    setSearchQuery("")
  }

  const hasFilters =
    selectedTypes.length >
      0 ||
    Boolean(
      searchQuery.trim(),
    )

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            ITGE library
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
            Gear
          </h1>

          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Explore all gear
            represented in the
            ITGE library, from
            IEMs and headphones
            to source gear and
            accessories. Search by
            product or brand, or
            filter by gear type.
          </p>
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
                label="Published reviews"
                value={
                  totalReviewCount.toString()
                }
              />

              <SummaryCard
                label="Published impressions"
                value={
                  totalImpressionCount.toString()
                }
              />
            </section>
          )}

        <section className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <div>
            <p className="text-sm font-semibold">
              Gear type
            </p>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Select multiple
              types, or leave all
              unselected to show
              everything.
            </p>

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
          </div>

          <div className="mt-6 grid gap-4 border-t border-[var(--border)] pt-6 md:grid-cols-[minmax(0,1fr)_15rem]">
            <label className="block">
              <span className="sr-only">
                Search gear
              </span>

              <div className="relative">
                <SearchIcon />

                <input
                  type="search"
                  value={
                    searchQuery
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearchQuery(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Search by product or brand…"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] py-3 pl-11 pr-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
              </div>
            </label>

            <label className="block">
              <span className="sr-only">
                Sort gear
              </span>

              <select
                value={sort}
                onChange={(
                  event,
                ) =>
                  setSort(
                    event
                      .target
                      .value as ProductSort,
                  )
                }
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
              >
                <option value="most-covered">
                  Most covered
                </option>

                <option value="highest-rated">
                  Highest review
                  rating
                </option>

                <option value="recent">
                  Recently covered
                </option>

                <option value="alphabetical">
                  A–Z
                </option>
              </select>
            </label>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted)]">
            {loading
              ? "Loading gear…"
              : `${visibleProducts.length} ${
                  visibleProducts.length ===
                  1
                    ? "product"
                    : "products"
                }`}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="text-sm font-semibold text-[var(--accent)] transition hover:opacity-75"
            >
              Clear filters
            </button>
          )}
        </div>

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
          <section className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map(
              (product) => (
                <ProductDirectoryCard
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

function ProductDirectoryCard({
  product,
}: {
  product:
    ProductDirectoryItem
}) {
  return (
    <Link
      to={`/gear/${product.slug}`}
      className="group overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-1 hover:border-[var(--accent)]"
    >
      <div className="relative">
        {product.heroImageUrl ? (
          <div className="aspect-[16/10] overflow-hidden bg-[var(--surface-soft)]">
            <img
              src={
                product.heroImageUrl
              }
              alt={`${product.brand.name} ${product.model}`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-[var(--surface-soft)] px-6 text-center text-sm text-[var(--muted)]">
            No image available
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {getProductTypeLabel(
            product.productType,
          )}
        </span>

        {product.averageRating != null && (
          <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="text-[var(--accent)]"
            >
              ★
            </span>

            {product.averageRating.toFixed(
              1,
            )}
          </span>
        )}
      </div>

      <div className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          {
            product.brand
              .name
          }
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight transition group-hover:text-[var(--accent)]">
          {product.model}
        </h2>

        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-5">
          <Metric
            label={
              product.reviewCount ===
              1
                ? "Review"
                : "Reviews"
            }
            value={
              product.reviewCount.toString()
            }
          />

          <Metric
            label={
              (product.impressionCount ??
                0) === 1
                ? "Impression"
                : "Impressions"
            }
            value={(
              product.impressionCount ??
              0
            ).toString()}
          />

          <Metric
            label={
              (
                product.contributorCount ??
                product.reviewerCount
              ) === 1
                ? "Contributor"
                : "Contributors"
            }
            value={(
              product.contributorCount ??
              product.reviewerCount
            ).toString()}
          />
        </div>
      </div>
    </Link>
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

function Metric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <p className="text-xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs leading-4 text-[var(--muted)]">
        {label}
      </p>
    </div>
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

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export default ProductsPage