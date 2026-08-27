import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { Link } from "react-router"

import {
  getArtists,
  type ArtistSummary,
} from "../lib/artists"

import usePageMetadata from "../hooks/usePageMetadata"

function ArtistsPage() {
  const [artists, setArtists] =
    useState<
      ArtistSummary[]
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
      "Artists | ITGE",

    description:
      "Explore artists used as listening references across ITGE IEM reviews and listening impressions.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadArtists() {
      try {
        const result =
          await getArtists()

        if (!cancelled) {
          setArtists(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load artists:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The artists could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadArtists()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredArtists =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLocaleLowerCase()

      if (!normalizedSearch) {
        return artists
      }

      return artists.filter(
        (artist) => {
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
    }, [
      artists,
      searchQuery,
    ])

  if (loading) {
    return (
      <PageMessage>
        Loading artists…
      </PageMessage>
    )
  }

  if (error) {
    return (
      <PageMessage>
        <p className="text-xl font-semibold text-[var(--foreground)]">
          Unable to load
          artists
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
            Artists
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Explore the artists
            reviewers use as listening
            references across full
            reviews and short-form
            impressions.
          </p>

          <p className="mt-4 text-sm text-[var(--muted)]">
            {artists.length}{" "}
            {artists.length ===
            1
              ? "artist"
              : "artists"}
          </p>
        </header>

        {artists.length > 0 && (
          <section className="mt-8">
            <label
              htmlFor="artist-search"
              className="block text-sm font-semibold text-[var(--muted)]"
            >
              Search artists
            </label>

            <div className="relative mt-3 max-w-xl">
              <SearchIcon />

              <input
                id="artist-search"
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
                placeholder="Search by artist name…"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-3.5 pl-11 pr-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
              />
            </div>

            {searchQuery.trim() && (
              <p className="mt-3 text-sm text-[var(--muted)]">
                {
                  filteredArtists.length
                }{" "}
                {filteredArtists.length ===
                1
                  ? "matching artist"
                  : "matching artists"}
              </p>
            )}
          </section>
        )}

        {artists.length ===
        0 ? (
          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            No artists with
            published coverage are
            available yet.
          </div>
        ) : filteredArtists.length ===
          0 ? (
          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="font-semibold">
              No matching artists
            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">
              No artists match
              {" "}
              <span className="font-medium text-[var(--foreground)]">
                “{searchQuery.trim()}”
              </span>
              .
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArtists.map(
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
                      label={
                        artist.productCount ===
                        1
                          ? "IEM"
                          : "IEMs"
                      }
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

export default ArtistsPage