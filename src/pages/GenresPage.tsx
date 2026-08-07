import {
  useEffect,
  useState,
} from "react"
import { Link } from "react-router"

import {
  getGenreDirectory,
  type GenreSummary,
} from "../lib/genres"

function GenresPage() {
  const [genres, setGenres] = useState<
    GenreSummary[]
  >([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<
    string | null
  >(null)

  useEffect(() => {
    let cancelled = false

    async function loadGenres() {
      try {
        const result = await getGenreDirectory()

        if (!cancelled) {
          setGenres(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load genres:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The genres could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadGenres()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <PageMessage>
        Loading genres…
      </PageMessage>
    )
  }

  if (error) {
    return (
      <PageMessage>
        <p className="text-xl font-semibold text-[var(--foreground)]">
          Unable to load genres
        </p>

        <p className="mt-3">{error}</p>
      </PageMessage>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Music directory
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
            Genres
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Explore reviews through the genres used
            by ITGE reviewers when evaluating IEMs.
          </p>

          <p className="mt-4 text-sm text-[var(--muted)]">
            {genres.length}{" "}
            {genres.length === 1
              ? "genre"
              : "genres"}
          </p>
        </header>

        {genres.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            No genres with published reviews are
            available yet.
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {genres.map((genre) => (
              <Link
                key={genre.id}
                to={`/genres/${genre.slug}`}
                className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                  Genre
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight transition group-hover:text-[var(--accent)]">
                  {genre.name}
                </h2>

                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-5">
                  <Metric
                    value={genre.reviewCount}
                    label={
                      genre.reviewCount === 1
                        ? "review"
                        : "reviews"
                    }
                  />

                  <Metric
                    value={genre.iemCount}
                    label={
                      genre.iemCount === 1
                        ? "IEM"
                        : "IEMs"
                    }
                  />

                  <Metric
                    value={genre.reviewerCount}
                    label={
                      genre.reviewerCount === 1
                        ? "reviewer"
                        : "reviewers"
                    }
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function Metric({
  value,
  label,
}: {
  value: number
  label: string
}) {
  return (
    <div>
      <p className="font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        {label}
      </p>
    </div>
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

export default GenresPage