import {
  useEffect,
  useState,
} from "react"
import { Link } from "react-router"

import BrandLogo from "../components/brands/BrandLogo"
import StoreLogo from "../components/stores/StoreLogo"

import {
  getBrands,
  type BrandDirectoryItem,
} from "../lib/brands"

import {
  getSupportingStores,
  type Store,
} from "../lib/stores"

import usePageMetadata from "../hooks/usePageMetadata"

function BrandsPage() {
  const [
    brands,
    setBrands,
  ] =
    useState<
      BrandDirectoryItem[]
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
      "Browse audio brands covered by IEM Tour Group Europe through reviews and listening impressions.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadPage() {
      try {
        const [
          brandResult,
          storeResult,
        ] =
          await Promise.all([
            getBrands(),
            getSupportingStores(),
          ])

        if (!cancelled) {
          setBrands(
            brandResult,
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

              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Stores that support our tours
              </h1>

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
                    className="group flex min-h-[210px] flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-8">
                      <div className="min-w-0 flex-1">
                        {store.country && (
                          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                            {formatCountry(
                              store.country,
                            )}
                          </p>
                        )}

                        <h2
                          className={`break-words text-2xl font-semibold tracking-tight transition group-hover:text-[var(--accent)] ${
                            store.country
                              ? "mt-2"
                              : ""
                          }`}
                        >
                          {store.name}
                        </h2>
                      </div>

                      <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-xl bg-white p-3">
                        <StoreLogo
                          name={
                            store.name
                          }
                          slug={
                            store.slug
                          }
                          className="max-h-full max-w-full"
                        />
                      </div>
                    </div>

                    {store.description && (
                      <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
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
              : ""
          }
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Directory
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              All brands
            </h2>
          </div>

          {brands.length ===
          0 ? (
            <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
              No brands with
              published coverage are
              available yet.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {brands.map(
                (
                  brand,
                ) => (
                  <Link
                    key={
                      brand.id
                    }
                    to={`/brands/${brand.slug}`}
                    className="group overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
                  >
                    <div className="flex aspect-[4/3] items-center justify-center bg-white p-7">
                      <BrandLogo
                        name={
                          brand.name
                        }
                        slug={
                          brand.slug
                        }
                        size="card"
                        className="max-h-full max-w-full"
                      />
                    </div>

                    <div className="border-t border-[var(--border)] px-5 py-4">
                      <h3 className="break-words text-lg font-semibold tracking-tight transition group-hover:text-[var(--accent)]">
                        {
                          brand.name
                        }
                      </h3>
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

function PageMessage({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl text-[var(--muted)]">
        {children}
      </div>
    </main>
  )
}

export default BrandsPage