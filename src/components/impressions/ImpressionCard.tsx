import { Link } from "react-router"

import type { ImpressionSummary } from "../../lib/impressions"

type ImpressionCardProps = {
  impression: ImpressionSummary
  variant?: "default" | "compact"
}

function ImpressionCard({
  impression,
  variant = "default",
}: ImpressionCardProps) {
  const impressionUrl =
    `/impressions/${impression.slug}`

  const iemUrl =
    `/iems/${impression.iem.slug}`

  const reviewerUrl =
    `/members/${impression.reviewer.slug}`

  const manufacturerUrl =
    `/brands/${impression.iem.manufacturer.slug}`

  const excerpt =
    impression.summary?.trim() ||
    stripHtml(impression.body ?? "").slice(0, 220)

  const imageSize =
    variant === "compact"
      ? "sm:w-32 md:w-36"
      : "sm:w-40 md:w-48"

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md focus-within:border-[var(--accent)]">
      <Link
        to={impressionUrl}
        aria-label={`Read impression of ${impression.iem.manufacturer.name} ${impression.iem.model} by ${impression.reviewer.name}`}
        className="absolute inset-0 z-0 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      />

      <div className="relative z-10 pointer-events-none flex flex-col sm:flex-row">
        {impression.heroImageUrl && (
          <div
            className={`shrink-0 overflow-hidden bg-[var(--surface-soft)] ${imageSize}`}
          >
            <img
              src={impression.heroImageUrl}
              alt={`${impression.iem.manufacturer.name} ${impression.iem.model}`}
              loading="lazy"
              className="aspect-[16/9] h-full w-full object-cover transition duration-300 group-hover:scale-[1.025] sm:aspect-square"
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                to={manufacturerUrl}
                className="pointer-events-auto relative z-20 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)] transition hover:opacity-70"
              >
                {impression.iem.manufacturer.name}
              </Link>

              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                <Link
                  to={iemUrl}
                  className="pointer-events-auto relative z-20 transition hover:text-[var(--accent)]"
                >
                  {impression.iem.model}
                </Link>
              </h2>
            </div>

            {impression.publishedAt && (
              <span className="shrink-0 text-xs text-[var(--muted)]">
                {formatDate(impression.publishedAt)}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Impression by{" "}
            <Link
              to={reviewerUrl}
              className="pointer-events-auto relative z-20 font-semibold text-[var(--accent)] hover:underline"
            >
              {impression.reviewer.name}
            </Link>
          </p>

          {impression.title && (
            <p className="mt-3 line-clamp-1 font-medium">
              {impression.title}
            </p>
          )}

          {excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
              {excerpt}
            </p>
          )}

          <div className="mt-auto flex justify-end pt-4">
            <span className="text-sm font-medium text-[var(--accent)] transition group-hover:translate-x-0.5">
              Read impression →
            </span>
          </div>
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
  const document =
    new DOMParser().parseFromString(
      html,
      "text/html",
    )

  return (
    document.body.textContent
      ?.replace(/\s+/g, " ")
      .trim() ?? ""
  )
}

export default ImpressionCard