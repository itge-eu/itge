import {
  useEffect,
  useState,
} from "react"
import { Link } from "react-router"

import {
  getArtists,
  type ArtistSummary,
} from "../lib/artists"

function ArtistsPage() {
  const [artists, setArtists] = useState<
    ArtistSummary[]
  >([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<
    string | null
  >(null)

  useEffect(() => {
    let cancelled = false

    async function loadArtists() {
      try {
        const result = await getArtists()

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
          Unable to load artists
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
            Artists
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Explore the artists reviewers use when
            evaluating IEMs.
          </p>

          <p className="mt-4 text-sm text-[var(--muted)]">
            {artists.length}{" "}
            {artists.length === 1
              ? "artist"
              : "artists"}
          </p>
        </header>

        {artists.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            No artists with published reviews are
            available yet.
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist) => (
              <Link
                key={artist.id}
                to={`/artists/${artist.slug}`}
                className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                  {artist.artistType ?? "Artist"}
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight transition group-hover:text-[var(--accent)]">
                  {artist.name}
                </h2>

                {artist.country && (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {artist.country}
                  </p>
                )}

                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-5 text-sm">
                  <Metric
                    value={artist.reviewCount}
                    label={
                      artist.reviewCount === 1
                        ? "review"
                        : "reviews"
                    }
                  />

                  <Metric
                    value={artist.iemCount}
                    label={
                      artist.iemCount === 1
                        ? "IEM"
                        : "IEMs"
                    }
                  />

                  <Metric
                    value={artist.reviewerCount}
                    label={
                      artist.reviewerCount === 1
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

export default ArtistsPage