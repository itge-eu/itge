import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { Link } from "react-router"

import DirectoryControls from "../components/directory/DirectoryControls"
import DirectorySearchInput from "../components/directory/DirectorySearchInput"
import DirectorySortSelect from "../components/directory/DirectorySortSelect"

import {
  getGenreDirectory,
  type GenreSummary,
} from "../lib/genres"

import usePageMetadata from "../hooks/usePageMetadata"

type GenreSort =
  | "most-referenced"
  | "alphabetical"
  | "most-reviews"
  | "most-impressions"

const SORT_OPTIONS: {
  value: GenreSort
  label: string
}[] = [
  {
    value: "most-referenced",
    label: "Most referenced",
  },
  {
    value: "alphabetical",
    label: "A–Z",
  },
  {
    value: "most-reviews",
    label: "Most reviews",
  },
  {
    value: "most-impressions",
    label: "Most impressions",
  },
]

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

  const [sort, setSort] =
    useState<GenreSort>(
      "most-referenced",
    )

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
      "Explore ITGE reviews and listening impressions by music genre.",
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

  const visibleGenres =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLocaleLowerCase()

      const filtered =
        genres.filter(
          (genre) => {
            if (
              !normalizedSearch
            ) {
              return true
            }

            return genre.name
              .toLocaleLowerCase()
              .includes(
                normalizedSearch,
              )
          },
        )

      return [...filtered].sort(
        (
          first,
          second,
        ) => {
          if (
            sort ===
            "alphabetical"
          ) {
            return first.name.localeCompare(
              second.name,
            )
          }

          if (
            sort ===
            "most-reviews"
          ) {
            const difference =
              second.reviewCount -
              first.reviewCount

            if (
              difference !== 0
            ) {
              return difference
            }
          }

          if (
            sort ===
            "most-impressions"
          ) {
            const difference =
              second.impressionCount -
              first.impressionCount

            if (
              difference !== 0
            ) {
              return difference
            }
          }

          if (
            sort ===
            "most-referenced"
          ) {
            const firstCoverage =
              first.reviewCount +
              first.impressionCount

            const secondCoverage =
              second.reviewCount +
              second.impressionCount

            const difference =
              secondCoverage -
              firstCoverage

            if (
              difference !== 0
            ) {
              return difference
            }
          }

          return first.name.localeCompare(
            second.name,
          )
        },
      )
    }, [
      genres,
      searchQuery,
      sort,
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
            when evaluating gear.
          </p>

          <p className="mt-4 text-sm text-[var(--muted)]">
            {genres.length}{" "}
            {genres.length ===
            1
              ? "genre"
              : "genres"}
          </p>
        </header>

        {genres.length >
          0 && (
          <DirectoryControls className="mt-8">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem]">
              <DirectorySearchInput
                id="genre-search"
                value={
                  searchQuery
                }
                onChange={
                  setSearchQuery
                }
                placeholder="Search by genre…"
              />

              <DirectorySortSelect
                id="genre-sort"
                value={sort}
                options={
                  SORT_OPTIONS
                }
                onChange={
                  setSort
                }
              />
            </div>
          </DirectoryControls>
        )}

        {genres.length >
          0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[var(--muted)]">
              {
                visibleGenres.length
              }{" "}
              {visibleGenres.length ===
              1
                ? "genre"
                : "genres"}
            </p>

            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery(
                    "",
                  )
                }
                className="text-sm font-semibold text-[var(--accent)] transition hover:opacity-75"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {genres.length ===
        0 ? (
          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            No genres with
            published coverage are
            available yet.
          </div>
        ) : visibleGenres.length ===
          0 ? (
          <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="font-semibold">
              No matching genres
            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">
              No genres match{" "}
              <span className="font-medium text-[var(--foreground)]">
                “{searchQuery.trim()}”
              </span>
              .
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleGenres.map(
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
                      label="gear"
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