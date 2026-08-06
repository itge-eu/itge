import {
  useEffect,
  useMemo,
  useState,
} from "react"

import IemCard from "../components/iems/IemCard"

import {
  getIems,
  type IemDirectoryItem,
} from "../lib/iems"

type IemSort =
  | "most-reviewed"
  | "highest-rated"
  | "recent"
  | "alphabetical"

function IemsPage() {
  const [iems, setIems] = useState<
    IemDirectoryItem[]
  >([])

  const [searchQuery, setSearchQuery] =
    useState("")

  const [sort, setSort] =
    useState<IemSort>("most-reviewed")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false

    async function loadIems() {
      setLoading(true)
      setError(null)

      try {
        const result = await getIems()

        if (!cancelled) {
          setIems(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load IEM directory:",
          loadError,
        )

        if (!cancelled) {
          setIems([])
          setError(
            "The IEM directory could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadIems()

    return () => {
      cancelled = true
    }
  }, [])

  const visibleIems = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLocaleLowerCase()

    const filtered = normalizedQuery
      ? iems.filter((iem) => {
          const searchableText =
            `${iem.manufacturer.name} ${iem.model}`
              .toLocaleLowerCase()

          return searchableText.includes(
            normalizedQuery,
          )
        })
      : [...iems]

    return filtered.sort((first, second) => {
      if (sort === "highest-rated") {
        const ratingDifference =
          (second.averageRating ?? -1) -
          (first.averageRating ?? -1)

        if (ratingDifference !== 0) {
          return ratingDifference
        }

        return (
          second.reviewCount - first.reviewCount
        )
      }

      if (sort === "recent") {
        const firstTime = first.latestReviewAt
          ? new Date(
              first.latestReviewAt,
            ).getTime()
          : 0

        const secondTime = second.latestReviewAt
          ? new Date(
              second.latestReviewAt,
            ).getTime()
          : 0

        return secondTime - firstTime
      }

      if (sort === "alphabetical") {
        return `${first.manufacturer.name} ${first.model}`.localeCompare(
          `${second.manufacturer.name} ${second.model}`,
        )
      }

      const reviewDifference =
        second.reviewCount - first.reviewCount

      if (reviewDifference !== 0) {
        return reviewDifference
      }

      const ratingDifference =
        (second.averageRating ?? -1) -
        (first.averageRating ?? -1)

      if (ratingDifference !== 0) {
        return ratingDifference
      }

      return `${first.manufacturer.name} ${first.model}`.localeCompare(
        `${second.manufacturer.name} ${second.model}`,
      )
    })
  }, [iems, searchQuery, sort])

  const manufacturerCount = useMemo(
    () =>
      new Set(
        iems.map(
          (iem) => iem.manufacturer.id,
        ),
      ).size,
    [iems],
  )

  const totalReviewCount = useMemo(
    () =>
      iems.reduce(
        (total, iem) =>
          total + iem.reviewCount,
        0,
      ),
    [iems],
  )

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            ITGE library
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
            IEMs
          </h1>

          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Browse every IEM represented in the ITGE
            review library. Search by model or
            manufacturer, then open an IEM to explore
            its reviews, reviewers and music
            references.
          </p>
        </header>

        {!loading && !error && iems.length > 0 && (
          <section className="mt-10 grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="IEMs represented"
              value={iems.length.toString()}
            />

            <SummaryCard
              label="Manufacturers"
              value={manufacturerCount.toString()}
            />

            <SummaryCard
              label="Published reviews"
              value={totalReviewCount.toString()}
            />
          </section>
        )}

        <section className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem]">
            <label className="block">
              <span className="sr-only">
                Search IEMs
              </span>

              <div className="relative">
                <SearchIcon />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value,
                    )
                  }
                  placeholder="Search by IEM or manufacturer…"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] py-3 pl-11 pr-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
              </div>
            </label>

            <label className="block">
              <span className="sr-only">
                Sort IEMs
              </span>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target.value as IemSort,
                  )
                }
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
              >
                <option value="most-reviewed">
                  Most reviewed
                </option>

                <option value="highest-rated">
                  Highest rated
                </option>

                <option value="recent">
                  Recently reviewed
                </option>

                <option value="alphabetical">
                  A–Z
                </option>
              </select>
            </label>
          </div>
        </section>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted)]">
            {loading
              ? "Loading IEMs…"
              : `${visibleIems.length} ${
                  visibleIems.length === 1
                    ? "IEM"
                    : "IEMs"
                }`}
          </p>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-sm font-semibold text-[var(--accent)] transition hover:opacity-75"
            >
              Clear search
            </button>
          )}
        </div>

        {loading ? (
          <DirectoryMessage>
            Loading IEM directory…
          </DirectoryMessage>
        ) : error ? (
          <DirectoryMessage>
            <p className="font-semibold text-[var(--foreground)]">
              Unable to load IEMs
            </p>

            <p className="mt-2">{error}</p>
          </DirectoryMessage>
        ) : iems.length === 0 ? (
          <DirectoryMessage>
            No IEMs with published reviews are
            available yet.
          </DirectoryMessage>
        ) : visibleIems.length === 0 ? (
          <DirectoryMessage>
            No IEMs match “{searchQuery.trim()}”.
          </DirectoryMessage>
        ) : (
          <section className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visibleIems.map((iem) => (
              <IemCard
                key={iem.id}
                iem={iem}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-sm text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold">
        {value}
      </p>
    </div>
  )
}

function DirectoryMessage({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
      {children}
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
      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export default IemsPage