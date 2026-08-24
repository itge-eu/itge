import {
  useEffect,
  useState,
} from "react"
import { Link } from "react-router"

import ManufacturerLogo from "../components/manufacturers/ManufacturerLogo"
import StoreLogo from "../components/stores/StoreLogo"

import {
  getManufacturers,
  type ManufacturerDirectoryItem,
} from "../lib/manufacturers"

import {
  getSupportingStores,
  type Store,
} from "../lib/stores"

import usePageMetadata from "../hooks/usePageMetadata"

function ManufacturersPage() {
  const [
    manufacturers,
    setManufacturers,
  ] =
    useState<
      ManufacturerDirectoryItem[]
    >([])

  const [
    stores,
    setStores,
  ] =
    useState<Store[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(
      null,
    )

  usePageMetadata({
    title:
      "Brands | ITGE",

    description:
      "Browse IEM brands covered by IEM Tour Group Europe through reviews and listening impressions.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadPage() {
      try {
        const [
          manufacturerResult,
          storeResult,
        ] =
          await Promise.all([
            getManufacturers(),
            getSupportingStores(),
          ])

        if (!cancelled) {
          setManufacturers(
            manufacturerResult,
          )

          setStores(
            storeResult,
          )
        }
      } catch (loadError) {
        console.error(
          "Could not load brands page:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The brands page could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadPage()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <PageMessage>
        Loading brands…
      </PageMessage>
    )
  }

  if (error) {
    return (
      <PageMessage>
        <p className="text-xl font-semibold text-[var(--foreground)]">
          Unable to load brands
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
        {stores.length > 0 && (
          <section>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Supporting ITGE
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Stores that support our tours
              </h2>

              <p className="mt-3 max-w-2xl text-[var(--muted)]">
                These retailers help make
                ITGE tours possible by
                supporting the group and
                helping us get more IEMs
                into the hands of European
                reviewers.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {stores.map(
                (store) => (
                  <a
                    key={store.id}
                    href={
                      store.website ??
                      undefined
                    }
                    target={
                      store.website
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      store.website
                        ? "noreferrer"
                        : undefined
                    }
                    className="group flex min-h-[220px] flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
                  >
                    <div className="flex min-h-24 items-center justify-between gap-8">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                          Supporting store
                        </p>

                        <h3 className="mt-2 break-words text-2xl font-semibold tracking-tight transition group-hover:text-[var(--accent)]">
                          {store.name}
                        </h3>

                        {store.country && (
                          <p className="mt-2 text-sm text-[var(--muted)]">
                            {formatCountry(
                              store.country,
                            )}
                          </p>
                        )}
                      </div>

                      <div className="flex min-h-20 min-w-0 flex-1 items-center justify-end">
                        <StoreLogo
                          name={
                            store.name
                          }
                          slug={
                            store.slug
                          }
                          className="max-h-20 max-w-full"
                        />
                      </div>
                    </div>

                    {store.description && (
                      <p className="mt-5 leading-7 text-[var(--muted)]">
                        {
                          store.description
                        }
                      </p>
                    )}

                    {store.website && (
                      <span className="mt-auto pt-6 font-semibold text-[var(--accent)]">
                        Visit store{" "}
                        <span aria-hidden="true">
                          ↗
                        </span>
                      </span>
                    )}
                  </a>
                ),
              )}
            </div>
          </section>
        )}

        <section
          className={
            stores.length > 0
              ? "mt-16 border-t border-[var(--border)] pt-14"
              : "mt-10"
          }
        >
          {stores.length > 0 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Directory
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                All brands
              </h2>

              <p className="mt-3 max-w-2xl text-[var(--muted)]">
                Browse every brand with
                published ITGE coverage.
              </p>
            </div>
          )}

          {manufacturers.length ===
          0 ? (
            <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
              No brands with
              published coverage are
              available yet.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {manufacturers.map(
                (
                  manufacturer,
                ) => (
                  <Link
                    key={
                      manufacturer.id
                    }
                    to={`/brands/${manufacturer.slug}`}
                    className="group flex min-h-[220px] flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
                  >
                    <div className="flex min-h-24 items-start justify-between gap-6">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                          Brand
                        </p>

                        <h2 className="mt-2 break-words text-2xl font-semibold tracking-tight transition group-hover:text-[var(--accent)]">
                          {
                            manufacturer.name
                          }
                        </h2>
                      </div>

                      <div className="flex min-h-16 min-w-0 flex-1 items-center justify-end">
                        <ManufacturerLogo
                          name={
                            manufacturer.name
                          }
                          slug={
                            manufacturer.slug
                          }
                          size="card"
                          className="max-h-16 max-w-full"
                        />
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-5">
                      <Metric
                        value={manufacturer.iemCount}
                        singular="IEM"
                        plural="IEMs"
                      />

                      <Metric
                        value={manufacturer.reviewCount}
                        singular="review"
                        plural="reviews"
                      />

                      <Metric
                        value={manufacturer.impressionCount}
                        singular="impression"
                        plural="impressions"
                      />
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function formatCountry(
  country: string,
): string {
  const names: Record<
    string,
    string
  > = {
    CH: "Switzerland",
    UK: "United Kingdom",
    GB: "United Kingdom",
  }

  return (
    names[
      country.toUpperCase()
    ] ?? country
  )
}

function Metric({
  value,
  singular,
  plural,
}: {
  value: number
  singular: string
  plural: string
}) {
  return (
    <div>
      <p className="text-xl font-semibold text-[var(--foreground)]">
        {value}
      </p>

      <p className="mt-1 text-xs leading-4 text-[var(--muted)]">
        {value === 1
          ? singular
          : plural}
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

export default ManufacturersPage