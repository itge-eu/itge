import { Link } from "react-router"

import {
  getProductTypeLabel,
  type ProductDirectoryItem,
} from "../../lib/products"

type ProductCardProps = {
  product: ProductDirectoryItem
}

function ProductCard({
  product,
}: ProductCardProps) {
  const productUrl =
    `/gear/${product.slug}`

  const brandUrl =
    `/brands/${product.brand.slug}`

  const impressionCount =
    product.impressionCount ??
    0

  const contributorCount =
    product.contributorCount ??
    product.reviewerCount

  return (
    <article className="group overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-1 hover:border-[var(--accent)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-soft)]">
        <Link
          to={productUrl}
          aria-label={`View ${product.brand.name} ${product.model}`}
          className="absolute inset-0"
        >
          {product.heroImageUrl ? (
            <img
              src={
                product.heroImageUrl
              }
              alt={`${product.brand.name} ${product.model}`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-[var(--muted)]">
              No image available
            </div>
          )}

          {product.heroImageUrl && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
          )}
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5">
          <span className="rounded-full border border-white/25 bg-black/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
            {getProductTypeLabel(
              product.productType,
            )}
          </span>

          {product.averageRating !=
            null && (
            <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
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

        {product.heroImageUrl && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              {product.brand.name}
            </p>

            <h2 className="mt-1 text-3xl font-semibold leading-tight tracking-tight">
              {product.model}
            </h2>
          </div>
        )}
      </div>

      {!product.heroImageUrl && (
        <div className="px-7 pt-6">
          <Link
            to={brandUrl}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)] transition hover:opacity-70"
          >
            {product.brand.name}
          </Link>

          <h2 className="mt-2 text-[1.75rem] font-semibold leading-tight tracking-tight">
            <Link
              to={productUrl}
              className="transition hover:text-[var(--accent)]"
            >
              {product.model}
            </Link>
          </h2>
        </div>
      )}

      <div
        className={
          product.heroImageUrl
            ? "px-7 py-6"
            : "px-7 pb-7 pt-5"
        }
      >
        <div className="grid grid-cols-3">
          <Metric
            label={
              product.reviewCount ===
              1
                ? "review"
                : "reviews"
            }
            value={
              product.reviewCount.toString()
            }
          />

          <Metric
            label={
              impressionCount ===
              1
                ? "impression"
                : "impressions"
            }
            value={
              impressionCount.toString()
            }
          />

          <Metric
            label={
              contributorCount ===
              1
                ? "contributor"
                : "contributors"
            }
            value={
              contributorCount.toString()
            }
          />
        </div>
      </div>
    </article>
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
    <div className="flex min-w-0 flex-col items-center text-center">
      <p className="text-xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs leading-4 text-[var(--muted)]">
        {label}
      </p>
    </div>
  )
}

export default ProductCard