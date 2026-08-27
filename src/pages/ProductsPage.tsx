import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { Link } from "react-router"

import {
  getProducts,
  type ProductDirectoryItem,
} from "../lib/products"

import usePageMetadata from "../hooks/usePageMetadata"

type ProductSort =
  | "most-covered"
  | "highest-rated"
  | "recent"
  | "alphabetical"

function ProductsPage() {
  const [products, setProducts] =
    useState<
      ProductDirectoryItem[]
    >([])

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("")

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
    title: "IEMs | ITGE",
    description:
      "Browse IEMs covered by IEM Tour Group Europe through full reviews and listening impressions.",
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
          "Could not load IEM directory:",
          loadError,
        )

        if (!cancelled) {
          setProducts([])

          setError(
            "The IEM directory could not be loaded.",
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

  const visibleProducts =
    useMemo(() => {
      const normalizedQuery =
        searchQuery
          .trim()
          .toLocaleLowerCase()

      const filtered =
        normalizedQuery
          ? products.filter(
              (product) => {
                const searchableText =
                  `${product.brand.name} ${product.model}`
                    .toLocaleLowerCase()

                return searchableText.includes(
                  normalizedQuery,
                )
              },
            )
          : [...products]

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
              (second.coverageCount ?? 0) -
              (first.coverageCount ?? 0)
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
                ? new Date(firstLatest).getTime()
                : 0
          
            const secondTime =
              secondLatest
                ? new Date(secondLatest).getTime()
                : 0
          
            return secondTime - firstTime
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
            (second.coverageCount ?? 0) -
            (first.coverageCount ?? 0)

          if (
            coverageDifference !==
            0
          ) {
            return coverageDifference
          }

          const contributorDifference =
            (second.contributorCount ?? 0) -
            (first.contributorCount ?? 0)

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
            (product.impressionCount ?? 0),
          0,
        ),
      [products],
    )

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            ITGE library
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
            IEMs
          </h1>

          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Browse every IEM
            represented in the ITGE
            library. Search by model
            or brand, then open
            an IEM to explore its full
            reviews, listening
            impressions, contributors
            and music references.
          </p>
        </header>

        {!loading &&
          !error &&
          products.length > 0 && (
            <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label="IEMs represented"
                value={products.length.toString()}
              />

              <SummaryCard
                label="Brands"
                value={brandCount.toString()}
              />

              <SummaryCard
                label="Published reviews"
                value={totalReviewCount.toString()}
              />

              <SummaryCard
                label="Published impressions"
                value={totalImpressionCount.toString()}
              />
            </section>
          )}

        <section className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem]">
            <label className="block">
              <span className="sr-only">
                Search IEMs
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
                  placeholder="Search by IEM or brand…"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] py-3 pl-11 pr-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
              </div>
            </label>

            <label className="block">
              <span className="sr-only">
                Sort IEMs
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

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted)]">
            {loading
              ? "Loading IEMs…"
              : `${visibleProducts.length} ${
                  visibleProducts.length ===
                  1
                    ? "IEM"
                    : "IEMs"
                }`}
          </p>

          {searchQuery && (
            <button
              type="button"
              onClick={() =>
                setSearchQuery(
                  "",
                )
              }
              className="text-sm font-semibold text-[var(--accent)] transition hover:opacity-75"
            >
              Clear search
            </button>
          )}
        </div>

        {loading ? (
          <DirectoryMessage>
            Loading IEM directory…
          </DirectoryMessage>
        ) : error ? (
          <DirectoryMessage>
            <p className="font-semibold text-[var(--foreground)]">
              Unable to load IEMs
            </p>

            <p className="mt-2">
              {error}
            </p>
          </DirectoryMessage>
        ) : products.length ===
          0 ? (
          <DirectoryMessage>
            No IEMs with published
            reviews or impressions
            are available yet.
          </DirectoryMessage>
        ) : visibleProducts.length ===
          0 ? (
          <DirectoryMessage>
            No IEMs match “
            {searchQuery.trim()}”.
          </DirectoryMessage>
        ) : (
          <section className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map(
              (product) => (
                <ProductDirectoryCard
                  key={product.id}
                  product={product}
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
  product: ProductDirectoryItem
}) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-1 hover:border-[var(--accent)]"
    >
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

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-4">
          <Metric
            label={
              product.reviewCount ===
              1
                ? "Review"
                : "Reviews"
            }
            value={product.reviewCount.toString()}
          />

          <Metric
            label={
              (product.impressionCount ?? 0) === 1
                ? "Impression"
                : "Impressions"
            }
            value={(product.impressionCount ?? 0).toString()}
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
            value={
              (
                product.contributorCount ??
                product.reviewerCount
              ).toString()
            }
          />

          <Metric
            label="Avg. review"
            value={
              product.averageRating ==
              null
                ? "—"
                : product.averageRating.toFixed(
                    1,
                  )
            }
          />
        </div>
      </div>
    </Link>
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
  children: React.ReactNode
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