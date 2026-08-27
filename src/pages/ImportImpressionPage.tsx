import {
  useMemo,
  useState,
} from "react"

import type {
  FormEvent,
} from "react"

import {
  Link,
} from "react-router"

import {
  supabase,
} from "../lib/supabase"

type HeadFiImage = {
  url: string
  alt: string
  filename?: string
}

type YouTubeEmbed = {
  videoId: string
  url: string
  title: string
}

type MediaEmbed = {
  platform: string
  url: string
  title: string
}

type HeadFiImpressionImport = {
  source: "head-fi"
  sourceType: "post"

  sourceUrl: string
  postId: string | null

  threadUrl: string | null
  threadTitle: string | null

  author: string | null
  publishedAt: string | null

  bodyHtml: string | null
  bodyText: string | null

  inlineImages: HeadFiImage[]
  attachmentImages: HeadFiImage[]
  images: HeadFiImage[]

  youtubeEmbeds: YouTubeEmbed[]
  mediaEmbeds: MediaEmbed[]
}

type ExistingImpression = {
  id: number
  slug: string
  published: boolean
}

type ReviewerOption = {
  id: number
  name: string
}

type IemOption = {
  id: number
  model: string
  slug: string

  brands:
    | {
        name: string
      }
    | {
        name: string
      }[]
    | null
}

type SavedImpression = {
  id: number
  slug: string
}

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

function isHeadFiImage(
  value: unknown,
): value is HeadFiImage {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false
  }

  const image =
    value as Partial<HeadFiImage>

  return (
    typeof image.url === "string" &&
    typeof image.alt === "string"
  )
}

function isValidImport(
  value: unknown,
): value is HeadFiImpressionImport {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false
  }

  const candidate =
    value as Partial<HeadFiImpressionImport>

  return (
    candidate.source === "head-fi" &&
    candidate.sourceType === "post" &&
    typeof candidate.sourceUrl ===
      "string" &&
    Array.isArray(candidate.images) &&
    candidate.images.every(
      isHeadFiImage,
    )
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

function getBrandName(
  iem: IemOption,
) {
  return (
    getSingleRelation(
      iem.brands,
    )?.name?.trim() ?? ""
  )
}

function getIemLabel(
  iem: IemOption,
) {
  const brandName =
    getBrandName(iem)

  return [
    brandName,
    iem.model,
  ]
    .filter(Boolean)
    .join(" ")
}

function buildSummary(
  bodyText:
    | string
    | null,
) {
  if (!bodyText) {
    return null
  }

  const cleaned =
    bodyText
      .replace(/\s+/g, " ")
      .trim()

  if (!cleaned) {
    return null
  }

  if (
    cleaned.length <= 260
  ) {
    return cleaned
  }

  return `${cleaned.slice(
    0,
    257,
  )}…`
}

function ImportImpressionPage() {
  const [
    rawJson,
    setRawJson,
  ] =
    useState("")

  const [
    importData,
    setImportData,
  ] =
    useState<HeadFiImpressionImport | null>(
      null,
    )

  const [
    existingImpression,
    setExistingImpression,
  ] =
    useState<ExistingImpression | null>(
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
    iems,
    setIems,
  ] =
    useState<IemOption[]>(
      [],
    )

  const [
    selectedReviewerId,
    setSelectedReviewerId,
  ] =
    useState("")

  const [
    selectedIemId,
    setSelectedIemId,
  ] =
    useState("")

  const [
    iemSearch,
    setIemSearch,
  ] =
    useState("")

  const [
    iemPickerOpen,
    setIemPickerOpen,
  ] =
    useState(false)

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
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  const [
    savedImpression,
    setSavedImpression,
  ] =
    useState<SavedImpression | null>(
      null,
    )

  const selectedIem =
    useMemo(
      () =>
        iems.find(
          (iem) =>
            String(iem.id) ===
            selectedIemId,
        ) ?? null,
      [
        iems,
        selectedIemId,
      ],
    )

  const filteredIems =
    useMemo(() => {
      const searchTerms =
        iemSearch
          .toLowerCase()
          .trim()
          .split(/\s+/)
          .filter(Boolean)

      if (
        searchTerms.length ===
        0
      ) {
        return iems.slice(
          0,
          10,
        )
      }

      return iems
        .filter((iem) => {
          const searchable =
            [
              getIemLabel(
                iem,
              ),
              iem.model,
              iem.slug,
            ]
              .join(" ")
              .toLowerCase()

          return searchTerms.every(
            (term) =>
              searchable.includes(
                term,
              ),
          )
        })
        .slice(0, 10)
    }, [
      iems,
      iemSearch,
    ])

  const suggestedSummary =
    useMemo(
      () =>
        buildSummary(
          importData?.bodyText ??
            null,
        ),
      [importData],
    )

  async function findExistingImpression(
    source: string,
    sourcePostId: string,
  ) {
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
          slug,
          published
        `)
        .eq(
          "source",
          source,
        )
        .eq(
          "source_post_id",
          sourcePostId,
        )
        .maybeSingle()

    if (queryError) {
      throw queryError
    }

    return (
      data as ExistingImpression | null
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
        .select(`
          id,
          name
        `)
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

  async function loadIems() {
    const {
      data,
      error:
        queryError,
    } =
      await supabase
        .from("iems")
        .select(`
          id,
          model,
          slug,

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
    ) as unknown as IemOption[]
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError(null)
    setImportData(null)
    setExistingImpression(
      null,
    )
    setSavedImpression(
      null,
    )
    setSelectedReviewerId(
      "",
    )
    setSelectedIemId("")
    setIemSearch("")
    setIemPickerOpen(false)

    const trimmed =
      rawJson.trim()

    if (!trimmed) {
      setError(
        "Paste the JSON copied by the ITGE impression bookmarklet.",
      )

      return
    }

    setChecking(true)

    try {
      const parsed:
        unknown =
        JSON.parse(
          trimmed,
        )

      if (
        !isValidImport(
          parsed,
        )
      ) {
        throw new Error(
          "This does not look like valid data from the ITGE impression bookmarklet.",
        )
      }

      if (!parsed.postId) {
        throw new Error(
          "No Head-Fi post ID was found.",
        )
      }

      const [
        duplicate,
        reviewerRows,
        iemRows,
      ] =
        await Promise.all([
          findExistingImpression(
            parsed.source,
            parsed.postId,
          ),

          loadReviewers(),

          loadIems(),
        ])

      setImportData(
        parsed,
      )

      setExistingImpression(
        duplicate,
      )

      setReviewers(
        reviewerRows,
      )

      setIems(
        iemRows,
      )

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

      /*
       * Forum posts do not expose a
       * reliable structured IEM ID,
       * so we deliberately select
       * this manually.
       */
      setIemPickerOpen(
        true,
      )
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

  async function handleSaveDraft() {
    if (!importData) {
      setError(
        "No imported impression data is available.",
      )

      return
    }

    if (existingImpression) {
      setError(
        "This Head-Fi post has already been imported.",
      )

      return
    }

    if (!importData.postId) {
      setError(
        "The Head-Fi post ID is missing.",
      )

      return
    }

    if (!selectedReviewerId) {
      setError(
        "Select an ITGE contributor.",
      )

      return
    }

    if (!selectedIemId) {
      setError(
        "Select an ITGE IEM.",
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

    const selectedIem =
      iems.find(
        (iem) =>
          String(iem.id) ===
          selectedIemId,
      )

    if (
      !selectedReviewer ||
      !selectedIem
    ) {
      setError(
        "The selected contributor or IEM could not be found.",
      )

      return
    }

    const brandName =
      getBrandName(
        selectedIem,
      )

    const fullIemName =
      [
        brandName,
        selectedIem.model,
      ]
        .filter(Boolean)
        .join(" ")

    const title =
      `${fullIemName} impression`

    /*
     * Include source post ID so the
     * same contributor can have more
     * than one impression of an IEM
     * without slug collisions.
     */
    const slug =
      slugify(
        `${fullIemName}-${selectedReviewer.name}-${importData.postId}`,
      )

    setSaving(true)
    setError(null)
    setSavedImpression(
      null,
    )

    try {
      const {
        data:
          insertedImpression,

        error:
          insertError,
      } =
        await supabase
          .from(
            "impressions",
          )
          .insert({
            reviewer_id:
              Number(
                selectedReviewerId,
              ),

            iem_id:
              Number(
                selectedIemId,
              ),

            title,
            slug,

            summary:
              suggestedSummary,

            /*
             * Keep original Head-Fi
             * HTML in the draft.
             *
             * Its image URLs will be
             * localised later from the
             * admin impression editor.
             */
            body:
              importData.bodyHtml,

            /*
             * Temporary hero preview.
             * This remains a Head-Fi URL
             * until images are deliberately
             * copied from the editor.
             */
            hero_image_url:
              importData.images[0]
                ?.url ?? null,

            published_at:
              importData.publishedAt,

            published:
              false,

            source:
              importData.source,

            source_url:
              importData.sourceUrl,

            source_post_id:
              importData.postId,

            /*
             * Preserve everything the
             * bookmarklet discovered.
             *
             * The editor needs this for
             * pending images and media/
             * artist suggestions later.
             */
            import_data: {
              sourceType:
                importData.sourceType,

              threadUrl:
                importData.threadUrl,

              threadTitle:
                importData.threadTitle,

              author:
                importData.author,

              bodyText:
                importData.bodyText,

              images:
                importData.images,

              inlineImages:
                importData.inlineImages,

              attachmentImages:
                importData.attachmentImages,

              youtubeEmbeds:
                importData.youtubeEmbeds,

              mediaEmbeds:
                importData.mediaEmbeds,
            },
          })
          .select(`
            id,
            slug
          `)
          .single()

      if (insertError) {
        if (
          insertError.code ===
          "23505"
        ) {
          throw new Error(
            "This Head-Fi post has already been imported, or the generated impression slug already exists.",
          )
        }

        throw insertError
      }

      setSavedImpression({
        id:
          Number(
            insertedImpression.id,
          ),

        slug:
          insertedImpression.slug,
      })
    } catch (saveError) {
      console.error(
        "Saving impression failed:",
        saveError,
      )

      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "The impression could not be saved.",
      )
    } finally {
      setSaving(false)
    }
  }

  function handleClear() {
    setRawJson("")
    setImportData(null)
    setExistingImpression(
      null,
    )
    setReviewers([])
    setIems([])

    setSelectedReviewerId(
      "",
    )

    setSelectedIemId(
      "",
    )

    setIemSearch("")
    setIemPickerOpen(
      false,
    )

    setSavedImpression(
      null,
    )

    setError(null)
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
            impression
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Open a Head-Fi
            forum thread, run the
            ITGE impression
            bookmarklet, choose the
            post to import, then
            paste the copied data
            below.
          </p>
        </header>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
        >
          <label
            htmlFor="impression-json"
            className="block text-sm font-semibold"
          >
            Copied impression
            JSON
          </label>

          <textarea
            id="impression-json"
            value={rawJson}
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
            placeholder='{"source":"head-fi","sourceType":"post", ...}'
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
                : "Preview impression"}
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

          {error &&
            !importData && (
            <ErrorBox
              message={
                error
              }
            />
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
                  Head-Fi post{" "}
                  {importData.postId ??
                    "without an ID"}
                </h2>

                <p className="mt-2 text-[var(--muted)]">
                  By{" "}
                  {importData.author ??
                    "unknown contributor"}
                </p>
              </div>

              <span className="w-fit rounded-full border border-[var(--border)] px-3 py-1 text-sm">
                Impression
              </span>
            </div>

            {existingImpression && (
              <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-4">
                <p className="font-semibold">
                  This Head-Fi
                  post has already
                  been imported.
                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Existing
                  impression ID:{" "}
                  {
                    existingImpression.id
                  }
                  {" · "}
                  {existingImpression.published
                    ? "published"
                    : "draft"}
                </p>

                {existingImpression.published && (
                  <Link
                    to={`/impressions/${existingImpression.slug}`}
                    className="mt-3 inline-block text-[var(--accent)] underline"
                  >
                    Open existing
                    public impression
                  </Link>
                )}
              </div>
            )}

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <InfoBlock
                title="Thread"
              >
                <p>
                  {importData.threadTitle ||
                    "Unknown thread"}
                </p>

                {importData.threadUrl && (
                  <a
                    href={
                      importData.threadUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block break-all text-sm text-[var(--accent)] underline"
                  >
                    Open thread
                  </a>
                )}
              </InfoBlock>

              <InfoBlock
                title="Original post"
              >
                <a
                  href={
                    importData.sourceUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="block break-all text-[var(--accent)] underline"
                >
                  Open Head-Fi
                  post
                </a>
              </InfoBlock>

              <InfoBlock
                title="Published"
              >
                <p>
                  {importData.publishedAt ||
                    "Date not found"}
                </p>
              </InfoBlock>

              <InfoBlock
                title="Suggested summary"
              >
                <p className="leading-7">
                  {suggestedSummary ||
                    "No text found."}
                </p>
              </InfoBlock>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="impression-reviewer"
                  className="block text-sm font-semibold"
                >
                  ITGE contributor
                </label>

                <select
                  id="impression-reviewer"
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
                    Select contributor
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
                          reviewer.id
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

              <div className="relative">
                <label
                  htmlFor="impression-iem-search"
                  className="block text-sm font-semibold"
                >
                  ITGE IEM
                </label>

                <input
                  id="impression-iem-search"
                  type="text"
                  value={
                    iemSearch
                  }
                  autoComplete="off"
                  placeholder="Search by brand or model"
                  onFocus={() =>
                    setIemPickerOpen(
                      true,
                    )
                  }
                  onChange={(
                    event,
                  ) => {
                    setIemSearch(
                      event.target
                        .value,
                    )

                    setSelectedIemId(
                      "",
                    )

                    setIemPickerOpen(
                      true,
                    )
                  }}
                  className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                />

                {iemPickerOpen &&
                  !selectedIem && (
                  <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                    {filteredIems.length >
                    0 ? (
                      filteredIems.map(
                        (
                          iem,
                        ) => (
                          <button
                            key={
                              iem.id
                            }
                            type="button"
                            onClick={() => {
                              setSelectedIemId(
                                String(
                                  iem.id,
                                ),
                              )

                              setIemSearch(
                                getIemLabel(
                                  iem,
                                ),
                              )

                              setIemPickerOpen(
                                false,
                              )
                            }}
                            className="block w-full rounded-lg px-3 py-3 text-left transition hover:bg-[var(--surface-soft)]"
                          >
                            <span className="block font-medium">
                              {getIemLabel(
                                iem,
                              )}
                            </span>

                            <span className="mt-1 block text-xs text-[var(--muted)]">
                              {
                                iem.slug
                              }
                            </span>
                          </button>
                        ),
                      )
                    ) : (
                      <div className="px-3 py-4">
                        <p className="font-medium">
                          No matching
                          IEM found.
                        </p>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                          Check the
                          spelling or
                          create the
                          IEM before
                          importing
                          this
                          impression.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedIem && (
                  <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                        Selected IEM
                      </p>

                      <p className="mt-1 font-semibold">
                        {getIemLabel(
                          selectedIem,
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIemId(
                          "",
                        )

                        setIemSearch(
                          "",
                        )

                        setIemPickerOpen(
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
            </div>

            <div className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    Imported images
                  </h3>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    These remain
                    on Head-Fi while
                    this is a draft.
                    Final images will
                    be copied to
                    Supabase from the
                    impression editor.
                  </p>
                </div>

                <span className="text-sm text-[var(--muted)]">
                  {
                    importData
                      .images
                      .length
                  }{" "}
                  total
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                <span>
                  {
                    importData
                      .inlineImages
                      .length
                  }{" "}
                  inline
                </span>

                <span>
                  {
                    importData
                      .attachmentImages
                      .length
                  }{" "}
                  attachment
                  {importData
                    .attachmentImages
                    .length ===
                  1
                    ? ""
                    : "s"}
                </span>
              </div>

              {importData.images
                .length >
              0 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                            `Impression image ${
                              index +
                              1
                            }`
                          }
                          className="aspect-[4/3] w-full object-cover"
                        />

                        <figcaption className="px-3 py-2 text-xs text-[var(--muted)]">
                          <p className="truncate">
                            {image.alt ||
                              `Image ${
                                index +
                                1
                              }`}
                          </p>

                          {index ===
                            0 && (
                            <p className="mt-1 font-semibold text-[var(--accent)]">
                              Temporary hero
                            </p>
                          )}
                        </figcaption>
                      </figure>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-3 text-[var(--muted)]">
                  No Head-Fi
                  images found.
                </p>
              )}
            </div>

            {(importData
              .youtubeEmbeds
              .length >
              0 ||
              importData
                .mediaEmbeds
                .length >
                0) && (
              <div className="mt-10">
                <h3 className="text-lg font-semibold">
                  Media references
                </h3>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  These references
                  will also be stored
                  with the draft so
                  they remain
                  available in the
                  impression editor.
                </p>

                {importData
                  .youtubeEmbeds
                  .length >
                  0 && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold">
                      YouTube
                    </p>

                    <div className="mt-3 space-y-2">
                      {importData.youtubeEmbeds.map(
                        (
                          video,
                        ) => (
                          <a
                            key={
                              video.videoId
                            }
                            href={
                              video.url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm transition hover:border-[var(--accent)]"
                          >
                            <span className="font-medium">
                              {
                                video.videoId
                              }
                            </span>

                            {video.title && (
                              <span className="ml-2 text-[var(--muted)]">
                                {
                                  video.title
                                }
                              </span>
                            )}
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {importData
                  .mediaEmbeds
                  .length >
                  0 && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold">
                      All media
                    </p>

                    <div className="mt-3 space-y-2">
                      {importData.mediaEmbeds.map(
                        (
                          media,
                          index,
                        ) => (
                          <a
                            key={`${media.platform}-${media.url}-${index}`}
                            href={
                              media.url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm transition hover:border-[var(--accent)]"
                          >
                            <span className="font-medium capitalize">
                              {
                                media.platform
                              }
                            </span>

                            <span className="ml-2 break-all text-[var(--muted)]">
                              {
                                media.url
                              }
                            </span>
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-10">
              <h3 className="text-lg font-semibold">
                Impression
                preview
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
                  No impression
                  body found.
                </p>
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              {error && (
                <ErrorBox
                  message={
                    error
                  }
                />
              )}

              {savedImpression ? (
                <div className="w-full rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-4">
                  <p className="font-semibold">
                    Impression draft
                    saved successfully.
                  </p>

                  <p className="mt-2 text-sm">
                    ID{" "}
                    {
                      savedImpression.id
                    }
                    {" · "}
                    {
                      savedImpression.slug
                    }
                  </p>
				  
				  <Link
                    to={`/admin/impressions/${savedImpression.id}/edit`}
                    className="mt-4 inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Edit impression
                  </Link>

                  <p className="mt-2 text-sm text-[var(--muted)]">
                    The complete
                    bookmarklet data,
                    including inline
                    images,
                    attachments and
                    media references,
                    has been retained
                    with the draft.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    void handleSaveDraft()
                  }
                  disabled={
                    saving ||
                    Boolean(
                      existingImpression,
                    ) ||
                    !selectedReviewerId ||
                    !selectedIemId
                  }
                  className="rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving…"
                    : "Save impression draft"}
                </button>
              )}

              {!selectedReviewerId &&
                !savedImpression && (
                <span className="text-sm text-[var(--muted)]">
                  Select a
                  contributor before
                  saving.
                </span>
              )}

              {selectedReviewerId &&
                !selectedIemId &&
                !savedImpression && (
                <span className="text-sm text-[var(--muted)]">
                  Select an IEM
                  before saving.
                </span>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function InfoBlock({
  title,
  children,
}: {
  title: string
  children:
    React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">
        {title}
      </h3>

      <div className="mt-2 leading-7 text-[var(--muted)]">
        {children}
      </div>
    </div>
  )
}

function ErrorBox({
  message,
}: {
  message: string
}) {
  return (
    <div className="mt-5 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
      {message}
    </div>
  )
}

export default ImportImpressionPage