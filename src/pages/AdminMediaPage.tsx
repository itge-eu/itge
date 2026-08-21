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

type MediaImage = {
  id: number
  sort_order: number
  public_url: string
  alt_text: string | null
}

type MediaItem = {
  type: "review" | "impression"
  id: number
  title: string | null
  slug: string
  hero_image_url: string | null
  hero_image_confirmed: boolean

  reviewerName: string
  iemName: string

  images: MediaImage[]
}

type TypeFilter =
  | "all"
  | "review"
  | "impression"

type ConfirmationFilter =
  | "all"
  | "unchecked"
  | "checked"

function getSingleRelation<T>(
  relation:
    | T
    | T[]
    | null
    | undefined,
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation ?? null
}

function AdminMediaPage() {
  const [
    items,
    setItems,
  ] =
    useState<MediaItem[]>([])

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

  const [
    savingKey,
    setSavingKey,
  ] =
    useState<string | null>(
      null,
    )

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<TypeFilter>(
      "all",
    )

  const [
    confirmationFilter,
    setConfirmationFilter,
  ] =
    useState<ConfirmationFilter>(
      "unchecked",
    )

  const [
    multipleImagesOnly,
    setMultipleImagesOnly,
  ] =
    useState(false)

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("")

  useEffect(() => {
    async function loadMedia() {
      setLoading(true)
      setError(null)

      try {
        const {
          data: reviewRows,
          error: reviewError,
        } =
          await supabase
            .from("reviews")
            .select(`
              id,
              title,
              slug,
              hero_image_url,
              hero_image_confirmed,

              reviewers (
                name
              ),

              iems (
                model,

                manufacturers (
                  name
                )
              ),

              review_images (
                id,
                sort_order,
                public_url,
                alt_text
              )
            `)
            .order(
              "id",
              {
                ascending: false,
              },
            )

        if (reviewError) {
          throw reviewError
        }

        const {
          data:
            impressionRows,
          error:
            impressionError,
        } =
          await supabase
            .from(
              "impressions",
            )
            .select(`
              id,
              title,
              slug,
              hero_image_url,
              hero_image_confirmed,

              reviewers (
                name
              ),

              iems (
                model,

                manufacturers (
                  name
                )
              )
            `)
            .order(
              "id",
              {
                ascending: false,
              },
            )

        if (
          impressionError
        ) {
          throw impressionError
        }

        const {
          data:
            impressionImageRows,
          error:
            impressionImageError,
        } =
          await supabase
            .from(
              "impression_images",
            )
            .select(`
              id,
              impression_id,
              sort_order,
              public_url,
              alt_text
            `)
            .order(
              "sort_order",
              {
                ascending: true,
              },
            )

        if (
          impressionImageError
        ) {
          throw impressionImageError
        }

        const reviewItems:
          MediaItem[] =
          (
            reviewRows ??
            []
          ).map(
            (row) => {
              const reviewer =
                getSingleRelation(
                  row.reviewers,
                )

              const iem =
                getSingleRelation(
                  row.iems,
                )

              const manufacturer =
                getSingleRelation(
                  iem
                    ?.manufacturers,
                )

              const iemName =
                [
                  manufacturer
                    ?.name,
                  iem?.model,
                ]
                  .filter(
                    Boolean,
                  )
                  .join(" ")

              const images =
                [
                  ...(
                    row.review_images ??
                    []
                  ),
                ].sort(
                  (
                    first,
                    second,
                  ) =>
                    first.sort_order -
                    second.sort_order,
                )

              return {
                type:
                  "review",

                id:
                  Number(
                    row.id,
                  ),

                title:
                  row.title ??
                  null,

                slug:
                  row.slug,

                hero_image_url:
                  row.hero_image_url ??
                  null,

                hero_image_confirmed:
                  Boolean(
                    row.hero_image_confirmed,
                  ),

                reviewerName:
                  reviewer
                    ?.name ??
                  "Unknown reviewer",

                iemName:
                  iemName ||
                  "Unknown IEM",

                images:
                  images.map(
                    (
                      image,
                    ) => ({
                      id:
                        Number(
                          image.id,
                        ),

                      sort_order:
                        Number(
                          image.sort_order,
                        ),

                      public_url:
                        image.public_url,

                      alt_text:
                        image.alt_text ??
                        null,
                    }),
                  ),
              }
            },
          )

        const impressionItems:
          MediaItem[] =
          (
            impressionRows ??
            []
          ).map(
            (row) => {
              const reviewer =
                getSingleRelation(
                  row.reviewers,
                )

              const iem =
                getSingleRelation(
                  row.iems,
                )

              const manufacturer =
                getSingleRelation(
                  iem
                    ?.manufacturers,
                )

              const iemName =
                [
                  manufacturer
                    ?.name,
                  iem?.model,
                ]
                  .filter(
                    Boolean,
                  )
                  .join(" ")

              const images =
                (
                  impressionImageRows ??
                  []
                )
                  .filter(
                    (image) =>
                      Number(
                        image.impression_id,
                      ) ===
                      Number(
                        row.id,
                      ),
                  )
                  .sort(
                    (
                      first,
                      second,
                    ) =>
                      Number(
                        first.sort_order,
                      ) -
                      Number(
                        second.sort_order,
                      ),
                  )

              return {
                type:
                  "impression",

                id:
                  Number(
                    row.id,
                  ),

                title:
                  row.title ??
                  null,

                slug:
                  row.slug,

                hero_image_url:
                  row.hero_image_url ??
                  null,

                hero_image_confirmed:
                  Boolean(
                    row.hero_image_confirmed,
                  ),

                reviewerName:
                  reviewer
                    ?.name ??
                  "Unknown contributor",

                iemName:
                  iemName ||
                  "Unknown IEM",

                images:
                  images.map(
                    (
                      image,
                    ) => ({
                      id:
                        Number(
                          image.id,
                        ),

                      sort_order:
                        Number(
                          image.sort_order,
                        ),

                      public_url:
                        image.public_url,

                      alt_text:
                        image.alt_text ??
                        null,
                    }),
                  ),
              }
            },
          )

        setItems([
          ...reviewItems,
          ...impressionItems,
        ])
      } catch (
        loadError
      ) {
        console.error(
          "Loading admin media failed:",
          loadError,
        )

        setError(
          loadError instanceof
            Error
            ? loadError.message
            : "Media could not be loaded.",
        )
      } finally {
        setLoading(false)
      }
    }

    void loadMedia()
  }, [])

  async function handleSelectHero(
    item: MediaItem,
    image: MediaImage,
  ) {
    const key =
      `${item.type}-${item.id}`

    setSavingKey(key)
    setError(null)

    const tableName =
      item.type ===
      "review"
        ? "reviews"
        : "impressions"

    const payload = {
      hero_image_url:
        image.public_url,

      hero_image_confirmed:
        true,

      updated_at:
        new Date()
          .toISOString(),
    }

    const {
      error:
        updateError,
    } =
      await supabase
        .from(
          tableName,
        )
        .update(
          payload,
        )
        .eq(
          "id",
          item.id,
        )

    if (updateError) {
      console.error(
        "Updating hero image failed:",
        updateError,
      )

      setError(
        updateError.message,
      )

      setSavingKey(null)
      return
    }

    setItems(
      (
        currentItems,
      ) =>
        currentItems.map(
          (
            currentItem,
          ) =>
            currentItem.type ===
              item.type &&
            currentItem.id ===
              item.id
              ? {
                  ...currentItem,

                  hero_image_url:
                    image.public_url,

                  hero_image_confirmed:
                    true,
                }
              : currentItem,
        ),
    )

    setSavingKey(null)
  }

  const filteredItems =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLowerCase()

      return items.filter(
        (item) => {
          if (
            typeFilter !==
              "all" &&
            item.type !==
              typeFilter
          ) {
            return false
          }

          if (
            confirmationFilter ===
              "unchecked" &&
            item.hero_image_confirmed
          ) {
            return false
          }

          if (
            confirmationFilter ===
              "checked" &&
            !item.hero_image_confirmed
          ) {
            return false
          }

          if (
            multipleImagesOnly &&
            item.images.length <
              2
          ) {
            return false
          }

          if (
            !normalizedSearch
          ) {
            return true
          }

          const searchable =
            [
              item.title,
              item.iemName,
              item.reviewerName,
              item.slug,
              item.id,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()

          return searchable.includes(
            normalizedSearch,
          )
        },
      )
    }, [
      items,
      typeFilter,
      confirmationFilter,
      multipleImagesOnly,
      searchQuery,
    ])

  const uncheckedCount =
    items.filter(
      (item) =>
        !item.hero_image_confirmed,
    ).length

  const checkedCount =
    items.length -
    uncheckedCount

  const multipleImageCount =
    items.filter(
      (item) =>
        item.images.length >
        1,
    ).length

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/admin"
          className="text-sm font-medium text-[var(--accent)]"
        >
          ← Back to admin
        </Link>

        <header className="mt-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            ITGE Admin
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Hero images
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            Review all imported
            images and choose the
            hero image used for
            reviews and
            impressions.
          </p>
        </header>

        {!loading &&
          !error && (
            <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total"
                value={
                  items.length
                }
              />

              <StatCard
                label="Unchecked"
                value={
                  uncheckedCount
                }
              />

              <StatCard
                label="Checked"
                value={
                  checkedCount
                }
              />

              <StatCard
                label="Multiple images"
                value={
                  multipleImageCount
                }
              />
            </section>
          )}

        {!loading &&
          !error &&
          items.length >
            0 && (
            <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
              <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr_300px]">
                <div>
                  <p className="text-sm font-semibold">
                    Type
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <FilterButton
                      label="All"
                      active={
                        typeFilter ===
                        "all"
                      }
                      onClick={() =>
                        setTypeFilter(
                          "all",
                        )
                      }
                    />

                    <FilterButton
                      label="Reviews"
                      active={
                        typeFilter ===
                        "review"
                      }
                      onClick={() =>
                        setTypeFilter(
                          "review",
                        )
                      }
                    />

                    <FilterButton
                      label="Impressions"
                      active={
                        typeFilter ===
                        "impression"
                      }
                      onClick={() =>
                        setTypeFilter(
                          "impression",
                        )
                      }
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Status
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <FilterButton
                      label="All"
                      active={
                        confirmationFilter ===
                        "all"
                      }
                      onClick={() =>
                        setConfirmationFilter(
                          "all",
                        )
                      }
                    />

                    <FilterButton
                      label="Unchecked"
                      active={
                        confirmationFilter ===
                        "unchecked"
                      }
                      onClick={() =>
                        setConfirmationFilter(
                          "unchecked",
                        )
                      }
                    />

                    <FilterButton
                      label="Checked"
                      active={
                        confirmationFilter ===
                        "checked"
                      }
                      onClick={() =>
                        setConfirmationFilter(
                          "checked",
                        )
                      }
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Images
                  </p>

                  <label className="mt-3 flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={
                        multipleImagesOnly
                      }
                      onChange={(
                        event,
                      ) =>
                        setMultipleImagesOnly(
                          event
                            .target
                            .checked,
                        )
                      }
                      className="h-4 w-4"
                    />

                    <span className="text-sm">
                      Multiple images
                      only
                    </span>
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="hero-image-search"
                    className="block text-sm font-semibold"
                  >
                    Search
                  </label>

                  <input
                    id="hero-image-search"
                    type="search"
                    value={
                      searchQuery
                    }
                    onChange={(
                      event,
                    ) =>
                      setSearchQuery(
                        event.target
                          .value,
                      )
                    }
                    placeholder="IEM, reviewer…"
                    className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            </section>
          )}

        {loading && (
          <div className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="text-[var(--muted)]">
              Loading media…
            </p>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            <p className="font-semibold">
              Media could not be
              loaded.
            </p>

            <p className="mt-2 text-sm">
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error && (
            <>
              <div className="mt-8 flex items-center justify-between gap-4">
                <p className="text-sm text-[var(--muted)]">
                  {
                    filteredItems.length
                  }{" "}
                  {filteredItems.length ===
                  1
                    ? "item"
                    : "items"}
                </p>

                {(typeFilter !==
                  "all" ||
                  confirmationFilter !==
                    "unchecked" ||
                  multipleImagesOnly ||
                  searchQuery.trim()) && (
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter(
                        "all",
                      )

                      setConfirmationFilter(
                        "unchecked",
                      )

                      setMultipleImagesOnly(
                        false,
                      )

                      setSearchQuery(
                        "",
                      )
                    }}
                    className="text-sm font-semibold text-[var(--accent)]"
                  >
                    Reset filters
                  </button>
                )}
              </div>

              {filteredItems.length ===
              0 ? (
                <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
                  <h2 className="text-xl font-semibold">
                    Nothing to
                    review
                  </h2>

                  <p className="mt-3 text-[var(--muted)]">
                    No media matches
                    the current
                    filters.
                  </p>
                </div>
              ) : (
                <section className="mt-6 space-y-6">
                  {filteredItems.map(
                    (item) => {
                      const key =
                        `${item.type}-${item.id}`

                      const isSaving =
                        savingKey ===
                        key

                      return (
                        <article
                          key={
                            key
                          }
                          className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7"
                        >
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold capitalize">
                                  {
                                    item.type
                                  }
                                </span>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    item.hero_image_confirmed
                                      ? "bg-green-500/15 text-green-600"
                                      : "bg-amber-500/15 text-amber-600"
                                  }`}
                                >
                                  {item.hero_image_confirmed
                                    ? "Checked"
                                    : "Unchecked"}
                                </span>

                                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                                  {
                                    item
                                      .images
                                      .length
                                  }{" "}
                                  {item
                                    .images
                                    .length ===
                                  1
                                    ? "image"
                                    : "images"}
                                </span>
                              </div>

                              <h2 className="mt-3 text-2xl font-semibold">
                                {
                                  item.iemName
                                }
                              </h2>

                              <p className="mt-2 text-sm text-[var(--muted)]">
                                {
                                  item.reviewerName
                                }
                                {" · "}
                                {item.type ===
                                "review"
                                  ? "Review"
                                  : "Impression"}{" "}
                                #
                                {
                                  item.id
                                }
                              </p>

                              {item.title && (
                                <p className="mt-2 text-sm text-[var(--muted)]">
                                  {
                                    item.title
                                  }
                                </p>
                              )}
                            </div>

                            <Link
                              to={
                                item.type ===
                                "review"
                                  ? `/admin/reviews/${item.id}/edit`
                                  : `/admin/impressions/${item.id}/edit`
                              }
                              className="w-fit shrink-0 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--background)]"
                            >
                              Edit
                            </Link>
                          </div>

                          {item.images.length ===
                          0 ? (
                            <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] px-5 py-8 text-sm text-[var(--muted)]">
                              No stored
                              images found.
                            </div>
                          ) : (
                            <div className="mt-7">
                              <p className="text-sm font-semibold">
                                Choose hero
                                image
                              </p>

                              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {item.images.map(
                                  (
                                    image,
                                    index,
                                  ) => {
                                    const isHero =
                                      item.hero_image_url ===
                                      image.public_url

                                    return (
                                      <button
                                        key={
                                          image.id
                                        }
                                        type="button"
                                        onClick={() =>
                                          void handleSelectHero(
                                            item,
                                            image,
                                          )
                                        }
                                        disabled={
                                          isSaving
                                        }
                                        className={`group relative overflow-hidden rounded-2xl border-2 text-left transition ${
                                          isHero
                                            ? "border-[var(--accent)]"
                                            : "border-[var(--border)] hover:border-[var(--accent)]"
                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                      >
                                        <img
                                          src={
                                            image.public_url
                                          }
                                          alt={
                                            image.alt_text ??
                                            ""
                                          }
                                          loading="lazy"
                                          className="aspect-square w-full object-cover"
                                        />

                                        <div className="flex items-center justify-between gap-2 bg-[var(--background)] px-3 py-2 text-xs">
                                          <span>
                                            Image{" "}
                                            {
                                              index +
                                              1
                                            }
                                          </span>

                                          {isHero && (
                                            <span className="font-semibold text-[var(--accent)]">
                                              Hero
                                            </span>
                                          )}
                                        </div>

                                        {isHero && (
                                          <div className="absolute right-2 top-2 rounded-full bg-[var(--accent)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                            ✓
                                          </div>
                                        )}
                                      </button>
                                    )
                                  },
                                )}
                              </div>

                              {isSaving && (
                                <p className="mt-4 text-sm font-medium text-[var(--accent)]">
                                  Saving hero
                                  image…
                                </p>
                              )}
                            </div>
                          )}
                        </article>
                      )
                    },
                  )}
                </section>
              )}
            </>
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

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[var(--accent)] text-white"
          : "border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]"
      }`}
    >
      {label}
    </button>
  )
}

export default AdminMediaPage