import {
  useMemo,
  useState,
} from "react"

import type {
  FormEvent,
} from "react"

import {
  Link,
  useNavigate,
} from "react-router"

import {
  supabase,
} from "../lib/supabase"

type ProductType =
  | "iem"
  | "headphone"
  | "source"
  | "cable_accessory"

type HeadFiImage = {
  url: string
  alt: string
}

type HeadFiImport = {
  source: "head-fi"
  sourceUrl: string
  reviewId: string | null
  publishedAt: string | null
  productSlug: string | null
  author: string | null
  rating: number | null
  summary: string | null
  pros: string | null
  cons: string | null
  bodyHtml: string | null
  bodyText: string | null
  images: HeadFiImage[]
}

type ExistingReview = {
  id: string
  slug: string
}

type ReviewerOption = {
  id: string
  name: string
}

type ProductOption = {
  id: string
  model: string
  slug: string

  product_type:
    | ProductType
    | null

  brands:
    | {
        name: string
      }
    | {
        name: string
      }[]
    | null
}

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

function isValidImport(
  value: unknown,
): value is HeadFiImport {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false
  }

  const candidate =
    value as Partial<HeadFiImport>

  return (
    candidate.source === "head-fi" &&
    typeof candidate.sourceUrl ===
      "string" &&
    Array.isArray(candidate.images) &&
    candidate.images.every(
      (image) =>
        image &&
        typeof image ===
          "object" &&
        typeof image.url ===
          "string" &&
        typeof image.alt ===
          "string",
    )
  )
}

function slugify(
  value: string,
) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
}

function normalizeUsername(
  value:
    | string
    | null
    | undefined,
) {
  return (value ?? "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase()
}

function getBrandName(
  product: ProductOption,
) {
  return (
    getSingleRelation(
      product.brands,
    )?.name?.trim() ?? ""
  )
}

function getProductLabel(
  product: ProductOption,
) {
  const brandName =
    getBrandName(
      product,
    )

  return [
    brandName,
    product.model,
  ]
    .filter(Boolean)
    .join(" ")
}

function getProductTypeLabel(
  type:
    | ProductType
    | null
    | undefined,
) {
  switch (type) {
    case "headphone":
      return "Headphone"

    case "source":
      return "Source gear"

    case "cable_accessory":
      return "Cable / accessory"

    case "iem":
    default:
      return "IEM"
  }
}

function ImportReviewPage() {
  const navigate =
    useNavigate()

  const [
    rawJson,
    setRawJson,
  ] =
    useState("")

  const [
    importData,
    setImportData,
  ] =
    useState<HeadFiImport | null>(
      null,
    )

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  const [
    checking,
    setChecking,
  ] =
    useState(false)

  const [
    saving,
    setSaving,
  ] =
    useState(false)

  const [
    linking,
    setLinking,
  ] =
    useState(false)

  const [
    existingReview,
    setExistingReview,
  ] =
    useState<ExistingReview | null>(
      null,
    )

  const [
    reviewers,
    setReviewers,
  ] =
    useState<ReviewerOption[]>(
      [],
    )

  const [
    products,
    setProducts,
  ] =
    useState<ProductOption[]>(
      [],
    )

  const [
    selectedReviewerId,
    setSelectedReviewerId,
  ] =
    useState("")

  const [
    selectedProductId,
    setSelectedProductId,
  ] =
    useState("")

  const [
    selectedProductType,
    setSelectedProductType,
  ] =
    useState<ProductType>(
      "iem",
    )

  const [
    productSearch,
    setProductSearch,
  ] =
    useState("")

  const [
    productPickerOpen,
    setProductPickerOpen,
  ] =
    useState(false)

  const formattedRating =
    useMemo(() => {
      if (
        importData?.rating ==
        null
      ) {
        return "Not found"
      }

      return `${importData.rating.toFixed(
        1,
      )} / 5`
    }, [importData])

  const filteredProducts =
    useMemo(() => {
      const searchTerms =
        productSearch
          .toLowerCase()
          .trim()
          .split(/\s+/)
          .filter(Boolean)

      if (
        searchTerms.length ===
        0
      ) {
        return products.slice(
          0,
          10,
        )
      }

      return products
        .filter(
          (product) => {
            const searchableText =
              [
                getProductLabel(
                  product,
                ),
                product.model,
                product.slug,
                getProductTypeLabel(
                  product.product_type,
                ),
              ]
                .join(" ")
                .toLowerCase()

            return searchTerms.every(
              (term) =>
                searchableText.includes(
                  term,
                ),
            )
          },
        )
        .slice(0, 10)
    }, [
      products,
      productSearch,
    ])

  const selectedProduct =
    useMemo(
      () =>
        products.find(
          (product) =>
            String(
              product.id,
            ) ===
            selectedProductId,
        ) ?? null,
      [
        products,
        selectedProductId,
      ],
    )

  async function findExistingReview(
    sourcePlatform: string,
    sourceReviewId: string,
  ) {
    const {
      data,
      error:
        queryError,
    } =
      await supabase
        .from(
          "reviews",
        )
        .select(
          "id, slug",
        )
        .eq(
          "source_platform",
          sourcePlatform,
        )
        .eq(
          "source_review_id",
          sourceReviewId,
        )
        .maybeSingle()

    if (queryError) {
      throw queryError
    }

    return (
      data as ExistingReview | null
    )
  }

  async function loadReviewers() {
    const {
      data,
      error:
        queryError,
    } =
      await supabase
        .from(
          "reviewers",
        )
        .select(
          "id, name",
        )
        .order(
          "name",
        )

    if (queryError) {
      throw queryError
    }

    return (
      data ?? []
    ) as ReviewerOption[]
  }

  async function loadProducts() {
    const {
      data,
      error:
        queryError,
    } =
      await supabase
        .from(
          "products",
        )
        .select(`
          id,
          model,
          slug,
          product_type,

          brands (
            name
          )
        `)
        .order(
          "model",
        )

    if (queryError) {
      throw queryError
    }

    return (
      data ?? []
    ) as unknown as ProductOption[]
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError(null)
    setImportData(null)
    setExistingReview(null)

    setSelectedReviewerId(
      "",
    )

    setSelectedProductId(
      "",
    )

    setSelectedProductType(
      "iem",
    )

    setProductSearch("")
    setProductPickerOpen(false)

    const trimmedJson =
      rawJson.trim()

    if (!trimmedJson) {
      setError(
        "Paste the JSON copied by the ITGE bookmarklet.",
      )

      return
    }

    setChecking(true)

    try {
      const parsed:
        unknown =
        JSON.parse(
          trimmedJson,
        )

      if (
        !isValidImport(
          parsed,
        )
      ) {
        throw new Error(
          "This does not look like valid data from the ITGE bookmarklet.",
        )
      }

      if (!parsed.reviewId) {
        throw new Error(
          "No Head-Fi review ID was found.",
        )
      }

      const [
        duplicate,
        reviewerRows,
        productRows,
      ] =
        await Promise.all([
          findExistingReview(
            parsed.source,
            parsed.reviewId,
          ),

          loadReviewers(),

          loadProducts(),
        ])

      setImportData(
        parsed,
      )

      setExistingReview(
        duplicate,
      )

      setReviewers(
        reviewerRows,
      )

      setProducts(
        productRows,
      )

      const normalizedProductSlug =
        parsed.productSlug?.toLowerCase() ??
        ""

      const matchingProduct =
        productRows.find(
          (product) =>
            product.slug.toLowerCase() ===
            normalizedProductSlug,
        ) ??
        productRows.find(
          (product) => {
            const normalizedLabel =
              slugify(
                getProductLabel(
                  product,
                ),
              )

            return (
              normalizedLabel ===
                normalizedProductSlug ||
              normalizedLabel.includes(
                normalizedProductSlug,
              ) ||
              normalizedProductSlug.includes(
                normalizedLabel,
              )
            )
          },
        )

      if (matchingProduct) {
        setSelectedProductId(
          String(
            matchingProduct.id,
          ),
        )

        setProductSearch(
          getProductLabel(
            matchingProduct,
          ),
        )

        setSelectedProductType(
          matchingProduct.product_type ??
            "iem",
        )
      } else {
        setSelectedProductId(
          "",
        )

        setSelectedProductType(
          "iem",
        )

        setProductSearch(
          parsed.productSlug
            ?.replace(
              /-/g,
              " ",
            )
            .replace(
              /\b\w/g,
              (letter) =>
                letter.toUpperCase(),
            ) ?? "",
        )

        setProductPickerOpen(
          true,
        )
      }

      const matchingReviewer =
        reviewerRows.find(
          (reviewer) =>
            normalizeUsername(
              reviewer.name,
            ) ===
            normalizeUsername(
              parsed.author,
            ),
        )

      if (
        matchingReviewer
      ) {
        setSelectedReviewerId(
          String(
            matchingReviewer.id,
          ),
        )
      }
    } catch (
      parseError
    ) {
      setError(
        parseError instanceof
          Error
          ? parseError.message
          : "The pasted JSON could not be read.",
      )
    } finally {
      setChecking(
        false,
      )
    }
  }

  async function handleAddGearToExistingReview() {
    if (!existingReview) {
      setError(
        "No existing review was found.",
      )

      return
    }

    if (!selectedProductId) {
      setError(
        "Select the additional Gear covered by this review.",
      )

      return
    }

    const productId =
      Number(
        selectedProductId,
      )

    if (
      Number.isNaN(
        productId,
      )
    ) {
      setError(
        "The selected Gear item is invalid.",
      )

      return
    }

    setLinking(true)
    setError(null)

    try {
      const {
        data:
          existingAssociation,

        error:
          associationCheckError,
      } =
        await supabase
          .from(
            "review_products",
          )
          .select(
            "review_id, product_id",
          )
          .eq(
            "review_id",
            Number(
              existingReview.id,
            ),
          )
          .eq(
            "product_id",
            productId,
          )
          .maybeSingle()

      if (
        associationCheckError
      ) {
        throw associationCheckError
      }

      if (
        existingAssociation
      ) {
        setError(
          "This Gear item is already covered by the existing review.",
        )

        return
      }

      const {
        error:
          insertError,
      } =
        await supabase
          .from(
            "review_products",
          )
          .insert({
            review_id:
              Number(
                existingReview.id,
              ),

            product_id:
              productId,
          })

      if (insertError) {
        if (
          insertError.code ===
          "23505"
        ) {
          setError(
            "This Gear item is already covered by the existing review.",
          )

          return
        }

        throw insertError
      }

      navigate(
        `/admin/reviews/${existingReview.id}/edit`,
      )
    } catch (
      linkError
    ) {
      console.error(
        "Linking Gear to review failed:",
        linkError,
      )

      setError(
        linkError instanceof
          Error
          ? linkError.message
          : "The Gear item could not be linked to the existing review.",
      )
    } finally {
      setLinking(false)
    }
  }

  async function handleSaveDraft() {
    if (!importData) {
      setError(
        "No imported review data is available.",
      )

      return
    }

    if (existingReview) {
      setError(
        "This Head-Fi review has already been imported.",
      )

      return
    }

    if (!selectedReviewerId) {
      setError(
        "Select an ITGE member.",
      )

      return
    }

    if (!selectedProductId) {
      setError(
        "Select an ITGE product.",
      )

      return
    }

    if (!importData.reviewId) {
      setError(
        "The source review ID is missing.",
      )

      return
    }

    const selectedReviewer =
      reviewers.find(
        (reviewer) =>
          String(
            reviewer.id,
          ) ===
          selectedReviewerId,
      )

    const selectedProduct =
      products.find(
        (product) =>
          String(
            product.id,
          ) ===
          selectedProductId,
      )

    if (
      !selectedReviewer ||
      !selectedProduct
    ) {
      setError(
        "The selected member or product could not be found.",
      )

      return
    }

    const brandName =
      getBrandName(
        selectedProduct,
      )

    const fullProductName =
      [
        brandName,
        selectedProduct.model,
      ]
        .filter(Boolean)
        .join(" ")

    const reviewTitle =
      `${fullProductName} review`

    const reviewSlug =
      slugify(
        `${fullProductName}-${selectedReviewer.name}`,
      )

    const reviewPayload = {
      reviewer_id:
        Number(
          selectedReviewerId,
        ),

      product_id:
        Number(
          selectedProductId,
        ),

      published_at:
        importData.publishedAt,

      title:
        reviewTitle,

      slug:
        reviewSlug,

      rating:
        importData.rating,

      summary:
        importData.summary,

      pros:
        importData.pros,

      cons:
        importData.cons,

      body:
        importData.bodyHtml,

      status:
        "draft",

      published:
        false,

      featured:
        false,

      hero_image_url:
        importData.images[0]
          ?.url ?? null,

      source_platform:
        importData.source,

      source_review_id:
        importData.reviewId,

      source_url:
        importData.sourceUrl,

      source_html:
        importData.bodyHtml,

      import_data:
        importData,
    }

    setSaving(true)
    setError(null)

    try {
      /*
       * Save the selected
       * classification on the
       * product itself.
       */
      const {
        error:
          productUpdateError,
      } =
        await supabase
          .from(
            "products",
          )
          .update({
            product_type:
              selectedProductType,
          })
          .eq(
            "id",
            Number(
              selectedProductId,
            ),
          )

      if (
        productUpdateError
      ) {
        throw new Error(
          `The product type could not be saved: ${productUpdateError.message}`,
        )
      }

      const {
        data:
          insertedReview,

        error:
          insertError,
      } =
        await supabase
          .from(
            "reviews",
          )
          .insert(
            reviewPayload,
          )
          .select(
            "id, slug",
          )
          .single()

      if (insertError) {
        if (
          insertError.code ===
          "23505"
        ) {
          throw new Error(
            "This review has already been imported, or its ITGE slug already exists.",
          )
        }

        throw insertError
      }

      navigate(
        `/admin/reviews/${insertedReview.id}/edit`,
      )
    } catch (
      saveError
    ) {
      console.error(
        "Saving review failed:",
        saveError,
      )

      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "The review could not be saved.",
      )
    } finally {
      setSaving(false)
    }
  }

  function handleClear() {
    setRawJson("")
    setImportData(null)
    setError(null)

    setExistingReview(
      null,
    )

    setReviewers([])
    setProducts([])

    setSelectedReviewerId(
      "",
    )

    setSelectedProductId(
      "",
    )

    setSelectedProductType(
      "iem",
    )

    setProductSearch("")

    setProductPickerOpen(
      false,
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="text-sm font-medium text-[var(--accent)]"
        >
          ← Back to homepage
        </Link>

        <header className="mt-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            ITGE Admin
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Import Head-Fi
            review
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Open the Head-Fi
            review page, click the
            ITGE bookmarklet, then
            paste the copied review
            data below.
          </p>
        </header>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
        >
          <label
            htmlFor="review-json"
            className="block text-sm font-semibold"
          >
            Copied review JSON
          </label>

          <textarea
            id="review-json"
            value={
              rawJson
            }
            onChange={(
              event,
            ) =>
              setRawJson(
                event.target
                  .value,
              )
            }
            rows={14}
            spellCheck={
              false
            }
            placeholder='{"source":"head-fi", ...}'
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={
                checking
              }
              className="rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checking
                ? "Checking…"
                : "Preview review"}
            </button>

            <button
              type="button"
              onClick={
                handleClear
              }
              className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold transition hover:bg-[var(--background)]"
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
              {error}
            </div>
          )}
        </form>

        {importData && (
          <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-[var(--accent)]">
                  Import preview
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  {importData.productSlug ??
                    "Unknown product"}
                </h2>

                <p className="mt-2 text-[var(--muted)]">
                  Review{" "}
                  {importData.reviewId ??
                    "without an ID"}{" "}
                  by{" "}
                  {importData.author ??
                    "unknown member"}
                </p>
              </div>

              <span className="w-fit rounded-full border border-[var(--border)] px-3 py-1 text-sm">
                {
                  formattedRating
                }
              </span>
            </div>

            {existingReview && (
              <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-4">
                <p className="font-semibold">
                  This review has
                  already been
                  imported.
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  If the same Head-Fi
                  article covers another
                  Gear item, select that
                  Gear below and add it
                  to the existing ITGE
                  review instead of
                  creating a duplicate.
                </p>

                <Link
                  to={`/admin/reviews/${existingReview.id}/edit`}
                  className="mt-3 inline-block text-[var(--accent)] underline"
                >
                  Edit existing
                  ITGE review
                </Link>
              </div>
            )}

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold">
                  Summary
                </h3>

                <p className="mt-2 leading-7 text-[var(--muted)]">
                  {importData.summary ||
                    "No summary found."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold">
                  Source
                </h3>

                <a
                  href={
                    importData.sourceUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all text-[var(--accent)] underline"
                >
                  Open original
                  Head-Fi page
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold">
                  Pros
                </h3>

                <p className="mt-2 whitespace-pre-line leading-7 text-[var(--muted)]">
                  {importData.pros ||
                    "No pros found."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold">
                  Cons
                </h3>

                <p className="mt-2 whitespace-pre-line leading-7 text-[var(--muted)]">
                  {importData.cons ||
                    "No cons found."}
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="reviewer"
                  className="block text-sm font-semibold"
                >
                  ITGE member
                </label>

                <select
                  id="reviewer"
                  value={
                    selectedReviewerId
                  }
                  onChange={(
                    event,
                  ) =>
                    setSelectedReviewerId(
                      event.target
                        .value,
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                >
                  <option value="">
                    Select member
                  </option>

                  {reviewers.map(
                    (
                      reviewer,
                    ) => (
                      <option
                        key={
                          reviewer.id
                        }
                        value={
                          String(
                            reviewer.id,
                          )
                        }
                      >
                        {
                          reviewer.name
                        }
                      </option>
                    ),
                  )}
                </select>

                {importData.author && (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Head-Fi
                    username:{" "}
                    {
                      importData.author
                    }
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <label
                    htmlFor="product-search"
                    className="block text-sm font-semibold"
                  >
                    ITGE Gear
                  </label>

                  <input
                    id="product-search"
                    type="text"
                    value={
                      productSearch
                    }
                    autoComplete="off"
                    placeholder="Search by brand or model"
                    onFocus={() =>
                      setProductPickerOpen(
                        true,
                      )
                    }
                    onChange={(
                      event,
                    ) => {
                      setProductSearch(
                        event.target
                          .value,
                      )

                      setSelectedProductId(
                        "",
                      )

                      setSelectedProductType(
                        "iem",
                      )

                      setProductPickerOpen(
                        true,
                      )
                    }}
                    className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  />

                  {productPickerOpen &&
                    !selectedProduct && (
                    <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                      {filteredProducts.length >
                      0 ? (
                        filteredProducts.map(
                          (
                            product,
                          ) => (
                            <button
                              key={
                                product.id
                              }
                              type="button"
                              onClick={() => {
                                setSelectedProductId(
                                  String(
                                    product.id,
                                  ),
                                )

                                setProductSearch(
                                  getProductLabel(
                                    product,
                                  ),
                                )

                                setSelectedProductType(
                                  product.product_type ??
                                    "iem",
                                )

                                setProductPickerOpen(
                                  false,
                                )
                              }}
                              className="block w-full rounded-lg px-3 py-3 text-left transition hover:bg-[var(--surface-soft)]"
                            >
                              <span className="block font-medium">
                                {getProductLabel(
                                  product,
                                )}
                              </span>

                              <span className="mt-1 block text-xs text-[var(--muted)]">
                                {
                                  getProductTypeLabel(
                                    product.product_type,
                                  )
                                }
                                {" · "}
                                {
                                  product.slug
                                }
                              </span>
                            </button>
                          ),
                        )
                      ) : (
                        <div className="px-3 py-4">
                          <p className="font-medium">
                            No matching
                            product found.
                          </p>

                          <p className="mt-1 text-sm text-[var(--muted)]">
                            Check the
                            spelling or
                            create the
                            product before
                            importing this
                            review.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedProduct && (
                    <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                          Selected Gear
                        </p>

                        <p className="mt-1 font-semibold">
                          {getProductLabel(
                            selectedProduct,
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductId(
                            "",
                          )

                          setSelectedProductType(
                            "iem",
                          )

                          setProductSearch(
                            "",
                          )

                          setProductPickerOpen(
                            true,
                          )
                        }}
                        className="text-sm font-medium text-[var(--accent)]"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                {selectedProduct && (
                  <div className="mt-5">
                    <label
                      htmlFor="review-product-type"
                      className="block text-sm font-semibold"
                    >
                      Product type
                    </label>

                    <select
                      id="review-product-type"
                      value={
                        selectedProductType
                      }
                      onChange={(
                        event,
                      ) =>
                        setSelectedProductType(
                          event.target
                            .value as ProductType,
                        )
                      }
                      className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    >
                      <option value="iem">
                        IEM
                      </option>

                      <option value="headphone">
                        Headphone
                      </option>

                      <option value="source">
                        Source gear
                      </option>

                      <option value="cable_accessory">
                        Cable / accessory
                      </option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold">
                  Images
                </h3>

                <span className="text-sm text-[var(--muted)]">
                  {
                    importData.images
                      .length
                  }{" "}
                  found
                </span>
              </div>

              {importData.images.length >
              0 ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {importData.images.map(
                    (
                      image,
                      index,
                    ) => (
                      <figure
                        key={`${image.url}-${index}`}
                        className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]"
                      >
                        <img
                          src={
                            image.url
                          }
                          alt={
                            image.alt ||
                            `Review image ${
                              index +
                              1
                            }`
                          }
                          className="aspect-[4/3] w-full object-cover"
                        />

                        <figcaption className="truncate px-3 py-2 text-xs text-[var(--muted)]">
                          {image.alt ||
                            `Image ${
                              index +
                              1
                            }`}
                        </figcaption>
                      </figure>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-3 text-[var(--muted)]">
                  No review images
                  found.
                </p>
              )}
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-semibold">
                Review preview
              </h3>

              {importData.bodyHtml ? (
                <div
                  className="review-content mt-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5"
                  dangerouslySetInnerHTML={{
                    __html:
                      importData.bodyHtml,
                  }}
                />
              ) : (
                <p className="mt-3 text-[var(--muted)]">
                  No review body
                  found.
                </p>
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              {error && (
                <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {existingReview ? (
                <button
                  type="button"
                  onClick={() =>
                    void handleAddGearToExistingReview()
                  }
                  disabled={
                    linking ||
                    !selectedProductId
                  }
                  className="rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {linking
                    ? "Adding Gear…"
                    : "Add Gear to existing review"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    void handleSaveDraft()
                  }
                  disabled={
                    saving ||
                    !selectedReviewerId ||
                    !selectedProductId
                  }
                  className="rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving…"
                    : "Save draft"}
                </button>
              )}

              {!existingReview &&
                !selectedReviewerId && (
                  <span className="text-sm text-[var(--muted)]">
                    Select a member
                    before saving.
                  </span>
                )}

              {!selectedProductId && (
                <span className="text-sm text-[var(--muted)]">
                  Select Gear
                  before continuing.
                </span>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default ImportReviewPage