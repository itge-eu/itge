import {
  useEffect,
  useState,
} from "react"
import { Link, useParams } from "react-router"

import Breadcrumbs from "../components/navigation/Breadcrumbs"
import ReviewGrid from "../components/reviews/ReviewGrid"
import ReviewerAvatar from "../components/reviewers/ReviewerAvatar"

import {
  getGenreBySlug,
  type GenreProfile,
} from "../lib/genres"

function GenrePage() {
  const { slug } = useParams<{ slug: string }>()

  const [genre, setGenre] =
    useState<GenreProfile | null>(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<
    string | null
  >(null)

  useEffect(() => {
    let cancelled = false

    async function loadGenre() {
      if (!slug) {
        setError("No genre was specified.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result =
          await getGenreBySlug(slug)

        if (!cancelled) {
          setGenre(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load genre:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The genre page could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadGenre()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <PageMessage>
        Loading genre…
      </PageMessage>
    )
  }

  if (error) {
    return (
      <PageMessage>
        <p className="text-xl font-semibold text-[var(--foreground)]">
          Unable to load genre
        </p>

        <p className="mt-3">
          {error}
        </p>
      </PageMessage>
    )
  }

  if (!genre) {
    return (
      <PageMessage>
        <p className="text-xl font-semibold text-[var(--foreground)]">
          Genre not found
        </p>

        <Link
          to="/genres"
          className="mt-8 inline-block font-medium text-[var(--accent)]"
        >
          ← Back to genres
        </Link>
      </PageMessage>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs
          items={[
            {
              label: "Genres",
              to: "/genres",
            },
            {
              label: genre.name,
            },
          ]}
        />

        <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Genre
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            {genre.name}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Explore the IEM reviews, products and
            reviewers connected to {genre.name}.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Published reviews"
              value={genre.reviewCount.toString()}
            />

            <StatCard
              label="IEMs"
              value={genre.iemCount.toString()}
            />

            <StatCard
              label="Reviewers"
              value={genre.reviewerCount.toString()}
            />
          </div>
        </header>

        <section className="mt-14">
          <SectionHeader
            eyebrow="Listening references"
            title={`Reviews covering ${genre.name}`}
            description={
              genre.reviews.length === 0
                ? "No published reviews are associated with this genre yet."
                : `${genre.reviews.length} ${
                    genre.reviews.length === 1
                      ? "published review covers"
                      : "published reviews cover"
                  } ${genre.name}.`
            }
          />

          {genre.reviews.length === 0 ? (
            <EmptyPanel>
              No published reviews are associated
              with this genre yet.
            </EmptyPanel>
          ) : (
            <div className="mt-8">
              <ReviewGrid reviews={genre.reviews} />
            </div>
          )}
        </section>

        {genre.iems.length > 0 && (
          <section className="mt-14">
            <SectionHeader
              eyebrow="IEM coverage"
              title={`IEMs reviewed with ${genre.name}`}
              description={`${genre.iems.length} ${
                genre.iems.length === 1
                  ? "IEM has"
                  : "IEMs have"
              } been evaluated in reviews covering ${genre.name}.`}
            />

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {genre.iems.map((iem) => (
                <Link
                  key={iem.id}
                  to={`/iems/${iem.slug}`}
                  className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
                >
                  <p className="text-sm uppercase tracking-[0.16em] text-[var(--accent)]">
                    {iem.manufacturerName}
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold tracking-tight transition group-hover:text-[var(--accent)]">
                    {iem.model}
                  </h3>

                  <p className="mt-5 text-sm text-[var(--muted)]">
                    {iem.reviewCount}{" "}
                    {iem.reviewCount === 1
                      ? "review"
                      : "reviews"}{" "}
                    covering {genre.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {genre.reviewers.length > 0 && (
          <section className="mt-14">
            <SectionHeader
              eyebrow="Community"
              title={`Reviewers covering ${genre.name}`}
              description={`${genre.reviewers.length} ${
                genre.reviewers.length === 1
                  ? "reviewer has"
                  : "reviewers have"
              } published reviews covering ${genre.name}.`}
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {genre.reviewers.map(
                (reviewer) => (
                  <Link
                    key={reviewer.id}
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
                      <p className="truncate font-semibold transition group-hover:text-[var(--accent)]">
                        {reviewer.name}
                      </p>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {reviewer.reviewCount}{" "}
                        {reviewer.reviewCount === 1
                          ? "review"
                          : "reviews"}{" "}
                        covering {genre.name}
                      </p>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </section>
        )}
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
      <div className="mx-auto max-w-7xl text-[var(--muted)]">
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

function EmptyPanel({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
      {children}
    </div>
  )
}

export default GenrePage