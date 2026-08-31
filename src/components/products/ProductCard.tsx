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
      <Link
        to={productUrl}
        aria-label={`View ${product.brand.name} ${product.model}`}
        className="relative block"
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

        <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {getProductTypeLabel(
            product.productType,
          )}
        </span>

        {product.averageRating !=
          null && (
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
      </Link>

      <div className="px-7 pb-7 pt-7">
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

        <div className="mt-4 grid grid-cols-3 border-t border-[var(--border)] pt-5">
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