import { Link } from "react-router"

import type { IemDirectoryItem } from "../../lib/iems"

type IemCardProps = {
  iem: IemDirectoryItem
}

function IemCard({ iem }: IemCardProps) {
  const iemUrl = `/iems/${iem.slug}`
  const manufacturerUrl =
    `/brands/${iem.manufacturer.slug}`

  return (
    <article className="group overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-1 hover:border-[var(--accent)]">
      <Link
        to={iemUrl}
        aria-label={`View ${iem.manufacturer.name} ${iem.model}`}
        className="block"
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
      </Link>

      <div className="p-6">
        <Link
          to={manufacturerUrl}
          className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)] transition hover:opacity-70"
        >
          {iem.manufacturer.name}
        </Link>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          <Link
            to={iemUrl}
            className="transition hover:text-[var(--accent)]"
          >
            {iem.model}
          </Link>
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
                ? "Member"
                : "Members"
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