import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { Link, useParams } from "react-router"

import ReviewGrid from "../components/reviews/ReviewGrid"
import ReviewerAvatar from "../components/reviewers/ReviewerAvatar"

import {
  getIemBySlug,
  type IemProfile,
} from "../lib/iems"

function IemPage() {
  const { slug } = useParams<{ slug: string }>()

  const [iem, setIem] =
    useState<IemProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false

    async function loadIem() {
      if (!slug) {
        setError("No IEM was specified.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await getIemBySlug(slug)

        if (!cancelled) {
          setIem(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load IEM:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The IEM page could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadIem()

    return () => {
      cancelled = true
    }
  }, [slug])

  const totalReviewerReviews = useMemo(
    () =>
      iem?.reviewers.reduce(
        (total, reviewer) =>
          total + reviewer.reviewCount,
        0,
      ) ?? 0,
    [iem],
  )

  if (loading) {
    return (
      <PageMessage>
        Loading IEM…
      </PageMessage>
    )
  }

  if (error) {
    return (
      <PageMessage>
        <p className="text-xl font-semibold">
          Unable to load IEM
        </p>

        <p className="mt-3 text-[var(--muted)]">
          {error}
        </p>
      </PageMessage>
    )
  }

  if (!iem) {
    return (
      <PageMessage>
        <p className="text-xl font-semibold">
          IEM not found
        </p>

        <Link
          to="/discover"
          className="mt-8 inline-block font-medium text-[var(--accent)]"
        >
          ← Back to Discover
        </Link>
      </PageMessage>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                {iem.manufacturer.name}
              </p>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
                {iem.model}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                Community reviews, reviewer coverage
                and music references for the{" "}
                {iem.manufacturer.name} {iem.model}.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Published reviews"
                  value={iem.reviews.length.toString()}
                />

                <StatCard
                  label="Average rating"
                  value={
                    iem.averageRating == null
                      ? "—"
                      : `${iem.averageRating.toFixed(
                          1,
                        )}/5`
                  }
                />

                <StatCard
                  label="Reviewers"
                  value={iem.reviewers.length.toString()}
                />
              </div>
            </div>

            {iem.heroImageUrl ? (
              <img
                src={iem.heroImageUrl}
                alt={`${iem.manufacturer.name} ${iem.model}`}
                className="aspect-[16/10] h-full w-full object-cover lg:aspect-auto"
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center border-t border-[var(--border)] bg-[var(--surface-soft)] p-8 text-center text-[var(--muted)] lg:border-l lg:border-t-0">
                No IEM image is available yet.
              </div>
            )}
          </div>
        </header>

        {iem.reviewers.length > 0 && (
          <section className="mt-12">
            <SectionHeader
              eyebrow="Community"
              title="Reviewed by"
              description={`${iem.reviewers.length} ${
                iem.reviewers.length === 1
                  ? "reviewer has"
                  : "reviewers have"
              } published ${totalReviewerReviews} ${
                totalReviewerReviews === 1
                  ? "review"
                  : "reviews"
              } of this IEM.`}
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {iem.reviewers.map((reviewer) => (
                <Link
                  key={reviewer.slug}
                  to={`/reviewers/${reviewer.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                >
                  <ReviewerAvatar
                    name={reviewer.name}
                    slug={reviewer.slug}
                    size="md"
                    shape="circle"
                  />

                  <div className="min-w-0">
                    <p className="truncate font-semibold group-hover:text-[var(--accent)]">
                      {reviewer.name}
                    </p>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {reviewer.reviewCount}{" "}
                      {reviewer.reviewCount === 1
                        ? "review"
                        : "reviews"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(iem.artists.length > 0 ||
          iem.genres.length > 0) && (
          <section className="mt-12 grid gap-8 lg:grid-cols-2">
            {iem.artists.length > 0 && (
              <TagPanel
                eyebrow="Listening references"
                title="Artists mentioned"
              >
                {iem.artists.map((artist) => (
                  <Link
                    key={artist.id}
                    to={`/reviews?artist=${encodeURIComponent(
                      artist.slug,
                    )}`}
                    className="rounded-full border border-[var(--accent)]/45 bg-[var(--accent)]/10 px-3 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                  >
                    {artist.name}
                  </Link>
                ))}
              </TagPanel>
            )}

            {iem.genres.length > 0 && (
              <TagPanel
                eyebrow="Music coverage"
                title="Genres represented"
              >
                {iem.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    to={`/reviews?genre=${encodeURIComponent(
                      genre.slug,
                    )}`}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {genre.name}
                  </Link>
                ))}
              </TagPanel>
            )}
          </section>
        )}

        <section className="mt-14">
          <SectionHeader
            eyebrow="Review library"
            title={`Reviews of ${iem.model}`}
            description={
              iem.reviews.length === 0
                ? "No published reviews are available yet."
                : `Read every published ITGE review of the ${iem.manufacturer.name} ${iem.model}.`
            }
          />

          <div className="mt-8">
            {iem.reviews.length === 0 ? (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                This IEM does not have any published
                reviews yet.
              </div>
            ) : (
              <ReviewGrid reviews={iem.reviews} />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function PageMessage({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl text-[var(--muted)]">
        {children}
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
      <p className="text-sm text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold">
        {value}
      </p>
    </div>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-semibold tracking-tight">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        {description}
      </p>
    </div>
  )
}

function TagPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-semibold">
        {title}
      </h2>

      <div className="mt-5 flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  )
}

export default IemPage