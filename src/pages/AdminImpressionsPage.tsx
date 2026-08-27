import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Link,
} from "react-router"

import {
  supabase,
} from "../lib/supabase"

type AdminImpression = {
  id: number

  title: string | null
  slug: string

  published: boolean

  published_at:
    | string
    | null

  source_post_id:
    | string
    | null

  reviewers:
    | {
        name: string
      }
    | {
        name: string
      }[]
    | null

  iems:
    | {
        model: string

        brands:
          | {
              name: string
            }
          | {
              name: string
            }[]
          | null
      }
    | {
        model: string

        brands:
          | {
              name: string
            }
          | {
              name: string
            }[]
          | null
      }[]
    | null
}

type StatusFilter =
  | "all"
  | "draft"
  | "published"

function getSingleRelation<T>(
  relation:
    | T
    | T[]
    | null
    | undefined,
): T | null {
  if (
    Array.isArray(
      relation,
    )
  ) {
    return (
      relation[0] ??
      null
    )
  }

  return relation ?? null
}

function formatDate(
  value:
    | string
    | null,
) {
  if (!value) {
    return ""
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date)
}

function AdminImpressionsPage() {
  const [
    impressions,
    setImpressions,
  ] =
    useState<
      AdminImpression[]
    >([])

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null)

  const [
    deletingImpressionId,
    setDeletingImpressionId,
  ] =
    useState<
      number | null
    >(null)

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      "all",
    )

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("")

  useEffect(() => {
    async function loadImpressions() {
      setLoading(true)
      setError(null)

      const {
        data,
        error:
          queryError,
      } =
        await supabase
          .from(
            "impressions",
          )
          .select(`
            id,
            title,
            slug,
            published,
            published_at,
            source_post_id,

            reviewers (
              name
            ),

            iems (
              model,

              brands (
                name
              )
            )
          `)
          .order(
            "id",
            {
              ascending:
                false,
            },
          )

      if (
        queryError
      ) {
        console.error(
          "Loading admin impressions failed:",
          queryError,
        )

        setError(
          queryError.message,
        )

        setLoading(
          false,
        )

        return
      }

      setImpressions(
        (
          data ?? []
        ) as unknown as AdminImpression[],
      )

      setLoading(
        false,
      )
    }

    void loadImpressions()
  }, [])

  async function handleDeleteImpression(
    impression:
      AdminImpression,
  ) {
    const displayName =
      impression.title
        ?.trim() ||
      `/impressions/${impression.slug}`

    const confirmed =
      window.confirm(
        `Delete "${displayName}" permanently?\n\n` +
          "This will delete the impression, its stored images and all related artist/genre tags. " +
          "This cannot be undone.",
      )

    if (!confirmed) {
      return
    }

    setDeletingImpressionId(
      impression.id,
    )

    setError(null)

    try {
      const {
        data,
        error:
          functionError,
      } =
        await supabase.functions.invoke<{
          deletedImpressionId?:
            number
          error?: string
        }>(
          "delete-impression",
          {
            body: {
              impressionId:
                impression.id,
            },
          },
        )

      if (
        functionError
      ) {
        throw new Error(
          functionError.message,
        )
      }

      if (
        data?.error
      ) {
        throw new Error(
          data.error,
        )
      }

      setImpressions(
        (
          currentImpressions,
        ) =>
          currentImpressions.filter(
            (
              currentImpression,
            ) =>
              currentImpression.id !==
              impression.id,
          ),
      )
    } catch (
      deleteError
    ) {
      console.error(
        "Deleting impression failed:",
        deleteError,
      )

      setError(
        deleteError instanceof
          Error
          ? deleteError.message
          : "The impression could not be deleted.",
      )
    } finally {
      setDeletingImpressionId(
        null,
      )
    }
  }

  const filteredImpressions =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLowerCase()

      return impressions.filter(
        (
          impression,
        ) => {
          if (
            statusFilter ===
              "draft" &&
            impression.published
          ) {
            return false
          }

          if (
            statusFilter ===
              "published" &&
            !impression.published
          ) {
            return false
          }

          if (
            !normalizedSearch
          ) {
            return true
          }

          const reviewer =
            getSingleRelation(
              impression.reviewers,
            )

          const iem =
            getSingleRelation(
              impression.iems,
            )

          const brand =
            getSingleRelation(
              iem?.brands,
            )

          const searchable =
            [
              impression.title,
              impression.slug,

              impression.source_post_id,

              reviewer?.name,

              brand?.name,

              iem?.model,
            ]
              .filter(
                Boolean,
              )
              .join(" ")
              .toLowerCase()

          return searchable.includes(
            normalizedSearch,
          )
        },
      )
    }, [
      impressions,
      searchQuery,
      statusFilter,
    ])

  const draftCount =
    useMemo(
      () =>
        impressions.filter(
          (
            impression,
          ) =>
            !impression.published,
        ).length,
      [impressions],
    )

  const publishedCount =
    impressions.length -
    draftCount

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="text-sm font-medium text-[var(--accent)]"
        >
          ← Back to homepage
        </Link>

        <header className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
              ITGE Admin
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              Impressions
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Manage imported
              listening
              impressions,
              edit drafts and
              publish completed
              entries.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/reviews"
              className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold transition hover:bg-[var(--surface)]"
            >
              Manage reviews
            </Link>

            <Link
              to="/admin/import"
              className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold transition hover:bg-[var(--surface)]"
            >
              Import review
            </Link>

            <Link
              to="/admin/import-impression"
              className="rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Import
              impression
            </Link>
          </div>
        </header>

        {!loading &&
          !error && (
            <section className="mt-10 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Total"
                value={
                  impressions.length
                }
              />

              <StatCard
                label="Drafts"
                value={
                  draftCount
                }
              />

              <StatCard
                label="Published"
                value={
                  publishedCount
                }
              />
            </section>
          )}

        {!loading &&
          !error &&
          impressions.length >
            0 && (
            <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    Filter
                    impressions
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusButton
                      label="All"
                      count={
                        impressions.length
                      }
                      active={
                        statusFilter ===
                        "all"
                      }
                      onClick={() =>
                        setStatusFilter(
                          "all",
                        )
                      }
                    />

                    <StatusButton
                      label="Drafts"
                      count={
                        draftCount
                      }
                      active={
                        statusFilter ===
                        "draft"
                      }
                      onClick={() =>
                        setStatusFilter(
                          "draft",
                        )
                      }
                    />

                    <StatusButton
                      label="Published"
                      count={
                        publishedCount
                      }
                      active={
                        statusFilter ===
                        "published"
                      }
                      onClick={() =>
                        setStatusFilter(
                          "published",
                        )
                      }
                    />
                  </div>
                </div>

                <div className="w-full lg:max-w-sm">
                  <label
                    htmlFor="admin-impression-search"
                    className="block text-sm font-semibold"
                  >
                    Search
                  </label>

                  <div className="relative mt-3">
                    <SearchIcon />

                    <input
                      id="admin-impression-search"
                      type="search"
                      value={
                        searchQuery
                      }
                      onChange={(
                        event,
                      ) =>
                        setSearchQuery(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="IEM, contributor, title…"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 pl-11 pr-4 outline-none transition focus:border-[var(--accent)]"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

        {loading && (
          <div className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="text-[var(--muted)]">
              Loading
              impressions…
            </p>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            <p className="font-semibold">
              Something went
              wrong.
            </p>

            <p className="mt-2 text-sm">
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          impressions.length ===
            0 && (
            <div className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
              <h2 className="text-xl font-semibold">
                No impressions
                yet
              </h2>

              <p className="mt-3 text-[var(--muted)]">
                Import your
                first Head-Fi
                forum impression
                to get started.
              </p>

              <Link
                to="/admin/import-impression"
                className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Import
                impression
              </Link>
            </div>
          )}

        {!loading &&
          impressions.length >
            0 && (
            <section className="mt-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-6 py-4">
                <p className="text-sm text-[var(--muted)]">
                  {
                    filteredImpressions.length
                  }{" "}
                  {filteredImpressions.length ===
                  1
                    ? "impression"
                    : "impressions"}
                </p>

                {(statusFilter !==
                  "all" ||
                  searchQuery.trim()) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter(
                        "all",
                      )

                      setSearchQuery(
                        "",
                      )
                    }}
                    className="text-sm font-medium text-[var(--accent)] transition hover:opacity-75"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {filteredImpressions.length ===
              0 ? (
                <div className="px-6 py-12 text-center">
                  <h2 className="text-lg font-semibold">
                    No matching
                    impressions
                  </h2>

                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Try another
                    search or
                    status filter.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {filteredImpressions.map(
                    (
                      impression,
                    ) => {
                      const reviewer =
                        getSingleRelation(
                          impression.reviewers,
                        )

                      const iem =
                        getSingleRelation(
                          impression.iems,
                        )

                      const brand =
                        getSingleRelation(
                          iem?.brands,
                        )

                      const brandName =
                        brand
                          ?.name ??
                        ""

                      const modelName =
                        iem?.model ??
                        "Unknown IEM"

                      const fullIemName =
                        [
                          brandName,
                          modelName,
                        ]
                          .filter(
                            Boolean,
                          )
                          .join(
                            " ",
                          )

                      const originalDate =
                        formatDate(
                          impression.published_at,
                        )

                      return (
                        <article
                          key={
                            impression.id
                          }
                          className="flex flex-col gap-5 px-6 py-6 transition hover:bg-[var(--background)] sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  impression.published
                                    ? "bg-green-500/15 text-green-600"
                                    : "bg-amber-500/15 text-amber-600"
                                }`}
                              >
                                {impression.published
                                  ? "Published"
                                  : "Draft"}
                              </span>

                              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">
                                Impression
                              </span>

                              {impression.source_post_id && (
                                <span className="rounded-full border border-[var(--border)] px-3 py-1 font-mono text-xs text-[var(--muted)]">
                                  Post{" "}
                                  {
                                    impression.source_post_id
                                  }
                                </span>
                              )}
                            </div>

                            <h2 className="mt-3 truncate text-xl font-semibold">
                              {impression.title ||
                                fullIemName}
                            </h2>

                            <p className="mt-2 text-sm text-[var(--muted)]">
                              {
                                fullIemName
                              }

                              {reviewer?.name
                                ? ` · ${reviewer.name}`
                                : ""}

                              {originalDate
                                ? ` · ${originalDate}`
                                : ""}
                            </p>

                            <p className="mt-2 truncate font-mono text-xs text-[var(--muted)]">
                              /impressions/
                              {
                                impression.slug
                              }
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-wrap gap-3">
                            {impression.published && (
                              <Link
                                to={`/impressions/${impression.slug}`}
                                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface)]"
                              >
                                View
                              </Link>
                            )}

                            <Link
                              to={`/admin/impressions/${impression.id}/edit`}
                              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                void handleDeleteImpression(
                                  impression,
                                )
                              }
                              disabled={
                                deletingImpressionId !==
                                null
                              }
                              className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingImpressionId ===
                              impression.id
                                ? "Deleting…"
                                : "Delete"}
                            </button>
                          </div>
                        </article>
                      )
                    },
                  )}
                </div>
              )}
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
  value: number
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-5">
      <p className="text-sm text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
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
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[var(--accent)] text-white"
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
      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export default AdminImpressionsPage