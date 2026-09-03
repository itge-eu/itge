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

type ReviewCoverage = {
  productId: number
  productName: string
  hero_image_url: string | null
}

type MediaItem = {
  type:
    | "review"
    | "impression"

  id: number
  title: string | null
  slug: string
  hero_image_url: string | null
  hero_image_confirmed: boolean

  reviewerName: string
  productId: number
  productName: string

  images: MediaImage[]
  coverages?: ReviewCoverage[]
}

type GearItem = {
  type: "gear"
  id: number
  title: null
  slug: string
  hero_image_url: string | null
  hero_image_confirmed: boolean

  reviewerName: string
  productId: number
  productName: string

  images: MediaImage[]
  coverageCount: number
}

type AdminMediaItem =
  | MediaItem
  | GearItem

type TypeFilter =
  | "all"
  | "review"
  | "impression"
  | "gear"

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

function isItemComplete(
  item: AdminMediaItem,
): boolean {
  if (item.type !== "review") {
    return item.hero_image_confirmed
  }

  if (!item.hero_image_confirmed) {
    return false
  }

  const secondaryCoverages =
    (item.coverages ?? []).filter(
      (coverage) =>
        coverage.productId !==
        item.productId,
    )

  return secondaryCoverages.every(
    (coverage) =>
      Boolean(
        coverage.hero_image_url,
      ),
  )
}

function AdminMediaPage() {
  const [
    items,
    setItems,
  ] =
    useState<
      AdminMediaItem[]
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
              product_id,
              hero_image_url,
              hero_image_confirmed,

              reviewers (
                name
              ),

              products!reviews_iem_id_fkey (
                id,
                model,
                slug,
                hero_image_url,

                brands (
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
          data: reviewProductRows,
          error: reviewProductError,
        } =
          await supabase
            .from("review_products")
            .select(`
              review_id,
              product_id,
              hero_image_url,

              products (
                id,
                model,
                slug,
                hero_image_url,

                brands (
                  name
                )
              )
            `)

        if (reviewProductError) {
          throw reviewProductError
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
              product_id,
              hero_image_url,
              hero_image_confirmed,

              reviewers (
                name
              ),

              products (
                id,
                model,
                slug,
                hero_image_url,

                brands (
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
          ).flatMap(
            (row) => {
              const reviewer =
                getSingleRelation(
                  row.reviewers,
                )

              const product =
                getSingleRelation(
                  row.products,
                )

              if (!product) {
                return []
              }

              const brand =
                getSingleRelation(
                  product
                    .brands,
                )

              const productName =
                [
                  brand
                    ?.name,
                  product.model,
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
                    Number(
                      first.sort_order,
                    ) -
                    Number(
                      second.sort_order,
                    ),
                )

              return [
                {
                  type:
                    "review" as const,

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

                  productId:
                    Number(
                      product.id,
                    ),

                  productName:
                    productName ||
                    "Unknown gear",

                  coverages:
                    (reviewProductRows ?? [])
                      .filter(
                        (coverage) =>
                          Number(coverage.review_id) ===
                          Number(row.id),
                      )
                      .flatMap(
                        (coverage) => {
                          const coverageProduct =
                            getSingleRelation(
                              coverage.products,
                            )

                          if (!coverageProduct) {
                            return []
                          }

                          const coverageBrand =
                            getSingleRelation(
                              coverageProduct.brands,
                            )

                          const coverageProductName =
                            [
                              coverageBrand?.name,
                              coverageProduct.model,
                            ]
                              .filter(Boolean)
                              .join(" ")

                          return [
                            {
                              productId:
                                Number(
                                  coverage.product_id,
                                ),

                              productName:
                                coverageProductName ||
                                "Unknown gear",

                              hero_image_url:
                                coverage.hero_image_url ??
                                null,
                            },
                          ]
                        },
                      ),

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
                },
              ]
            },
          )

        const impressionItems:
          MediaItem[] =
          (
            impressionRows ??
            []
          ).flatMap(
            (row) => {
              const reviewer =
                getSingleRelation(
                  row.reviewers,
                )

              const product =
                getSingleRelation(
                  row.products,
                )

              if (!product) {
                return []
              }

              const brand =
                getSingleRelation(
                  product
                    .brands,
                )

              const productName =
                [
                  brand
                    ?.name,
                  product.model,
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

              return [
                {
                  type:
                    "impression" as const,

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

                  productId:
                    Number(
                      product.id,
                    ),

                  productName:
                    productName ||
                    "Unknown gear",

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
                },
              ]
            },
          )

        const gearMap =
          new Map<
            number,
            GearItem
          >()

        function addToGear(
          item: MediaItem,
          product:
            | {
                slug: string
                hero_image_url:
                  | string
                  | null
              }
            | null,
        ) {
          const existing =
            gearMap.get(
              item.productId,
            )

          if (existing) {
            existing.coverageCount +=
              1

            const existingUrls =
              new Set(
                existing.images.map(
                  (image) =>
                    image.public_url,
                ),
              )

            item.images.forEach(
              (image) => {
                if (
                  !existingUrls.has(
                    image.public_url,
                  )
                ) {
                  existing.images.push(
                    image,
                  )

                  existingUrls.add(
                    image.public_url,
                  )
                }
              },
            )

            return
          }

          gearMap.set(
            item.productId,
            {
              type: "gear",

              id:
                item.productId,

              title: null,

              slug:
                product?.slug ??
                "",

              hero_image_url:
                product
                  ?.hero_image_url ??
                null,

              hero_image_confirmed:
                Boolean(
                  product
                    ?.hero_image_url,
                ),

              reviewerName:
                "",

              productId:
                item.productId,

              productName:
                item.productName,

              images:
                [...item.images],

              coverageCount:
                1,
            },
          )
        }

        const productById =
          new Map<
            number,
            {
              slug: string
              hero_image_url:
                | string
                | null
            }
          >()

        ;(
          reviewRows ??
          []
        ).forEach(
          (row) => {
            const product =
              getSingleRelation(
                row.products,
              )

            if (!product) {
              return
            }

            productById.set(
              Number(
                product.id,
              ),
              {
                slug:
                  product.slug,
                hero_image_url:
                  product.hero_image_url ??
                  null,
              },
            )
          },
        )

        ;(
          reviewProductRows ??
          []
        ).forEach(
          (row) => {
            const product =
              getSingleRelation(
                row.products,
              )

            if (!product) {
              return
            }

            productById.set(
              Number(
                product.id,
              ),
              {
                slug:
                  product.slug,
                hero_image_url:
                  product.hero_image_url ??
                  null,
              },
            )
          },
        )

        ;(
          impressionRows ??
          []
        ).forEach(
          (row) => {
            const product =
              getSingleRelation(
                row.products,
              )

            if (!product) {
              return
            }

            productById.set(
              Number(
                product.id,
              ),
              {
                slug:
                  product.slug,
                hero_image_url:
                  product.hero_image_url ??
                  null,
              },
            )
          },
        )

        reviewItems.forEach(
          (item) =>
            addToGear(
              item,
              productById.get(
                item.productId,
              ) ??
                null,
            ),
        )

        reviewItems.forEach(
          (item) => {
            ;(
              item.coverages ??
              []
            )
              .filter(
                (coverage) =>
                  coverage.productId !==
                  item.productId,
              )
              .forEach(
                (coverage) => {
                  addToGear(
                    {
                      ...item,
                      productId:
                        coverage.productId,
                      productName:
                        coverage.productName,
                    },
                    productById.get(
                      coverage.productId,
                    ) ??
                      null,
                  )
                },
              )
          },
        )

        impressionItems.forEach(
          (item) =>
            addToGear(
              item,
              productById.get(
                item.productId,
              ) ??
                null,
            ),
        )

        const gearItems =
          Array.from(
            gearMap.values(),
          ).map(
            (item) => ({
              ...item,

              images:
                item.images.sort(
                  (
                    first,
                    second,
                  ) =>
                    first.sort_order -
                    second.sort_order,
                ),
            }),
          )

        setItems([
          ...gearItems,
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
    item: AdminMediaItem,
    image: MediaImage,
  ) {
    const key =
      `${item.type}-${item.id}`

    setSavingKey(key)
    setError(null)

    const tableName =
      item.type ===
      "gear"
        ? "products"
        : item.type ===
            "review"
          ? "reviews"
          : "impressions"

    const payload =
      item.type ===
      "gear"
        ? {
            hero_image_url:
              image.public_url,
          }
        : {
            hero_image_url:
              image.public_url,

            hero_image_confirmed:
              true,

            updated_at:
              new Date()
                .toISOString(),
          }

    const {
      data: updatedRows,
      error: updateError,
    } =
      await supabase
        .from(tableName)
        .update(payload)
        .eq("id", item.id)
        .select("id")

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

    if (
      !updatedRows ||
      updatedRows.length === 0
    ) {
      setError(
        `No ${item.type} row was updated. Check Supabase RLS permissions.`,
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

  async function handleSelectCoverageHero(
    reviewId: number,
    productId: number,
    image: MediaImage,
  ) {
    const key =
      `coverage-${reviewId}-${productId}`

    setSavingKey(key)
    setError(null)

    const {
      data: updatedRows,
      error: updateError,
    } =
      await supabase
        .from("review_products")
        .update({
          hero_image_url:
            image.public_url,
        })
        .eq("review_id", reviewId)
        .eq("product_id", productId)
        .select("review_id, product_id")

    if (updateError) {
      console.error(
        "Updating Gear coverage image failed:",
        updateError,
      )

      setError(
        updateError.message,
      )

      setSavingKey(null)
      return
    }

    if (
      !updatedRows ||
      updatedRows.length === 0
    ) {
      setError(
        "No Gear coverage row was updated. Check Supabase RLS permissions.",
      )

      setSavingKey(null)
      return
    }

    setItems(
      (currentItems) =>
        currentItems.map(
          (currentItem) => {
            if (
              currentItem.type !== "review" ||
              currentItem.id !== reviewId
            ) {
              return currentItem
            }

            return {
              ...currentItem,

              coverages:
                (currentItem.coverages ?? []).map(
                  (coverage) =>
                    coverage.productId === productId
                      ? {
                          ...coverage,
                          hero_image_url:
                            image.public_url,
                        }
                      : coverage,
                ),
            }
          },
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

          const itemComplete =
            isItemComplete(
              item,
            )

          if (
            confirmationFilter ===
              "unchecked" &&
            itemComplete
          ) {
            return false
          }

          if (
            confirmationFilter ===
              "checked" &&
            !itemComplete
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
              item.productName,
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
        !isItemComplete(
          item,
        ),
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
            Choose hero images
            for reviews,
            impressions and gear.
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
              <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr_1fr_300px]">
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
                      label="Gear"
                      active={
                        typeFilter ===
                        "gear"
                      }
                      onClick={() =>
                        setTypeFilter(
                          "gear",
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
                    placeholder="Gear, reviewer…"
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
                                    isItemComplete(item)
                                      ? "bg-green-500/15 text-green-600"
                                      : "bg-amber-500/15 text-amber-600"
                                  }`}
                                >
                                  {isItemComplete(item)
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

                                {item.type ===
                                  "gear" && (
                                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                                    {
                                      item.coverageCount
                                    }{" "}
                                    {item.coverageCount ===
                                    1
                                      ? "entry"
                                      : "entries"}
                                  </span>
                                )}
                              </div>

                              <h2 className="mt-3 text-2xl font-semibold">
                                {
                                  item.productName
                                }
                              </h2>

                              {item.type !==
                              "gear" ? (
                                <>
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
                                </>
                              ) : (
                                <p className="mt-2 text-sm text-[var(--muted)]">
                                  Choose the
                                  image used
                                  across Gear
                                  cards and the
                                  Gear page.
                                </p>
                              )}
                            </div>

                            {item.type !==
                              "gear" && (
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
                            )}
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
                                        key={`${image.id}-${image.public_url}`}
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

                          {item.type === "review" &&
                            (item.coverages?.length ?? 0) > 1 &&
                            item.images.length > 0 && (
                              <div className="mt-8 border-t border-[var(--border)] pt-7">
                                <div>
                                  <p className="text-sm font-semibold">
                                    Also covered Gear
                                  </p>

                                  <p className="mt-2 text-sm text-[var(--muted)]">
                                    Choose a separate card image for additional Gear covered by this review.
                                  </p>
                                </div>

                                <div className="mt-5 space-y-6">
                                  {(item.coverages ?? [])
                                    .filter(
                                      (coverage) =>
                                        coverage.productId !==
                                        item.productId,
                                    )
                                    .map(
                                    (coverage) => {
                                      const coverageSavingKey =
                                        `coverage-${item.id}-${coverage.productId}`

                                      const isCoverageSaving =
                                        savingKey ===
                                        coverageSavingKey

                                      return (
                                        <div
                                          key={coverage.productId}
                                          className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
                                        >
                                          <div className="flex flex-wrap items-center justify-between gap-3">
                                            <p className="font-semibold">
                                              {coverage.productName}
                                            </p>

                                            <span className="text-xs text-[var(--muted)]">
                                              Card image
                                            </span>
                                          </div>

                                          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                            {item.images.map(
                                              (
                                                image,
                                                index,
                                              ) => {
                                                const isCoverageHero =
                                                  coverage.hero_image_url ===
                                                  image.public_url

                                                return (
                                                  <button
                                                    key={`${coverage.productId}-${image.id}-${image.public_url}`}
                                                    type="button"
                                                    onClick={() =>
                                                      void handleSelectCoverageHero(
                                                        item.id,
                                                        coverage.productId,
                                                        image,
                                                      )
                                                    }
                                                    disabled={
                                                      isCoverageSaving
                                                    }
                                                    className={`group relative overflow-hidden rounded-xl border-2 text-left transition ${
                                                      isCoverageHero
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

                                                    <div className="flex items-center justify-between gap-2 bg-[var(--surface)] px-3 py-2 text-xs">
                                                      <span>
                                                        Image{" "}
                                                        {index + 1}
                                                      </span>

                                                      {isCoverageHero && (
                                                        <span className="font-semibold text-[var(--accent)]">
                                                          Card
                                                        </span>
                                                      )}
                                                    </div>

                                                    {isCoverageHero && (
                                                      <div className="absolute right-2 top-2 rounded-full bg-[var(--accent)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                                        ✓
                                                      </div>
                                                    )}
                                                  </button>
                                                )
                                              },
                                            )}
                                          </div>

                                          {isCoverageSaving && (
                                            <p className="mt-3 text-sm font-medium text-[var(--accent)]">
                                              Saving card image…
                                            </p>
                                          )}
                                        </div>
                                      )
                                    },
                                  )}
                                </div>
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