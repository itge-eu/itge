import {
  useEffect,
  useState,
} from "react"

import {
  Link,
  useNavigate,
  useParams,
} from "react-router"

import {
  supabase,
} from "../lib/supabase"

import {
  replaceImpressionImageUrls,
  uploadImpressionImages,
  type UploadedImpressionImage,
} from "../lib/impressionImages"

import {
  ArtistPicker,
  type SelectedArtist,
} from "../components/admin/ArtistPicker"

import {
  GenrePicker,
} from "../components/admin/GenrePicker"

import {
  type Genre,
} from "../lib/genres"

type PendingImage = {
  url: string
  alt: string
  filename?: string
}

type YouTubeEmbed = {
  videoId: string
  url: string
  title?: string
}

type MediaEmbed = {
  platform: string
  url: string
  title?: string
}

type ImportData = {
  images?: PendingImage[]
  inlineImages?: PendingImage[]
  attachmentImages?: PendingImage[]

  youtubeEmbeds?:
    YouTubeEmbed[]

  mediaEmbeds?:
    MediaEmbed[]

  threadUrl?: string | null
  threadTitle?: string | null
  author?: string | null
  bodyText?: string | null
}

type ImpressionForm = {
  id: number

  title: string
  slug: string

  summary: string
  body: string

  heroImageUrl: string

  published: boolean
  publishedAt: string

  source: string
  sourceUrl: string
  sourcePostId: string

  reviewerName: string
  productName: string

  pendingImages:
    PendingImage[]

  youtubeEmbeds:
    YouTubeEmbed[]

  mediaEmbeds:
    MediaEmbed[]

  threadUrl: string
  threadTitle: string
}

function createEmptyImpression(): ImpressionForm {
  return {
    id: 0,

    title: "",
    slug: "",

    summary: "",
    body: "",

    heroImageUrl: "",

    published: false,
    publishedAt: "",

    source: "",
    sourceUrl: "",
    sourcePostId: "",

    reviewerName: "",
    productName: "",

    pendingImages: [],

    youtubeEmbeds: [],
    mediaEmbeds: [],

    threadUrl: "",
    threadTitle: "",
  }
}

function createArtistSlug(
  name: string,
  musicbrainzId: string,
) {
  const nameSlug =
    name
      .trim()
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

  return `${nameSlug}-${musicbrainzId.slice(
    0,
    8,
  )}`
}

function formatDate(
  value: string,
) {
  if (!value) {
    return "Unknown"
  }

  const parsed =
    new Date(value)

  if (
    Number.isNaN(
      parsed.getTime(),
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
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(parsed)
}

function AdminEditImpressionPage() {
  const { id } =
    useParams()

  const navigate =
    useNavigate()

  const [
    impression,
    setImpression,
  ] =
    useState<ImpressionForm>(
      createEmptyImpression(),
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    saving,
    setSaving,
  ] =
    useState(false)

  const [
    publishing,
    setPublishing,
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
    successMessage,
    setSuccessMessage,
  ] =
    useState<string | null>(
      null,
    )

  const [
    bodyMode,
    setBodyMode,
  ] =
    useState<
      "preview" | "html"
    >("preview")

  const [
    uploadingImages,
    setUploadingImages,
  ] =
    useState(false)

  const [
    imageUploadProgress,
    setImageUploadProgress,
  ] =
    useState("")

  const [
    uploadedImages,
    setUploadedImages,
  ] =
    useState<
      UploadedImpressionImage[]
    >([])

  const [
    selectedArtists,
    setSelectedArtists,
  ] =
    useState<
      SelectedArtist[]
    >([])

  const [
    selectedGenres,
    setSelectedGenres,
  ] =
    useState<
      Genre[]
    >([])

  useEffect(() => {
    async function loadImpression() {
      if (!id) {
        setError(
          "No impression ID was provided.",
        )

        setLoading(
          false,
        )

        return
      }

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
            summary,
            body,
            hero_image_url,
            published,
            published_at,
            source,
            source_url,
            source_post_id,
            import_data,

            reviewers (
              name
            ),

            products (
              model,

              brands (
                name
              )
            )
          `)
          .eq(
            "id",
            id,
          )
          .single()

      if (queryError) {
        console.error(
          "Loading impression failed:",
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

      /*
       * Load already-localised
       * impression images.
       */
      const {
        data:
          imageRows,
        error:
          imageRowsError,
      } =
        await supabase
          .from(
            "impression_images",
          )
          .select(`
            storage_path,
            public_url,
            original_url,
            alt_text
          `)
          .eq(
            "impression_id",
            id,
          )
          .order(
            "sort_order",
          )

      if (
        imageRowsError
      ) {
        console.error(
          "Loading stored impression images failed:",
          imageRowsError,
        )

        setError(
          imageRowsError.message,
        )

        setLoading(
          false,
        )

        return
      }

      setUploadedImages(
        (
          imageRows ??
          []
        ).map(
          (image) => ({
            storagePath:
              image.storage_path,

            publicUrl:
              image.public_url,

            originalUrl:
              image.original_url,

            alt:
              image.alt_text ??
              "",
          }),
        ),
      )

      /*
       * Existing artists.
       */
      const {
        data:
          artistRows,

        error:
          artistRowsError,
      } =
        await supabase
          .from(
            "impression_artists",
          )
          .select(`
            artists (
              id,
              musicbrainz_id,
              name,
              slug,
              sort_name,
              disambiguation,
              country,
              artist_type
            )
          `)
          .eq(
            "impression_id",
            id,
          )

      if (
        artistRowsError
      ) {
        console.error(
          "Loading impression artists failed:",
          artistRowsError,
        )

        setError(
          artistRowsError.message,
        )

        setLoading(
          false,
        )

        return
      }

      const loadedArtists:
        SelectedArtist[] =
        []

      for (
        const row of
        artistRows ??
        []
      ) {
        const relation =
          Array.isArray(
            row.artists,
          )
            ? row.artists[0]
            : row.artists

        if (!relation) {
          continue
        }

        loadedArtists.push({
          databaseId:
            Number(
              relation.id,
            ),

          musicbrainzId:
            relation.musicbrainz_id,

          name:
            relation.name,

          sortName:
            relation.sort_name ??
            "",

          disambiguation:
            relation.disambiguation ??
            "",

          country:
            relation.country ??
            "",

          type:
            relation.artist_type ??
            "",

          area: "",
          beginDate: "",
          endDate: "",
          ended: false,
          score: 100,
        })
      }

      setSelectedArtists(
        loadedArtists,
      )

      /*
       * Existing genres.
       */
      const {
        data:
          genreRows,

        error:
          genreRowsError,
      } =
        await supabase
          .from(
            "impression_genres",
          )
          .select(`
            genres (
              id,
              name,
              slug,
              sort_order
            )
          `)
          .eq(
            "impression_id",
            id,
          )

      if (
        genreRowsError
      ) {
        console.error(
          "Loading impression genres failed:",
          genreRowsError,
        )

        setError(
          genreRowsError.message,
        )

        setLoading(
          false,
        )

        return
      }

      const loadedGenres:
        Genre[] =
        []

      for (
        const row of
        genreRows ??
        []
      ) {
        const relation =
          Array.isArray(
            row.genres,
          )
            ? row.genres[0]
            : row.genres

        if (!relation) {
          continue
        }

        loadedGenres.push({
          id:
            Number(
              relation.id,
            ),

          name:
            relation.name,

          slug:
            relation.slug,

          sortOrder:
            Number(
              relation.sort_order,
            ),
        })
      }

      setSelectedGenres(
        loadedGenres,
      )

      const productRelation =
        Array.isArray(
          data.products,
        )
          ? data.products[0]
          : data.products

      const brandRelation =
        Array.isArray(
          productRelation?.brands,
        )
          ? productRelation
              ?.brands[0]
          : productRelation
              ?.brands

      const reviewerRelation =
        Array.isArray(
          data.reviewers,
        )
          ? data.reviewers[0]
          : data.reviewers

      const brandName =
        brandRelation
          ?.name?.trim() ??
        ""

      const modelName =
        productRelation
          ?.model?.trim() ??
        ""

      const productName =
        [
          brandName,
          modelName,
        ]
          .filter(Boolean)
          .join(" ")

      const importData =
        (
          data.import_data ??
          {}
        ) as ImportData

      const pendingImages =
        Array.isArray(
          importData.images,
        )
          ? importData.images
          : []

      const youtubeEmbeds =
        Array.isArray(
          importData.youtubeEmbeds,
        )
          ? importData.youtubeEmbeds
          : []

      const mediaEmbeds =
        Array.isArray(
          importData.mediaEmbeds,
        )
          ? importData.mediaEmbeds
          : []

      setImpression({
        id:
          Number(
            data.id,
          ),

        title:
          data.title ??
          "",

        slug:
          data.slug ??
          "",

        summary:
          data.summary ??
          "",

        body:
          data.body ??
          "",

        heroImageUrl:
          data.hero_image_url ??
          "",

        published:
          Boolean(
            data.published,
          ),

        publishedAt:
          data.published_at ??
          "",

        source:
          data.source ??
          "",

        sourceUrl:
          data.source_url ??
          "",

        sourcePostId:
          data.source_post_id ??
          "",

        reviewerName:
          reviewerRelation
            ?.name ??
          "Unknown contributor",

        productName:
          productName ||
          "Unknown IEM",

        pendingImages,

        youtubeEmbeds,

        mediaEmbeds,

        threadUrl:
          importData.threadUrl ??
          "",

        threadTitle:
          importData.threadTitle ??
          "",
      })

      setLoading(false)
    }

    void loadImpression()
  }, [id])

  function updateField<
    K extends keyof ImpressionForm,
  >(
    field: K,
    value:
      ImpressionForm[K],
  ) {
    setImpression(
      (
        currentImpression,
      ) => ({
        ...currentImpression,

        [field]:
          value,
      }),
    )
  }

  async function saveImpressionArtists(
    impressionId: number,
  ) {
    const artistIds:
      number[] =
      []

    for (
      const artist of
      selectedArtists
    ) {
      const {
        data:
          storedArtist,

        error:
          artistError,
      } =
        await supabase
          .from("artists")
          .upsert(
            {
              musicbrainz_id:
                artist.musicbrainzId,

              name:
                artist.name,

              slug:
                createArtistSlug(
                  artist.name,
                  artist.musicbrainzId,
                ),

              sort_name:
                artist.sortName ||
                null,

              disambiguation:
                artist.disambiguation ||
                null,

              country:
                artist.country ||
                null,

              artist_type:
                artist.type ||
                null,
            },
            {
              onConflict:
                "musicbrainz_id",
            },
          )
          .select("id")
          .single()

      if (artistError) {
        throw new Error(
          `Could not save artist ${artist.name}: ${artistError.message}`,
        )
      }

      artistIds.push(
        Number(
          storedArtist.id,
        ),
      )
    }

    const {
      error:
        deleteError,
    } =
      await supabase
        .from(
          "impression_artists",
        )
        .delete()
        .eq(
          "impression_id",
          impressionId,
        )

    if (deleteError) {
      throw new Error(
        `Could not update impression artists: ${deleteError.message}`,
      )
    }

    if (
      artistIds.length ===
      0
    ) {
      return
    }

    const {
      error:
        relationError,
    } =
      await supabase
        .from(
          "impression_artists",
        )
        .insert(
          artistIds.map(
            (
              artistId,
            ) => ({
              impression_id:
                impressionId,

              artist_id:
                artistId,
            }),
          ),
        )

    if (relationError) {
      throw new Error(
        `Could not attach artists to impression: ${relationError.message}`,
      )
    }
  }

  async function saveImpressionGenres(
    impressionId: number,
  ) {
    const {
      error:
        deleteError,
    } =
      await supabase
        .from(
          "impression_genres",
        )
        .delete()
        .eq(
          "impression_id",
          impressionId,
        )

    if (deleteError) {
      throw new Error(
        `Could not update impression genres: ${deleteError.message}`,
      )
    }

    if (
      selectedGenres.length ===
      0
    ) {
      return
    }

    const {
      error:
        insertError,
    } =
      await supabase
        .from(
          "impression_genres",
        )
        .insert(
          selectedGenres.map(
            (genre) => ({
              impression_id:
                impressionId,

              genre_id:
                genre.id,
            }),
          ),
        )

    if (insertError) {
      throw new Error(
        `Could not attach genres to impression: ${insertError.message}`,
      )
    }
  }

  async function saveImpression(
    options?: {
      publish?: boolean
    },
  ) {
    const shouldPublish =
      options?.publish ??
      false

    if (
      !impression.title.trim()
    ) {
      setError(
        "The impression title cannot be empty.",
      )

      return
    }

    if (
      !impression.slug.trim()
    ) {
      setError(
        "The impression slug cannot be empty.",
      )

      return
    }

    /*
     * If imported images exist,
     * require localisation before
     * publishing.
     */
    if (
      shouldPublish &&
      impression
        .pendingImages
        .length >
        0 &&
      uploadedImages.length ===
        0
    ) {
      setError(
        "Copy the imported images to Supabase before publishing this impression.",
      )

      return
    }

    if (shouldPublish) {
      setPublishing(
        true,
      )
    } else {
      setSaving(
        true,
      )
    }

    setError(null)
    setSuccessMessage(
      null,
    )

    const transformedBody =
      replaceImpressionImageUrls(
        impression.body,
        uploadedImages,
      )

    let heroImageUrl =
      impression.heroImageUrl.trim()

    /*
     * If the current hero still
     * points at one of the original
     * imported URLs, replace it too.
     */
    for (
      const image of
      uploadedImages
    ) {
      if (
        heroImageUrl ===
        image.originalUrl
      ) {
        heroImageUrl =
          image.publicUrl

        break
      }
    }

    const payload = {
      title:
        impression.title.trim(),

      slug:
        impression.slug.trim(),

      summary:
        impression.summary.trim() ||
        null,

      body:
        transformedBody.trim() ||
        null,

      hero_image_url:
        heroImageUrl ||
        null,

      published:
        shouldPublish
          ? true
          : impression.published,
    }

    const {
      data,
      error:
        updateError,
    } =
      await supabase
        .from(
          "impressions",
        )
        .update(
          payload,
        )
        .eq(
          "id",
          impression.id,
        )
        .select(`
          published
        `)
        .single()

    if (updateError) {
      console.error(
        "Updating impression failed:",
        updateError,
      )

      setError(
        updateError.message,
      )

      setSaving(
        false,
      )

      setPublishing(
        false,
      )

      return
    }

    try {
      await saveImpressionArtists(
        impression.id,
      )

      await saveImpressionGenres(
        impression.id,
      )
    } catch (
      relationError
    ) {
      console.error(
        "Saving impression metadata failed:",
        relationError,
      )

      setError(
        relationError instanceof
          Error
          ? relationError.message
          : "The impression was saved, but its artists or genres could not be saved.",
      )

      setSaving(
        false,
      )

      setPublishing(
        false,
      )

      return
    }

    setImpression(
      (
        current,
      ) => ({
        ...current,

        body:
          transformedBody,

        heroImageUrl,

        published:
          Boolean(
            data.published,
          ),
      }),
    )

    setSuccessMessage(
      shouldPublish
        ? "Impression published successfully."
        : "Impression saved successfully.",
    )

    setSaving(false)
    setPublishing(false)
  }

  async function handleUnpublish() {
    setSaving(true)
    setError(null)
    setSuccessMessage(
      null,
    )

    const {
      data,
      error:
        updateError,
    } =
      await supabase
        .from(
          "impressions",
        )
        .update({
          published:
            false,
        })
        .eq(
          "id",
          impression.id,
        )
        .select(`
          published
        `)
        .single()

    if (updateError) {
      console.error(
        "Unpublishing impression failed:",
        updateError,
      )

      setError(
        updateError.message,
      )

      setSaving(
        false,
      )

      return
    }

    setImpression(
      (
        current,
      ) => ({
        ...current,

        published:
          Boolean(
            data.published,
          ),
      }),
    )

    setSuccessMessage(
      "Impression returned to draft.",
    )

    setSaving(false)
  }

  async function handleUploadImages() {
    if (
      !impression
        .pendingImages
        .length
    ) {
      setError(
        "No imported images were found for this impression.",
      )

      return
    }

    setUploadingImages(
      true,
    )

    setError(null)
    setSuccessMessage(
      null,
    )

    setImageUploadProgress(
      "",
    )

    try {
      const uploaded =
        await uploadImpressionImages(
          impression.id,

          impression.pendingImages,

          (
            current,
            total,
          ) => {
            setImageUploadProgress(
              `Copying image ${current} of ${total}…`,
            )
          },
        )

      setUploadedImages(
        uploaded,
      )

      const transformedBody =
        replaceImpressionImageUrls(
          impression.body,
          uploaded,
        )

      const firstImage =
        uploaded[0]

      const heroImageUrl =
        firstImage
          ?.publicUrl ??
        impression.heroImageUrl

      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            "impressions",
          )
          .update({
            body:
              transformedBody ||
              null,

            hero_image_url:
              heroImageUrl ||
              null,
          })
          .eq(
            "id",
            impression.id,
          )

      if (updateError) {
        throw new Error(
          `Images were uploaded, but the impression could not be updated: ${updateError.message}`,
        )
      }

      setImpression(
        (
          current,
        ) => ({
          ...current,

          body:
            transformedBody,

          heroImageUrl,
        }),
      )

      setSuccessMessage(
        `${uploaded.length} image${
          uploaded.length ===
          1
            ? ""
            : "s"
        } copied to Supabase.`,
      )
    } catch (
      uploadError
    ) {
      console.error(
        "Impression image upload failed:",
        uploadError,
      )

      setError(
        uploadError instanceof
          Error
          ? uploadError.message
          : "The images could not be uploaded.",
      )
    } finally {
      setUploadingImages(
        false,
      )

      setImageUploadProgress(
        "",
      )
    }
  }

  const previewHtml =
    replaceImpressionImageUrls(
      impression.body,
      uploadedImages,
    )

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-[var(--muted)]">
            Loading
            impression…
          </p>
        </div>
      </main>
    )
  }

  if (
    error &&
    impression.id === 0
  ) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/admin/impressions"
            className="text-sm font-medium text-[var(--accent)]"
          >
            ← Back to admin
            impressions
          </Link>

          <div className="mt-12 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            <p className="font-semibold">
              Impression could
              not be loaded.
            </p>

            <p className="mt-2 text-sm">
              {error}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-12 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/admin/impressions"
            className="text-sm font-medium text-[var(--accent)]"
          >
            ← Back to admin
            impressions
          </Link>

          <div className="flex flex-wrap gap-3">
            {impression.published && (
              <Link
                to={`/impressions/${impression.slug}`}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface)]"
              >
                View public
                impression
              </Link>
            )}

            <button
              type="button"
              onClick={() =>
                void saveImpression()
              }
              disabled={
                saving ||
                publishing
              }
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving…"
                : "Save changes"}
            </button>

            {impression.published ? (
              <button
                type="button"
                onClick={() =>
                  void handleUnpublish()
                }
                disabled={
                  saving ||
                  publishing
                }
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Return to draft
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  void saveImpression({
                    publish:
                      true,
                  })
                }
                disabled={
                  saving ||
                  publishing
                }
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {publishing
                  ? "Publishing…"
                  : "Publish impression"}
              </button>
            )}
          </div>
        </div>

        <header className="mt-10">
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

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Edit impression
          </h1>

          <p className="mt-4 text-lg text-[var(--muted)]">
            {
              impression.productName
            }
            {" · "}
            {
              impression.reviewerName
            }
          </p>
        </header>

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-8 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3">
            {
              successMessage
            }
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-8">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <h2 className="text-xl font-semibold">
                Impression content
              </h2>

              <div className="mt-6">
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold"
                >
                  Title
                </label>

                <input
                  id="title"
                  type="text"
                  value={
                    impression.title
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "title",
                      event.target
                        .value,
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                />
              </div>

              <div className="mt-6">
                <label
                  htmlFor="summary"
                  className="block text-sm font-semibold"
                >
                  Summary
                </label>

                <textarea
                  id="summary"
                  value={
                    impression.summary
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "summary",
                      event.target
                        .value,
                    )
                  }
                  rows={4}
                  className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                />
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <label className="block text-sm font-semibold">
                    Impression
                    body
                  </label>

                  <div className="flex rounded-xl border border-[var(--border)] p-1">
                    <button
                      type="button"
                      onClick={() =>
                        setBodyMode(
                          "preview",
                        )
                      }
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                        bodyMode ===
                        "preview"
                          ? "bg-[var(--accent)] text-white"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      Preview
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setBodyMode(
                          "html",
                        )
                      }
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                        bodyMode ===
                        "html"
                          ? "bg-[var(--accent)] text-white"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      Edit HTML
                    </button>
                  </div>
                </div>

                {bodyMode ===
                "preview" ? (
                  <div
                    className="review-content mt-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-5"
                    dangerouslySetInnerHTML={{
                      __html:
                        previewHtml,
                    }}
                  />
                ) : (
                  <textarea
                    id="body"
                    value={
                      impression.body
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "body",
                        event.target
                          .value,
                      )
                    }
                    rows={28}
                    spellCheck={
                      false
                    }
                    className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-sm leading-7 outline-none transition focus:border-[var(--accent)]"
                  />
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-8">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-lg font-semibold">
                Publishing
              </h2>

              <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Status
                </p>

                <p className="mt-1 font-semibold">
                  {impression.published
                    ? "Published"
                    : "Draft"}
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Original date
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {formatDate(
                    impression.publishedAt,
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-lg font-semibold">
                Impression details
              </h2>

              <dl className="mt-6 space-y-5 text-sm">
                <div>
                  <dt className="text-[var(--muted)]">
                    IEM
                  </dt>

                  <dd className="mt-1 font-semibold">
                    {
                      impression.productName
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--muted)]">
                    Contributor
                  </dt>

                  <dd className="mt-1 font-semibold">
                    {
                      impression.reviewerName
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--muted)]">
                    Slug
                  </dt>

                  <dd className="mt-1 break-all font-mono text-xs">
                    {
                      impression.slug
                    }
                  </dd>
                </div>
              </dl>
            </div>

            <ArtistPicker
              selectedArtists={
                selectedArtists
              }
              onChange={
                setSelectedArtists
              }
            />

            <GenrePicker
              selectedGenres={
                selectedGenres
              }
              onChange={
                setSelectedGenres
              }
            />

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  Original imported
                  images
                </h2>

                <span className="text-sm text-[var(--muted)]">
                  {
                    impression
                      .pendingImages
                      .length
                  }
                </span>
              </div>

              {impression
                .pendingImages
                .length >
              0 ? (
                <>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {impression.pendingImages.map(
                      (
                        image,
                        index,
                      ) => (
                        <img
                          key={`${image.url}-${index}`}
                          src={
                            image.url
                          }
                          alt={
                            image.alt ||
                            ""
                          }
                          className="aspect-square w-full rounded-xl object-cover"
                        />
                      ),
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void handleUploadImages()
                    }
                    disabled={
                      uploadingImages
                    }
                    className="mt-5 w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadingImages
                      ? imageUploadProgress ||
                        "Copying images…"
                      : uploadedImages.length >
                          0
                        ? "Replace stored images"
                        : "Copy images to Supabase"}
                  </button>

                  {uploadedImages.length >
                    0 && (
                    <p className="mt-3 text-sm text-green-600">
                      {
                        uploadedImages.length
                      }{" "}
                      image
                      {uploadedImages.length ===
                      1
                        ? ""
                        : "s"}{" "}
                      stored
                      successfully.
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm text-[var(--muted)]">
                  No images were
                  included in the
                  imported
                  impression.
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-lg font-semibold">
                Hero image
              </h2>

              {impression.heroImageUrl && (
                <img
                  src={
                    impression.heroImageUrl
                  }
                  alt=""
                  className="mt-5 aspect-[4/3] w-full rounded-2xl object-cover"
                />
              )}

              <label
                htmlFor="hero-image"
                className="mt-5 block text-sm font-semibold"
              >
                Image URL
              </label>

              <input
                id="hero-image"
                type="url"
                value={
                  impression.heroImageUrl
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "heroImageUrl",
                    event.target
                      .value,
                  )
                }
                className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
              />
            </div>

            {(impression
              .youtubeEmbeds
              .length >
              0 ||
              impression
                .mediaEmbeds
                .length >
                0) && (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <h2 className="text-lg font-semibold">
                  Media references
                </h2>

                {impression
                  .youtubeEmbeds
                  .length >
                  0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      YouTube
                    </p>

                    <div className="mt-3 space-y-2">
                      {impression.youtubeEmbeds.map(
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
                            className="block break-all rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm text-[var(--accent)] transition hover:border-[var(--accent)]"
                          >
                            {video.title ||
                              video.videoId}
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {impression
                  .mediaEmbeds
                  .filter(
                    (media) =>
                      media.platform !==
                      "youtube",
                  )
                  .length >
                  0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      Other media
                    </p>

                    <div className="mt-3 space-y-2">
                      {impression.mediaEmbeds
                        .filter(
                          (media) =>
                            media.platform !==
                            "youtube",
                        )
                        .map(
                          (
                            media,
                            index,
                          ) => (
                            <a
                              key={`${media.platform}-${index}`}
                              href={
                                media.url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm transition hover:border-[var(--accent)]"
                            >
                              <span className="font-semibold capitalize">
                                {
                                  media.platform
                                }
                              </span>

                              {media.title && (
                                <span className="mt-1 block text-[var(--muted)]">
                                  {
                                    media.title
                                  }
                                </span>
                              )}
                            </a>
                          ),
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-lg font-semibold">
                Source metadata
              </h2>

              <dl className="mt-6 space-y-5 text-sm">
                <div>
                  <dt className="text-[var(--muted)]">
                    Platform
                  </dt>

                  <dd className="mt-1">
                    {impression.source ||
                      "Unknown"}
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--muted)]">
                    Source post ID
                  </dt>

                  <dd className="mt-1">
                    {impression.sourcePostId ||
                      "Unknown"}
                  </dd>
                </div>

                {impression.threadTitle && (
                  <div>
                    <dt className="text-[var(--muted)]">
                      Thread
                    </dt>

                    <dd className="mt-1">
                      {
                        impression.threadTitle
                      }
                    </dd>
                  </div>
                )}
              </dl>

              {impression.sourceUrl && (
                <a
                  href={
                    impression.sourceUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-block text-sm font-semibold text-[var(--accent)] underline"
                >
                  Open original
                  post
                </a>
              )}

              {impression.threadUrl && (
                <a
                  href={
                    impression.threadUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block text-sm font-semibold text-[var(--accent)] underline"
                >
                  Open original
                  thread
                </a>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-wrap justify-end gap-3 border-t border-[var(--border)] pt-8">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/impressions",
              )
            }
            className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold transition hover:bg-[var(--surface)]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              void saveImpression()
            }
            disabled={
              saving ||
              publishing
            }
            className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold transition hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving…"
              : "Save changes"}
          </button>

          {!impression.published && (
            <button
              type="button"
              onClick={() =>
                void saveImpression({
                  publish:
                    true,
                })
              }
              disabled={
                saving ||
                publishing
              }
              className="rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishing
                ? "Publishing…"
                : "Publish impression"}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

export default AdminEditImpressionPage