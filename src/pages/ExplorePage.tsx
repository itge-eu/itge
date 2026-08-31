import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Link,
  useSearchParams,
} from "react-router"

import DirectoryControls from "../components/directory/DirectoryControls"
import DirectorySearchInput from "../components/directory/DirectorySearchInput"
import DirectorySortSelect from "../components/directory/DirectorySortSelect"

import {
  getArtists,
  type ArtistSummary,
} from "../lib/artists"

import {
  getGenreDirectory,
  type GenreSummary,
} from "../lib/genres"

import usePageMetadata from "../hooks/usePageMetadata"

type ExploreView =
  | "artists"
  | "genres"

type ExploreSort =
  | "most-referenced"
  | "alphabetical"
  | "most-reviews"
  | "most-impressions"

const SORT_OPTIONS: {
  value: ExploreSort
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

function ExplorePage() {
  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams()

  const initialView =
    searchParams.get(
      "view",
    ) === "genres"
      ? "genres"
      : "artists"

  const [
    view,
    setView,
  ] =
    useState<ExploreView>(
      initialView,
    )

  const [
    artists,
    setArtists,
  ] =
    useState<
      ArtistSummary[]
    >([])

  const [
    genres,
    setGenres,
  ] =
    useState<
      GenreSummary[]
    >([])

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("")

  const [
    sort,
    setSort,
  ] =
    useState<ExploreSort>(
      "most-referenced",
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  usePageMetadata({
    title:
      "Explore | ITGE",

    description:
      "Explore the artists and genres referenced throughout ITGE reviews and listening impressions.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadExploreData() {
      setLoading(true)
      setError(null)

      try {
        const [
          artistResult,
          genreResult,
        ] =
          await Promise.all([
            getArtists(),
            getGenreDirectory(),
          ])

        if (!cancelled) {
          setArtists(
            artistResult,
          )

          setGenres(
            genreResult,
          )
        }
      } catch (
        loadError
      ) {
        console.error(
          "Could not load explore data:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The Explore directory could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadExploreData()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const requestedView =
      searchParams.get(
        "view",
      ) === "genres"
        ? "genres"
        : "artists"

    setView(
      requestedView,
    )
  }, [
    searchParams,
  ])

  const visibleArtists =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLocaleLowerCase()

      const filtered =
        artists.filter(
          (artist) => {
            if (
              !normalizedSearch
            ) {
              return true
            }

            const searchable =
              [
                artist.name,
                artist.artistType,
                artist.country,
              ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase()

            return searchable.includes(
              normalizedSearch,
            )
          },
        )

      return [...filtered].sort(
        (
          first,
          second,
        ) =>
          compareDirectoryItems(
            first,
            second,
            sort,
          ),
      )
    }, [
      artists,
      searchQuery,
      sort,
    ])

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
        ) =>
          compareDirectoryItems(
            first,
            second,
            sort,
          ),
      )
    }, [
      genres,
      searchQuery,
      sort,
    ])

  const handleViewChange = (
    nextView: ExploreView,
  ) => {
    setView(
      nextView,
    )

    setSearchQuery(
      "",
    )

    if (
      nextView ===
      "genres"
    ) {
      setSearchParams({
        view: "genres",
      })
    } else {
      setSearchParams({})
    }
  }

  if (loading) {
    return (
      <PageMessage>
        Loading Explore…
      </PageMessage>
    )
  }

  if (error) {
    return (
      <PageMessage>
        <p className="text-xl font-semibold text-[var(--foreground)]">
          Unable to load
          Explore
        </p>

        <p className="mt-3">
          {error}
        </p>
      </PageMessage>
    )
  }

  const resultCount =
    view ===
    "artists"
      ? visibleArtists.length
      : visibleGenres.length

  const totalCount =
    view ===
    "artists"
      ? artists.length
      : genres.length

  const singularLabel =
    view ===
    "artists"
      ? "artist"
      : "genre"

  const pluralLabel =
    view ===
    "artists"
      ? "artists"
      : "genres"

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Explore
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
            Explore ITGE
          </h1>

          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Discover ITGE coverage
            through the music our
            contributors use when
            evaluating gear. Explore
            artists and genres now,
            with more ways to browse
            the database coming later.
          </p>
        </header>

        <DirectoryControls className="mt-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Music
            </p>

            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
              Explore by
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <ExploreViewButton
                active={
                  view ===
                  "artists"
                }
                label="Artists"
                count={
                  artists.length
                }
                onClick={() =>
                  handleViewChange(
                    "artists",
                  )
                }
              />

              <ExploreViewButton
                active={
                  view ===
                  "genres"
                }
                label="Genres"
                count={
                  genres.length
                }
                onClick={() =>
                  handleViewChange(
                    "genres",
                  )
                }
              />
            </div>
          </div>

          <div className="mt-5 border-t border-[var(--border)] pt-5">
            <DirectorySearchInput
              id="explore-search"
              value={
                searchQuery
              }
              onChange={
                setSearchQuery
              }
              placeholder={
                view ===
                "artists"
                  ? "Search by artist name…"
                  : "Search by genre name…"
              }
            />
          </div>
        </DirectoryControls>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-xl font-semibold">
              {resultCount}{" "}
              {resultCount ===
              1
                ? singularLabel
                : pluralLabel}
            </p>

            {searchQuery.trim() &&
              resultCount !==
                totalCount && (
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

          <div className="w-full sm:w-60">
            <DirectorySortSelect
              id="explore-sort"
              value={sort}
              options={
                SORT_OPTIONS
              }
              onChange={
                setSort
              }
            />
          </div>
        </div>

        {totalCount ===
        0 ? (
          <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            No {pluralLabel} with
            published coverage are
            available yet.
          </div>
        ) : resultCount ===
          0 ? (
          <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="font-semibold">
              No matching{" "}
              {pluralLabel}
            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">
              No {pluralLabel} match{" "}
              <span className="font-medium text-[var(--foreground)]">
                “
                {searchQuery.trim()}
                ”
              </span>
              .
            </p>
          </div>
        ) : view ===
          "artists" ? (
          <ArtistGrid
            artists={
              visibleArtists
            }
          />
        ) : (
          <GenreGrid
            genres={
              visibleGenres
            }
          />
        )}
      </div>
    </main>
  )
}

function ExploreViewButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={
        active
      }
      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
      }`}
    >
      {label}{" "}
      <span
        className={
          active
            ? "opacity-80"
            : "text-[var(--muted)]"
        }
      >
        {count}
      </span>
    </button>
  )
}

function ArtistGrid({
  artists,
}: {
  artists: ArtistSummary[]
}) {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {artists.map(
        (artist) => (
          <Link
            key={
              artist.id
            }
            to={`/artists/${artist.slug}`}
            className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {artist.artistType ??
                "Artist"}
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight transition group-hover:text-[var(--accent)]">
              {
                artist.name
              }
            </h2>

            {artist.country && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                {
                  artist.country
                }
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-4">
              <Metric
                value={
                  artist.reviewCount
                }
                label={
                  artist.reviewCount ===
                  1
                    ? "review"
                    : "reviews"
                }
              />

              <Metric
                value={
                  artist.impressionCount
                }
                label={
                  artist.impressionCount ===
                  1
                    ? "impression"
                    : "impressions"
                }
              />

              <Metric
                value={
                  artist.productCount
                }
                label="gear"
              />

              <Metric
                value={
                  artist.contributorCount
                }
                label={
                  artist.contributorCount ===
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
  )
}

function GenreGrid({
  genres,
}: {
  genres: GenreSummary[]
}) {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {genres.map(
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

function compareDirectoryItems(
  first:
    | ArtistSummary
    | GenreSummary,
  second:
    | ArtistSummary
    | GenreSummary,
  sort: ExploreSort,
): number {
  if (
    sort ===
    "alphabetical"
  ) {
    return first.name.localeCompare(
      second.name,
      undefined,
      {
        sensitivity:
          "base",
      },
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
      difference !==
      0
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
      difference !==
      0
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
      difference !==
      0
    ) {
      return difference
    }
  }

  return first.name.localeCompare(
    second.name,
    undefined,
    {
      sensitivity:
        "base",
    },
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

export default ExplorePage