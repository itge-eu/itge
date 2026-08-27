import {
  useEffect,
  useState,
} from "react"

import {
  Link,
  useParams,
} from "react-router"

import Breadcrumbs from "../components/navigation/Breadcrumbs"
import ReviewGrid from "../components/reviews/ReviewGrid"
import ImpressionCard from "../components/impressions/ImpressionCard"
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
      ? `Explore IEM reviews and listening impressions that feature ${artist.name} as a listening reference.`
      : "Explore artists used as listening references by ITGE reviewers.",
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
        eyebrow="Artist"
        title="Loading artist…"
      />
    )
  }

  if (error) {
    return (
      <PageState
        eyebrow="Artist"
        title="Unable to load artist"
        message={error}
        backTo="/artists"
        backLabel="Back to artists"
      />
    )
  }

  if (!artist) {
    return (
      <PageState
        eyebrow="404"
        title="Artist not found"
        message="The artist you were looking for doesn’t exist or is no longer available."
        backTo="/artists"
        backLabel="Back to artists"
      />
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs
          items={[
            {
              label: "Artists",
              to: "/artists",
            },
            {
              label:
                artist.name,
            },
          ]}
        />

        <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10">
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
                  {artist.country}
                </span>
              )}

              {artist.musicbrainzId && (
                <a
                  href={`https://musicbrainz.org/artist/${artist.musicbrainzId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[var(--accent)] transition hover:opacity-75"
                >
                  View on
                  MusicBrainz ↗
                </a>
              )}
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Reviews"
              value={artist.reviewCount.toString()}
            />

            <StatCard
              label="Impressions"
              value={artist.impressionCount.toString()}
            />

            <StatCard
              label="IEMs"
              value={artist.productCount.toString()}
            />

            <StatCard
              label="Contributors"
              value={artist.contributorCount.toString()}
            />
          </div>
        </header>

        <section className="mt-14">
          <SectionHeader
            eyebrow="Full reviews"
            title={`Reviews featuring ${artist.name}`}
            description={
              artist.reviews.length ===
              0
                ? "No published reviews are associated with this artist yet."
                : `${artist.reviews.length} ${
                    artist.reviews
                      .length === 1
                      ? "published review references"
                      : "published reviews reference"
                  } ${artist.name}.`
            }
          />

          {artist.reviews.length ===
          0 ? (
            <EmptyPanel>
              No published reviews
              are associated with
              this artist yet.
            </EmptyPanel>
          ) : (
            <div className="mt-8">
              <ReviewGrid
                reviews={
                  artist.reviews
                }
              />
            </div>
          )}
        </section>

        <section className="mt-14 border-t border-[var(--border)] pt-14">
          <SectionHeader
            eyebrow="Listening notes"
            title={`Impressions featuring ${artist.name}`}
            description={
              artist.impressions
                .length === 0
                ? "No published impressions are associated with this artist yet."
                : `${artist.impressions.length} ${
                    artist.impressions
                      .length === 1
                      ? "published impression references"
                      : "published impressions reference"
                  } ${artist.name}.`
            }
          />

          {artist.impressions
            .length === 0 ? (
            <EmptyPanel>
              No published
              impressions are
              associated with this
              artist yet.
            </EmptyPanel>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {artist.impressions.map(
                (
                  impression,
                ) => (
                  <ImpressionCard
                    key={
                      impression.id
                    }
                    impression={
                      impression
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>

        {artist.products.length >
          0 && (
          <section className="mt-14">
            <SectionHeader
              eyebrow="IEM coverage"
              title={`IEMs heard with ${artist.name}`}
              description={`${artist.products.length} ${
                artist.products.length ===
                1
                  ? "IEM has"
                  : "IEMs have"
              } published coverage referencing ${artist.name}.`}
            />

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {artist.products.map(
                (product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
                  >
                    <p className="text-sm uppercase tracking-[0.16em] text-[var(--accent)]">
                      {
                        product.brandName
                      }
                    </p>

                    <h3 className="mt-2 text-2xl font-semibold tracking-tight transition group-hover:text-[var(--accent)]">
                      {product.model}
                    </h3>

                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
                      <span>
                        {
                          product.reviewCount
                        }{" "}
                        {product.reviewCount ===
                        1
                          ? "review"
                          : "reviews"}
                      </span>

                      <span>
                        {
                          product.impressionCount
                        }{" "}
                        {product.impressionCount ===
                        1
                          ? "impression"
                          : "impressions"}
                      </span>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </section>
        )}

        {artist.reviewers.length >
          0 && (
          <section className="mt-14">
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

export default ArtistPage