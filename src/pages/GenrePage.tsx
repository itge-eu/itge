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
  getGenreBySlug,
  type GenreProfile,
} from "../lib/genres"

function GenrePage() {
  const { slug } =
    useParams<{
      slug: string
    }>()

  const [genre, setGenre] =
    useState<GenreProfile | null>(
      null,
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(
      null,
    )

  usePageMetadata({
    title: genre
      ? `${genre.name} | ITGE`
      : "Genre | ITGE",

    description: genre
      ? `Explore ITGE reviews and listening impressions covering ${genre.name} music.`
      : "Explore ITGE coverage by music genre.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadGenre() {
      if (!slug) {
        setError(
          "No genre was specified.",
        )
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result =
          await getGenreBySlug(
            slug,
          )

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
      <PageState
        eyebrow="Genre"
        title="Loading genre…"
      />
    )
  }

  if (error) {
    return (
      <PageState
        eyebrow="Genre"
        title="Unable to load genre"
        message={error}
        backTo="/genres"
        backLabel="Back to genres"
      />
    )
  }

  if (!genre) {
    return (
      <PageState
        eyebrow="404"
        title="Genre not found"
        message="The genre you were looking for doesn’t exist or is no longer available."
        backTo="/genres"
        backLabel="Back to genres"
      />
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
              label:
                genre.name,
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
            Explore the reviews,
            listening
            impressions, gear
            and contributors
            connected to{" "}
            {genre.name}.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Reviews"
              value={genre.reviewCount.toString()}
            />

            <StatCard
              label="Impressions"
              value={genre.impressionCount.toString()}
            />

            <StatCard
              label="Gear"
              value={genre.productCount.toString()}
            />

            <StatCard
              label="Contributors"
              value={genre.contributorCount.toString()}
            />
          </div>
        </header>

        {genre.products.length >
          0 && (
          <section className="mt-14">
            <SectionHeader
              eyebrow="Gear coverage"
              title={`Gear heard with ${genre.name}`}
              description={`${genre.products.length} ${
                genre.products.length ===
                1
                  ? "piece of gear has"
                  : "pieces of gear have"
              } published coverage connected to ${genre.name}.`}
            />

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {genre.products.map(
                (product) => (
                  <Link
                    key={product.id}
                    to={`/gear/${product.slug}`}
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

        <section className="mt-14 border-t border-[var(--border)] pt-14">
          <SectionHeader
            eyebrow="Full reviews"
            title={`Reviews covering ${genre.name}`}
            description={
              genre.reviews.length ===
              0
                ? "No published reviews are associated with this genre yet."
                : `${genre.reviews.length} ${
                    genre.reviews
                      .length === 1
                      ? "published review covers"
                      : "published reviews cover"
                  } ${genre.name}.`
            }
          />

          {genre.reviews.length ===
          0 ? (
            <EmptyPanel>
              No published reviews
              are associated with
              this genre yet.
            </EmptyPanel>
          ) : (
            <div className="mt-8">
              <ReviewGrid
                reviews={
                  genre.reviews
                }
              />
            </div>
          )}
        </section>

        <section className="mt-14 border-t border-[var(--border)] pt-14">
          <SectionHeader
            eyebrow="Listening notes"
            title={`Impressions covering ${genre.name}`}
            description={
              genre.impressions
                .length === 0
                ? "No published impressions are associated with this genre yet."
                : `${genre.impressions.length} ${
                    genre.impressions
                      .length === 1
                      ? "published impression covers"
                      : "published impressions cover"
                  } ${genre.name}.`
            }
          />

          {genre.impressions
            .length === 0 ? (
            <EmptyPanel>
              No published
              impressions are
              associated with this
              genre yet.
            </EmptyPanel>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {genre.impressions.map(
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

        {genre.reviewers.length >
          0 && (
          <section className="mt-14 border-t border-[var(--border)] pt-14">
            <SectionHeader
              eyebrow="Community"
              title={`Contributors covering ${genre.name}`}
              description={`${genre.contributorCount} ${
                genre.contributorCount ===
                1
                  ? "person has"
                  : "people have"
              } published ITGE coverage connected to ${genre.name}.`}
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {genre.reviewers.map(
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

export default GenrePage