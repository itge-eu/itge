import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { Link } from "react-router"

import DirectoryControls from "../components/directory/DirectoryControls"
import DirectorySearchInput from "../components/directory/DirectorySearchInput"
import DirectoryResultsBar from "../components/directory/DirectoryResultsBar"
import ReviewerAvatar from "../components/reviewers/ReviewerAvatar"

import {
  countryCodeToName,
  getReviewers,
  type ReviewerSummary,
} from "../lib/reviewers"

import usePageMetadata from "../hooks/usePageMetadata"

type MemberSortMode =
  | "activity"
  | "alphabetical"

type MemberStatus =
  | "all"
  | "active"
  | "former"

const SORT_OPTIONS: {
  value: MemberSortMode
  label: string
}[] = [
  {
    value: "activity",
    label: "Most active",
  },
  {
    value: "alphabetical",
    label: "A–Z",
  },
]

function ReviewersPage() {
  const [
    reviewers,
    setReviewers,
  ] =
    useState<
      ReviewerSummary[]
    >([])

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("")

  const [
    status,
    setStatus,
  ] =
    useState<MemberStatus>(
      "all",
    )

  const [
    sortMode,
    setSortMode,
  ] =
    useState<MemberSortMode>(
      "activity",
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  usePageMetadata({
    title:
      "Members | ITGE",

    description:
      "Meet the members of IEM Tour Group Europe and explore their reviews and listening impressions.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadReviewers() {
      setLoading(true)
      setError(null)

      try {
        const result =
          await getReviewers()

        if (!cancelled) {
          setReviewers(
            result,
          )
        }
      } catch (loadError) {
        console.error(
          "Could not load members:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The members could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(
            false,
          )
        }
      }
    }

    void loadReviewers()

    return () => {
      cancelled = true
    }
  }, [])

  const activeCount =
    useMemo(
      () =>
        reviewers.filter(
          (reviewer) =>
            reviewer.active,
        ).length,
      [reviewers],
    )

  const formerCount =
    reviewers.length -
    activeCount

  const visibleReviewers =
    useMemo(() => {
      const normalizedQuery =
        searchQuery
          .trim()
          .toLocaleLowerCase()

      const filtered =
        reviewers.filter(
          (reviewer) => {
            if (
              status ===
                "active" &&
              !reviewer.active
            ) {
              return false
            }

            if (
              status ===
                "former" &&
              reviewer.active
            ) {
              return false
            }

            if (
              !normalizedQuery
            ) {
              return true
            }

            const country =
              reviewer.country
                ? countryCodeToName(
                    reviewer.country,
                  )
                : ""

            const searchable =
              [
                reviewer.name,
                reviewer.title,
                reviewer.country,
                country,
              ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase()

            return searchable.includes(
              normalizedQuery,
            )
          },
        )

      return [...filtered].sort(
        (
          first,
          second,
        ) =>
          sortReviewers(
            first,
            second,
            sortMode,
          ),
      )
    }, [
      reviewers,
      searchQuery,
      status,
      sortMode,
    ])

  const hasFilters =
    status !== "all" ||
    Boolean(
      searchQuery.trim(),
    )

  const activeFilterCount =
    (status !== "all"
      ? 1
      : 0) +
    (searchQuery.trim()
      ? 1
      : 0)

  function clearFilters() {
    setStatus(
      "all",
    )

    setSearchQuery(
      "",
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            ITGE community
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
            Members
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Meet the members of
            ITGE sharing reviews,
            listening impressions
            and their experiences
            with gear touring
            across Europe.
          </p>
        </header>

        {loading ? (
          <DirectoryMessage>
            Loading members…
          </DirectoryMessage>
        ) : error ? (
          <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            {error}
          </div>
        ) : reviewers.length ===
          0 ? (
          <DirectoryMessage>
            No members are
            available yet.
          </DirectoryMessage>
        ) : (
          <>
            <DirectoryControls className="mt-10">
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Status
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="shrink-0 text-sm font-semibold text-[var(--accent)] transition hover:opacity-75"
                  >
                    Clear (
                    {
                      activeFilterCount
                    }
                    )
                  </button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <StatusButton
                  label="All"
                  count={
                    reviewers.length
                  }
                  active={
                    status ===
                    "all"
                  }
                  onClick={() =>
                    setStatus(
                      "all",
                    )
                  }
                />

                <StatusButton
                  label="Active"
                  count={
                    activeCount
                  }
                  active={
                    status ===
                    "active"
                  }
                  onClick={() =>
                    setStatus(
                      "active",
                    )
                  }
                />

                <StatusButton
                  label="Former"
                  count={
                    formerCount
                  }
                  active={
                    status ===
                    "former"
                  }
                  onClick={() =>
                    setStatus(
                      "former",
                    )
                  }
                />
              </div>

              <div className="mt-5 border-t border-[var(--border)] pt-5">
                <DirectorySearchInput
                  id="member-search"
                  value={
                    searchQuery
                  }
                  onChange={
                    setSearchQuery
                  }
                  placeholder="Search members…"
                />
              </div>
            </DirectoryControls>

            <DirectoryResultsBar
              count={
                visibleReviewers.length
              }
              singular="result"
              plural="results"
              sortValue={
                sortMode
              }
              sortOptions={
                SORT_OPTIONS
              }
              onSortChange={
                setSortMode
              }
              sortId="member-sort"
              caption="showing all"
            />

            {visibleReviewers.length ===
            0 ? (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
                <p className="font-semibold">
                  No matching
                  members
                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  No members match
                  the current
                  filters.
                </p>
              </div>
            ) : (
              <section className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleReviewers.map(
                  (
                    reviewer,
                  ) => (
                    <ReviewerCard
                      key={
                        reviewer.id
                      }
                      reviewer={
                        reviewer
                      }
                    />
                  ),
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function StatusButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      aria-pressed={
        active
      }
      className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
          : "border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]"
      }`}
    >
      {label}

      <span
        className={`ml-2 ${
          active
            ? "opacity-75"
            : "text-[var(--muted)]"
        }`}
      >
        {count}
      </span>
    </button>
  )
}

function sortReviewers(
  first: ReviewerSummary,
  second: ReviewerSummary,
  sortMode: MemberSortMode,
): number {
  if (
    sortMode ===
    "alphabetical"
  ) {
    return first.name.localeCompare(
      second.name,
      undefined,
      {
        sensitivity:
          "base",
      },
    )
  }

  const firstActivity =
    first.reviewCount +
    first.impressionCount

  const secondActivity =
    second.reviewCount +
    second.impressionCount

  if (
    firstActivity !==
    secondActivity
  ) {
    return (
      secondActivity -
      firstActivity
    )
  }

  return first.name.localeCompare(
    second.name,
    undefined,
    {
      sensitivity:
        "base",
    },
  )
}

function ReviewerCard({
  reviewer,
}: {
  reviewer:
    ReviewerSummary
}) {
  return (
    <Link
      to={`/members/${reviewer.slug}`}
      className="group flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <ReviewerAvatar
            name={
              reviewer.name
            }
            slug={
              reviewer.slug
            }
            size="lg"
            shape="rounded"
          />

          {!reviewer.active && (
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-black/25" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 truncate text-xl font-semibold transition group-hover:text-[var(--accent)]">
              {
                reviewer.name
              }
            </h2>

            <StatusPill
              active={
                reviewer.active
              }
            />
          </div>

          <p
            className="mt-1 truncate text-sm font-medium text-[var(--muted)]"
            title={
              reviewer.title
            }
          >
            {
              reviewer.title
            }
          </p>

          {reviewer.country && (
            <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted)]">
              <span
                className={`fi fi-${reviewer.country.toLowerCase()} rounded-sm`}
                aria-hidden="true"
              />

              <span className="truncate">
                {countryCodeToName(
                  reviewer.country,
                )}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--border)]" />

      <div className="mt-auto grid grid-cols-2 gap-4 pt-5">
        <MemberMetric
          value={
            reviewer.reviewCount
          }
          singular="review"
          plural="reviews"
        />

        <MemberMetric
          value={
            reviewer.impressionCount
          }
          singular="impression"
          plural="impressions"
        />
      </div>
    </Link>
  )
}

function StatusPill({
  active,
}: {
  active: boolean
}) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        active
          ? "border-[var(--accent)]/35 bg-[var(--accent)]/10 text-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]"
      }`}
    >
      {active
        ? "Active"
        : "Former"}
    </span>
  )
}

function MemberMetric({
  value,
  singular,
  plural,
}: {
  value: number
  singular: string
  plural: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        {value === 1
          ? singular
          : plural}
      </p>
    </div>
  )
}

function DirectoryMessage({
  children,
}: {
  children:
    React.ReactNode
}) {
  return (
    <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
      {children}
    </div>
  )
}

export default ReviewersPage