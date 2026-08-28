import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { Link } from "react-router"

import DirectoryControls from "../components/directory/DirectoryControls"
import DirectorySearchInput from "../components/directory/DirectorySearchInput"
import DirectorySortSelect from "../components/directory/DirectorySortSelect"
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

function ReviewersPage() {
  const [reviewers, setReviewers] = useState<
    ReviewerSummary[]
  >([])

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("")

  const [
    sortMode,
    setSortMode,
  ] =
    useState<MemberSortMode>(
      "activity",
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  usePageMetadata({
    title: "Members | ITGE",

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
          setReviewers(result)
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
          setLoading(false)
        }
      }
    }

    void loadReviewers()

    return () => {
      cancelled = true
    }
  }, [])

  const visibleReviewers =
    useMemo(() => {
      const normalizedQuery =
        searchQuery
          .trim()
          .toLocaleLowerCase()

      if (!normalizedQuery) {
        return reviewers
      }

      return reviewers.filter(
        (reviewer) => {
          const country =
            reviewer.country
              ? countryCodeToName(
                  reviewer.country,
                )
              : ""

          const searchable =
            [
              reviewer.name,
              reviewer.bio,
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
    }, [
      reviewers,
      searchQuery,
    ])

  const activeReviewers =
    visibleReviewers
      .filter(
        (reviewer) =>
          reviewer.active,
      )
      .sort(
        (first, second) =>
          sortReviewers(
            first,
            second,
            sortMode,
          ),
      )

  const formerReviewers =
    visibleReviewers
      .filter(
        (reviewer) =>
          !reviewer.active,
      )
      .sort(
        (first, second) =>
          sortReviewers(
            first,
            second,
            sortMode,
          ),
      )

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            ITGE community
          </p>

          <h1 className="mt-4 text-5xl font-semibold">
            Members
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Meet the members of ITGE sharing reviews,
            listening impressions and their experiences
            with gear touring across Europe.
          </p>
        </header>

        {loading ? (
          <p className="text-[var(--muted)]">
            Loading members…
          </p>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            {error}
          </div>
        ) : reviewers.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            No members are available yet.
          </div>
        ) : (
          <>
            <DirectoryControls>
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
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

                <DirectorySortSelect
                  id="member-sort"
                  value={sortMode}
                  onChange={
                    setSortMode
                  }
                  options={[
                    {
                      value:
                        "activity",
                      label:
                        "Most active",
                    },
                    {
                      value:
                        "alphabetical",
                      label:
                        "A–Z",
                    },
                  ]}
                />
              </div>
            </DirectoryControls>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-[var(--muted)]">
                {
                  visibleReviewers.length
                }{" "}
                {visibleReviewers.length === 1
                  ? "member"
                  : "members"}
              </p>

              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery(
                      "",
                    )
                  }
                  className="text-sm font-semibold text-[var(--accent)] transition hover:opacity-75"
                >
                  Clear search
                </button>
              )}
            </div>

            {visibleReviewers.length ===
            0 ? (
              <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
                <p className="font-semibold">
                  No matching members
                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  No members match{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    “{searchQuery.trim()}”
                  </span>
                  .
                </p>
              </div>
            ) : (
              <>
                {activeReviewers.length >
                  0 && (
                  <section className="mt-10">
                    <div className="mb-7">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                        ITGE community
                      </p>

                      <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                        Active members
                      </h2>

                      <p className="mt-2 text-[var(--muted)]">
                        Members currently participating in
                        IEM Tour Group Europe.
                      </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {activeReviewers.map(
                        (reviewer) => (
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
                    </div>
                  </section>
                )}

                {formerReviewers.length >
                  0 && (
                  <section
                    className={
                      activeReviewers.length >
                      0
                        ? "mt-16 border-t border-[var(--border)] pt-14"
                        : "mt-10"
                    }
                  >
                    <div className="mb-7">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        ITGE archive
                      </p>

                      <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                        Former members
                      </h2>

                      <p className="mt-2 max-w-2xl text-[var(--muted)]">
                        Previous members of ITGE. Their
                        reviews and listening impressions
                        remain part of our library.
                      </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {formerReviewers.map(
                        (reviewer) => (
                          <ReviewerCard
                            key={
                              reviewer.id
                            }
                            reviewer={
                              reviewer
                            }
                            former
                          />
                        ),
                      )}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
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
  )
}

function ReviewerCard({
  reviewer,
  former = false,
}: {
  reviewer: ReviewerSummary
  former?: boolean
}) {
  return (
    <Link
      to={`/members/${reviewer.slug}`}
      className={`group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:-translate-y-1 hover:border-[var(--accent)] ${
        former ? "opacity-80" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <ReviewerAvatar
            name={reviewer.name}
            slug={reviewer.slug}
            size="lg"
            shape="rounded"
          />

          {former && (
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-black/35" />
          )}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold transition group-hover:text-[var(--accent)]">
            {reviewer.name}
          </h3>

          {reviewer.country && (
            <p className="mt-1 flex items-center gap-2 text-sm text-[var(--muted)]">
              <span
                className={`fi fi-${reviewer.country.toLowerCase()} rounded-sm`}
                aria-hidden="true"
              />

              <span>
                {countryCodeToName(
                  reviewer.country,
                )}
              </span>
            </p>
          )}

          {former && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Former member
            </p>
          )}
        </div>
      </div>

      {reviewer.bio && (
        <p className="mt-5 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
          {reviewer.bio}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-[var(--accent)]">
        <span>
          {reviewer.reviewCount}{" "}
          {reviewer.reviewCount === 1
            ? "review"
            : "reviews"}
        </span>

        <span
          aria-hidden="true"
          className="text-[var(--muted)]"
        >
          ·
        </span>

        <span>
          {reviewer.impressionCount}{" "}
          {reviewer.impressionCount === 1
            ? "impression"
            : "impressions"}
        </span>
      </div>
    </Link>
  )
}

export default ReviewersPage