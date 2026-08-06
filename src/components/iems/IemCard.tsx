import { Link } from "react-router"

import type { IemDirectoryItem } from "../../lib/iems"

type IemCardProps = {
  iem: IemDirectoryItem
}

function IemCard({ iem }: IemCardProps) {
  return (
    <Link
      to={`/iems/${iem.slug}`}
      className="group overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-1 hover:border-[var(--accent)]"
    >
      {iem.heroImageUrl ? (
        <div className="aspect-[16/10] overflow-hidden bg-[var(--surface-soft)]">
          <img
            src={iem.heroImageUrl}
            alt={`${iem.manufacturer.name} ${iem.model}`}
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
          {iem.manufacturer.name}
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight transition group-hover:text-[var(--accent)]">
          {iem.model}
        </h2>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-5">
          <Metric
            label={
              iem.reviewCount === 1
                ? "Review"
                : "Reviews"
            }
            value={iem.reviewCount.toString()}
          />

          <Metric
            label={
              iem.reviewerCount === 1
                ? "Reviewer"
                : "Reviewers"
            }
            value={iem.reviewerCount.toString()}
          />

          <Metric
            label="Average"
            value={
              iem.averageRating == null
                ? "—"
                : iem.averageRating.toFixed(1)
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

      <p className="mt-1 truncate text-xs text-[var(--muted)]">
        {label}
      </p>
    </div>
  )
}

export default IemCard