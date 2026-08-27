import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { Link } from "react-router"

import {
  getGenreDirectory,
  type GenreSummary,
} from "../lib/genres"

import usePageMetadata from "../hooks/usePageMetadata"

function GenresPage() {
  const [genres, setGenres] =
    useState<
      GenreSummary[]
    >([])

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(
      null,
    )

  usePageMetadata({
    title:
      "Genres | ITGE",

    description:
      "Explore ITGE IEM reviews and listening impressions by music genre.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadGenres() {
      try {
        const result =
          await getGenreDirectory()

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

  const filteredGenres =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLocaleLowerCase()

      if (!normalizedSearch) {
        return genres
      }

      return genres.filter(
        (genre) =>
          genre.name
            .toLocaleLowerCase()
            .includes(
              normalizedSearch,
            ),
      )
    }, [
      genres,
      searchQuery,
    ])

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
          Unable to load
          genres
        </p>

        <p className="mt-3">
          {error}
        </p>
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
            Explore reviews and
            listening impressions
            through the genres used
            by ITGE contributors
            when evaluating IEMs.
          </p>

          <p className="mt-4 text-sm text-[var(--muted)]">
            {genres.length}{" "}
            {genres.length ===
            1
              ? "genre"
              : "genres"}
          </p>
        </header>

        {genres.length > 0 && (
          <section className="mt-8">
            <label
              htmlFor="genre-search"
              className="block text-sm font-semibold text-[var(--muted)]"
            >
              Search genres
            </label>

            <div className="relative mt-3 max-w-xl">
              <SearchIcon />

              <input
                id="genre-search"
                type="search"
                value={
                  searchQuery
                }
                onChange={(
                  event,
                ) =>
                  setSearchQuery(
                    event.target
                      .value,
                  )
                }
                placeholder="Search by genre…"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-3.5 pl-11 pr-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
              />
            </div>

            {searchQuery.trim() && (
              <p className="mt-3 text-sm text-[var(--muted)]">
                {
                  filteredGenres.length
                }{" "}
                {filteredGenres.length ===
                1
                  ? "matching genre"
                  : "matching genres"}
              </p>
            )}
          </section>
        )}

        {genres.length ===
        0 ? (
          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            No genres with
            published coverage are
            available yet.
          </div>
        ) : filteredGenres.length ===
          0 ? (
          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="font-semibold">
              No matching genres
            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">
              No genres match
              {" "}
              <span className="font-medium text-[var(--foreground)]">
                “{searchQuery.trim()}”
              </span>
              .
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGenres.map(
              (genre) => (
                <Link
                  key={
                    genre.id
                  }
                  to={`/genres/${genre.slug}`}
                  className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                    Genre
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight transition group-hover:text-[var(--accent)]">
                    {
                      genre.name
                    }
                  </h2>

                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-4">
                    <Metric
                      value={
                        genre.reviewCount
                      }
                      label={
                        genre.reviewCount ===
                        1
                          ? "review"
                          : "reviews"
                      }
                    />

                    <Metric
                      value={
                        genre.impressionCount
                      }
                      label={
                        genre.impressionCount ===
                        1
                          ? "impression"
                          : "impressions"
                      }
                    />

                    <Metric
                      value={
                        genre.productCount
                      }
                      label={
                        genre.productCount ===
                        1
                          ? "IEM"
                          : "IEMs"
                      }
                    />

                    <Metric
                      value={
                        genre.contributorCount
                      }
                      label={
                        genre.contributorCount ===
                        1
                          ? "contributor"
                          : "contributors"
                      }
                    />
                  </div>
                </Link>
              ),
            )}
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
    <div className="min-w-0">
      <p className="font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs leading-4 text-[var(--muted)]">
        {label}
      </p>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function PageMessage({
  children,
}: {
  children:
    React.ReactNode
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