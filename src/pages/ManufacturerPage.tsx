import {
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Link,
  useParams,
} from "react-router"

import IemCard from "../components/iems/IemCard"
import ReviewGrid from "../components/reviews/ReviewGrid"
import ImpressionCard from "../components/impressions/ImpressionCard"
import ReviewerAvatar from "../components/reviewers/ReviewerAvatar"
import Breadcrumbs from "../components/navigation/Breadcrumbs"
import PageState from "../components/layout/PageState"

import {
  getManufacturerBySlug,
  type ManufacturerProfile,
} from "../lib/manufacturers"

import usePageMetadata from "../hooks/usePageMetadata"

function ManufacturerPage() {
  const { slug } =
    useParams<{ slug: string }>()

  const [
    manufacturer,
    setManufacturer,
  ] =
    useState<ManufacturerProfile | null>(
      null,
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  usePageMetadata({
    title: manufacturer
      ? `${manufacturer.name} | ITGE`
      : "Manufacturer | ITGE",

    description: manufacturer
      ? `Explore ${manufacturer.name} IEMs, reviews and listening impressions at ITGE.`
      : "Explore IEM manufacturers covered by ITGE.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadManufacturer() {
      if (!slug) {
        setError(
          "No manufacturer was specified.",
        )
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result =
          await getManufacturerBySlug(
            slug,
          )

        if (!cancelled) {
          setManufacturer(
            result,
          )
        }
      } catch (loadError) {
        console.error(
          "Could not load manufacturer:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The manufacturer page could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadManufacturer()

    return () => {
      cancelled = true
    }
  }, [slug])

  const totalIemCoverage =
    useMemo(
      () =>
        manufacturer?.iems.reduce(
          (total, iem) =>
            total +
            (iem.coverageCount ??
              iem.reviewCount),
          0,
        ) ?? 0,
      [manufacturer],
    )

  if (loading) {
    return (
      <PageState
        eyebrow="Manufacturer"
        title="Loading manufacturer…"
      />
    )
  }

  if (error) {
    return (
      <PageState
        eyebrow="Manufacturer"
        title="Unable to load manufacturer"
        message={error}
        backTo="/manufacturers"
        backLabel="Back to manufacturers"
      />
    )
  }

  if (!manufacturer) {
    return (
      <PageState
        eyebrow="404"
        title="Manufacturer not found"
        message="The manufacturer you were looking for doesn’t exist or is no longer available."
        backTo="/manufacturers"
        backLabel="Back to manufacturers"
      />
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs
          items={[
            {
              label:
                "Manufacturers",
              to: "/manufacturers",
            },
            {
              label:
                manufacturer.name,
            },
          ]}
        />

        <header className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Manufacturer
              </p>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
                {manufacturer.name}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                Explore{" "}
                {manufacturer.name}{" "}
                IEMs represented in
                the ITGE library,
                together with full
                reviews, listening
                impressions and the
                people who contributed
                them.
              </p>

              {manufacturer.website && (
                <a
                  href={
                    manufacturer.website
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 font-semibold text-[var(--accent)] transition hover:opacity-75"
                >
                  Visit manufacturer
                  website
                  <span aria-hidden="true">
                    ↗
                  </span>
                </a>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                  label="IEMs"
                  value={manufacturer.iems.length.toString()}
                />

                <StatCard
                  label="Reviews"
                  value={manufacturer.reviewCount.toString()}
                />

                <StatCard
                  label="Impressions"
                  value={manufacturer.impressionCount.toString()}
                />

                <StatCard
                  label="Contributors"
                  value={manufacturer.contributorCount.toString()}
                />

                <StatCard
                  label="Avg. review"
                  value={
                    manufacturer.averageRating ==
                    null
                      ? "—"
                      : `${manufacturer.averageRating.toFixed(
                          1,
                        )}/5`
                  }
                />
              </div>
            </div>

            {manufacturer.heroImageUrl ? (
              <img
                src={
                  manufacturer.heroImageUrl
                }
                alt={`${manufacturer.name} IEM`}
                className="aspect-[16/10] h-full w-full object-cover lg:aspect-auto"
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center border-t border-[var(--border)] bg-[var(--surface-soft)] p-8 text-center text-[var(--muted)] lg:border-l lg:border-t-0">
                No manufacturer
                image is available
                yet.
              </div>
            )}
          </div>
        </header>

        <section className="mt-14">
          <SectionHeader
            eyebrow="Product coverage"
            title={`${manufacturer.name} IEMs`}
            description={
              manufacturer.iems
                .length === 0
                ? "No IEMs with published coverage are available yet."
                : `${manufacturer.iems.length} ${
                    manufacturer.iems
                      .length === 1
                      ? "IEM is"
                      : "IEMs are"
                  } represented by ${totalIemCoverage} ${
                    totalIemCoverage ===
                    1
                      ? "published piece"
                      : "published pieces"
                  } of coverage.`
            }
          />

          {manufacturer.iems
            .length === 0 ? (
            <EmptyPanel>
              No covered IEMs from
              this manufacturer are
              available yet.
            </EmptyPanel>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {manufacturer.iems.map(
                (iem) => (
                  <IemCard
                    key={iem.id}
                    iem={iem}
                  />
                ),
              )}
            </div>
          )}
        </section>

        {manufacturer.contributors
          .length > 0 && (
          <section className="mt-14">
            <SectionHeader
              eyebrow="Community"
              title="Contributors"
              description={`${manufacturer.contributorCount} ${
                manufacturer.contributorCount ===
                1
                  ? "person has"
                  : "people have"
              } published coverage of ${manufacturer.name}.`}
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {manufacturer.contributors.map(
                (
                  contributor,
                ) => (
                  <Link
                    key={
                      contributor.slug
                    }
                    to={`/reviewers/${contributor.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                  >
                    <ReviewerAvatar
                      name={
                        contributor.name
                      }
                      slug={
                        contributor.slug
                      }
                      size="md"
                      shape="circle"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-semibold group-hover:text-[var(--accent)]">
                        {
                          contributor.name
                        }
                      </p>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {
                          contributor.reviewCount
                        }{" "}
                        {contributor.reviewCount ===
                        1
                          ? "review"
                          : "reviews"}
                        {" · "}
                        {
                          contributor.impressionCount
                        }{" "}
                        {contributor.impressionCount ===
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

        <section className="mt-14">
          <SectionHeader
            eyebrow="Full reviews"
            title={`Recent ${manufacturer.name} reviews`}
            description={
              manufacturer.latestReviews
                .length === 0
                ? "No published reviews are available yet."
                : `The latest published ITGE reviews covering ${manufacturer.name} IEMs.`
            }
          />

          {manufacturer.latestReviews
            .length === 0 ? (
            <EmptyPanel>
              No published reviews
              are available yet.
            </EmptyPanel>
          ) : (
            <div className="mt-8">
              <ReviewGrid
                reviews={
                  manufacturer.latestReviews
                }
              />
            </div>
          )}
        </section>

        <section className="mt-14 border-t border-[var(--border)] pt-14">
          <SectionHeader
            eyebrow="Listening notes"
            title={`Recent ${manufacturer.name} impressions`}
            description={
              manufacturer.latestImpressions
                .length === 0
                ? "No published impressions are available yet."
                : `The latest short-form listening impressions covering ${manufacturer.name} IEMs.`
            }
          />

          {manufacturer.latestImpressions
            .length === 0 ? (
            <EmptyPanel>
              No published
              impressions are
              available yet.
            </EmptyPanel>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {manufacturer.latestImpressions.map(
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

export default ManufacturerPage