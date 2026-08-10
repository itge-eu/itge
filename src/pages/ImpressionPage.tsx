import {
  useEffect,
  useState,
} from "react"
import { Link, useParams } from "react-router"

import Breadcrumbs from "../components/navigation/Breadcrumbs"
import PageState from "../components/layout/PageState"
import ReviewerAvatar from "../components/reviewers/ReviewerAvatar"
import usePageMetadata from "../hooks/usePageMetadata"

import {
  getImpressionBySlug,
  type FullImpression,
} from "../lib/impressions"

function ImpressionPage() {
  const { slug } = useParams<{ slug: string }>()

  const [impression, setImpression] =
    useState<FullImpression | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  usePageMetadata({
    title: impression
      ? `${impression.iem.model} impression by ${impression.reviewer.name} | ITGE`
      : "Impression | ITGE",

    description: impression
      ? `Listening impression of the ${impression.iem.manufacturer.name} ${impression.iem.model} by ${impression.reviewer.name}.`
      : "Short-form IEM listening impressions from ITGE reviewers.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadImpression() {
      if (!slug) {
        setError(
          "No impression was specified.",
        )
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result =
          await getImpressionBySlug(slug)

        if (!cancelled) {
          setImpression(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load impression:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The impression could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadImpression()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <PageState
        eyebrow="Impression"
        title="Loading impression…"
      />
    )
  }

  if (error) {
    return (
      <PageState
        eyebrow="Impression"
        title="Unable to load impression"
        message={error}
        backTo="/impressions"
        backLabel="Back to impressions"
      />
    )
  }

  if (!impression) {
    return (
      <PageState
        eyebrow="404"
        title="Impression not found"
        message="The impression you were looking for doesn’t exist or is no longer available."
        backTo="/impressions"
        backLabel="Back to impressions"
      />
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <article className="mx-auto max-w-4xl">
        <Breadcrumbs
          items={[
            {
              label: "Impressions",
              to: "/impressions",
            },
            {
              label: impression.iem.model,
              to: `/iems/${impression.iem.slug}`,
            },
            {
              label: `${impression.reviewer.name} impression`,
            },
          ]}
        />

        <header className="border-b border-[var(--border)] pb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Impression
          </p>

          <Link
            to={`/manufacturers/${impression.iem.manufacturer.slug}`}
            className="mt-4 inline-block text-sm uppercase tracking-[0.18em] text-[var(--accent)] transition hover:opacity-70"
          >
            {impression.iem.manufacturer.name}
          </Link>

          <div className="mt-3 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                <Link
                  to={`/iems/${impression.iem.slug}`}
                  className="transition hover:text-[var(--accent)]"
                >
                  {impression.iem.model}
                </Link>
              </h1>

              {impression.title && (
                <p className="mt-4 text-xl font-semibold">
                  {impression.title}
                </p>
              )}

              <Link
                to={`/reviewers/${impression.reviewer.slug}`}
                className="mt-6 inline-flex items-center gap-3 rounded-xl transition hover:opacity-80"
              >
                <ReviewerAvatar
                  name={impression.reviewer.name}
                  slug={impression.reviewer.slug}
                  size="sm"
                  shape="circle"
                  eager
                />

                <span className="text-[var(--muted)]">
                  Impression by{" "}
                  <span className="font-semibold text-[var(--accent)]">
                    {impression.reviewer.name}
                  </span>
                </span>
              </Link>

              {impression.publishedAt && (
                <p className="mt-4 text-sm text-[var(--muted)]">
                  {formatDate(
                    impression.publishedAt,
                  )}
                </p>
              )}

              {impression.artists.length > 0 && (
                <div className="mt-7">
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    Artists mentioned
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {impression.artists.map(
                      (artist) => (
                        <Link
                          key={artist.id}
                          to={`/artists/${artist.slug}`}
                          className="rounded-full border border-[var(--accent)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-semibold transition hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                        >
                          {artist.name}
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              )}

              {impression.genres.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    Genres covered
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {impression.genres.map(
                      (genre) => (
                        <Link
                          key={genre.id}
                          to={`/genres/${genre.slug}`}
                          className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          {genre.name}
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="py-12">
          {impression.body ? (
            <div
              className="review-content"
              dangerouslySetInnerHTML={{
                __html: impression.body,
              }}
            />
          ) : (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
              This impression does not contain any
              additional text.
            </div>
          )}
        </section>

        {impression.sourceUrl && (
          <footer className="border-t border-[var(--border)] py-8">
            <a
              href={impression.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--accent)] transition hover:opacity-75"
            >
              View original Head-Fi post ↗
            </a>
          </footer>
        )}
      </article>
    </main>
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
      month: "long",
      year: "numeric",
    },
  ).format(date)
}

export default ImpressionPage