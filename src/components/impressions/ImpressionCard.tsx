import { Link } from "react-router"

import type { ImpressionSummary } from "../../lib/impressions"

type ImpressionCardProps = {
  impression: ImpressionSummary
}

function ImpressionCard({
  impression,
}: ImpressionCardProps) {
  const impressionUrl =
    `/impressions/${impression.slug}`

  const iemUrl =
    `/iems/${impression.iem.slug}`

  const reviewerUrl =
    `/reviewers/${impression.reviewer.slug}`

  const manufacturerUrl =
    `/manufacturers/${impression.iem.manufacturer.slug}`

  const excerpt =
    impression.summary?.trim() ||
    stripHtml(impression.body ?? "").slice(0, 220)

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg focus-within:border-[var(--accent)]">
      <Link
        to={impressionUrl}
        aria-label={`Read impression of ${impression.iem.manufacturer.name} ${impression.iem.model} by ${impression.reviewer.name}`}
        className="absolute inset-0 z-0 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      />

      {impression.heroImageUrl && (
        <div className="aspect-[16/9] overflow-hidden bg-[var(--surface-soft)]">
          <img
            src={impression.heroImageUrl}
            alt={`${impression.iem.manufacturer.name} ${impression.iem.model}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
          />
        </div>
      )}

      <div className="relative z-10 pointer-events-none flex min-h-72 flex-col p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Impression
            </p>

            <Link
              to={manufacturerUrl}
              className="pointer-events-auto relative z-20 mt-3 inline-block text-sm uppercase tracking-widest text-[var(--accent)] transition hover:opacity-70"
            >
              {impression.iem.manufacturer.name}
            </Link>

            <h2 className="mt-1 text-2xl font-semibold">
              <Link
                to={iemUrl}
                className="pointer-events-auto relative z-20 transition hover:text-[var(--accent)]"
              >
                {impression.iem.model}
              </Link>
            </h2>
          </div>

          {impression.publishedAt && (
            <span className="shrink-0 text-sm text-[var(--muted)]">
              {formatDate(impression.publishedAt)}
            </span>
          )}
        </div>

        {impression.title && (
          <p className="mt-5 font-semibold">
            {impression.title}
          </p>
        )}

        {excerpt && (
          <p className="mt-4 line-clamp-4 leading-7 text-[var(--muted)]">
            {excerpt}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-8 text-sm">
          <span className="text-[var(--muted)]">
            By{" "}
            <Link
              to={reviewerUrl}
              className="pointer-events-auto relative z-20 font-semibold text-[var(--accent)] hover:underline"
            >
              {impression.reviewer.name}
            </Link>
          </span>

          <span className="font-medium text-[var(--accent)] transition group-hover:translate-x-0.5">
            Read impression →
          </span>
        </div>
      </div>
    </article>
  )
}

function formatDate(
  value: string,
): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date)
}

function stripHtml(
  html: string,
): string {
  const document = new DOMParser().parseFromString(
    html,
    "text/html",
  )

  return document.body.textContent
    ?.replace(/\s+/g, " ")
    .trim() ?? ""
}

export default ImpressionCard