import {
  useEffect,
  useState,
} from "react"

import {
  Link,
  useParams,
} from "react-router"

import Breadcrumbs from "../components/navigation/Breadcrumbs"
import GroupedCoverage from "../components/explore/GroupedCoverage"
import ReviewerAvatar from "../components/reviewers/ReviewerAvatar"
import PageState from "../components/layout/PageState"

import usePageMetadata from "../hooks/usePageMetadata"

import {
  getArtistBySlug,
  type ArtistProfile,
} from "../lib/artists"

function ArtistPage() {
  const { slug } =
    useParams<{
      slug: string
    }>()

  const [artist, setArtist] =
    useState<ArtistProfile | null>(
      null,
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(
      null,
    )

  usePageMetadata({
    title: artist
      ? `${artist.name} | ITGE`
      : "Artist | ITGE",

    description: artist
      ? `Explore ITGE reviews and listening impressions that feature ${artist.name} as a listening reference.`
      : "Explore artists used as listening references by ITGE members.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadArtist() {
      if (!slug) {
        setError(
          "No artist was specified.",
        )
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result =
          await getArtistBySlug(
            slug,
          )

        if (!cancelled) {
          setArtist(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load artist:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The artist page could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadArtist()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <PageState
        eyebrow="Explore"
        title="Loading artist…"
      />
    )
  }

  if (error) {
    return (
      <PageState
        eyebrow="Explore"
        title="Unable to load artist"
        message={error}
        backTo="/explore?view=artists"
        backLabel="Back to explore"
      />
    )
  }

  if (!artist) {
    return (
      <PageState
        eyebrow="404"
        title="Artist not found"
        message="The artist you were looking for doesn’t exist or is no longer available."
        backTo="/explore?view=artists"
        backLabel="Back to explore"
      />
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs
          items={[
            {
              label: "Explore",
              to: "/explore?view=artists",
            },
            {
              label:
                artist.name,
            },
          ]}
        />

        <header className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          {artist.imageUrl && (
            <div className="relative aspect-[16/7] min-h-[280px] overflow-hidden">
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/5" />

              <div className="absolute inset-x-0 bottom-0 p-8 text-white sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  {artist.artistType ??
                    "Artist"}
                </p>

                <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
                  {artist.name}
                </h1>

                {(artist.country ||
                  artist.musicbrainzId) && (
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/75">
                    {artist.country && (
                      <span>
                        {
                          artist.country
                        }
                      </span>
                    )}

                    {artist.musicbrainzId && (
                      <a
                        href={`https://musicbrainz.org/artist/${artist.musicbrainzId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-[var(--accent)] transition hover:opacity-75"
                      >
                        View on MusicBrainz ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {!artist.imageUrl && (
            <div className="p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                {artist.artistType ??
                  "Artist"}
              </p>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
                {artist.name}
              </h1>

              {(artist.country ||
                artist.musicbrainzId) && (
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--muted)]">
                  {artist.country && (
                    <span>
                      {
                        artist.country
                      }
                    </span>
                  )}

                  {artist.musicbrainzId && (
                    <a
                      href={`https://musicbrainz.org/artist/${artist.musicbrainzId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[var(--accent)] transition hover:opacity-75"
                    >
                      View on MusicBrainz ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 border-t border-[var(--border)] p-8 sm:grid-cols-2 sm:p-10 lg:grid-cols-4">
            <StatCard
              label="Reviews"
              value={artist.reviewCount.toString()}
            />

            <StatCard
              label="Impressions"
              value={artist.impressionCount.toString()}
            />

            <StatCard
              label="Gear"
              value={artist.productCount.toString()}
            />

            <StatCard
              label="Contributors"
              value={artist.contributorCount.toString()}
            />
          </div>
        </header>

        <GroupedCoverage
          subjectName={
            artist.name
          }
          subjectKind="artist"
          reviews={
            artist.reviews
          }
          impressions={
            artist.impressions
          }
          products={
            artist.products
          }
        />

        {artist.reviewers.length >
          0 && (
          <section className="mt-14 border-t border-[var(--border)] pt-14">
            <SectionHeader
              eyebrow="Community"
              title={`Contributors listening with ${artist.name}`}
              description={`${artist.contributorCount} ${
                artist.contributorCount ===
                1
                  ? "person has"
                  : "people have"
              } referenced ${artist.name} in published ITGE coverage.`}
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {artist.reviewers.map(
                (
                  reviewer,
                ) => (
                  <Link
                    key={
                      reviewer.id
                    }
                    to={`/members/${reviewer.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                  >
                    <ReviewerAvatar
                      name={
                        reviewer.name
                      }
                      slug={
                        reviewer.slug
                      }
                      size="md"
                      shape="circle"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-semibold transition group-hover:text-[var(--accent)]">
                        {
                          reviewer.name
                        }
                      </p>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {
                          reviewer.reviewCount
                        }{" "}
                        {reviewer.reviewCount ===
                        1
                          ? "review"
                          : "reviews"}
                        {" · "}
                        {
                          reviewer.impressionCount
                        }{" "}
                        {reviewer.impressionCount ===
                        1
                          ? "impression"
                          : "impressions"}
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

export default ArtistPage