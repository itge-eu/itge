import {
  useEffect,
  useState,
} from "react"
import { Link } from "react-router"

import ManufacturerLogo from "../components/manufacturers/ManufacturerLogo"

import {
  getManufacturers,
  type ManufacturerDirectoryItem,
} from "../lib/manufacturers"

import usePageMetadata from "../hooks/usePageMetadata"

function ManufacturersPage() {
  const [
    manufacturers,
    setManufacturers,
  ] =
    useState<
      ManufacturerDirectoryItem[]
    >([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(
      null,
    )

  usePageMetadata({
    title:
      "Manufacturers | ITGE",

    description:
      "Browse IEM manufacturers covered by IEM Tour Group Europe through reviews and listening impressions.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadManufacturers() {
      try {
        const result =
          await getManufacturers()

        if (!cancelled) {
          setManufacturers(
            result,
          )
        }
      } catch (loadError) {
        console.error(
          "Could not load manufacturers:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The manufacturers could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadManufacturers()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <PageMessage>
        Loading manufacturers…
      </PageMessage>
    )
  }

  if (error) {
    return (
      <PageMessage>
        <p className="text-xl font-semibold text-[var(--foreground)]">
          Unable to load
          manufacturers
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
            Directory
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
            Manufacturers
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Explore manufacturers
            represented across the
            ITGE library through full
            reviews and short-form
            listening impressions.
          </p>

          <p className="mt-4 text-sm text-[var(--muted)]">
            {manufacturers.length}{" "}
            {manufacturers.length ===
            1
              ? "manufacturer"
              : "manufacturers"}
          </p>
        </header>

        {manufacturers.length ===
        0 ? (
          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            No manufacturers with
            published coverage are
            available yet.
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {manufacturers.map(
              (
                manufacturer,
              ) => (
                <Link
                  key={
                    manufacturer.id
                  }
                  to={`/manufacturers/${manufacturer.slug}`}
                  className="group flex min-h-[220px] flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
                >
                  <div className="flex min-h-24 items-start justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                        Manufacturer
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
      </div>
    </main>
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