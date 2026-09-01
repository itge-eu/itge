import {
  type ChangeEvent,
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

type ArtistRow = {
  id: number
  name: string
  slug: string
  image_url: string | null
}

type PendingImage = {
  file: File
  previewUrl: string
}

const OUTPUT_WIDTH = 1200
const OUTPUT_HEIGHT = 900
const OUTPUT_MIME_TYPE = "image/webp"
const OUTPUT_QUALITY = 0.88

function AdminArtistsPage() {
  const [
    artists,
    setArtists,
  ] =
    useState<
      ArtistRow[]
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
    searchQuery,
    setSearchQuery,
  ] =
    useState("")

  const [
    pendingImages,
    setPendingImages,
  ] =
    useState<
      Record<
        number,
        PendingImage
      >
    >({})

  const [
    savingArtistId,
    setSavingArtistId,
  ] =
    useState<number | null>(
      null,
    )

  const [
    successArtistId,
    setSuccessArtistId,
  ] =
    useState<number | null>(
      null,
    )

  useEffect(() => {
    let active = true

    async function loadArtists() {
      setLoading(true)
      setError(null)

      const {
        data,
        error:
          loadError,
      } =
        await supabase
          .from("artists")
          .select(`
            id,
            name,
            slug,
            image_url
          `)
          .order(
            "name",
            {
              ascending:
                true,
            },
          )

      if (!active) {
        return
      }

      if (loadError) {
        console.error(
          "Loading artists failed:",
          loadError,
        )

        setError(
          loadError.message,
        )

        setLoading(false)
        return
      }

      setArtists(
        (data ?? []).map(
          (artist) => ({
            id: Number(
              artist.id,
            ),
            name:
              artist.name,
            slug:
              artist.slug,
            image_url:
              artist.image_url ??
              null,
          }),
        ),
      )

      setLoading(false)
    }

    void loadArtists()

    return () => {
      active = false
    }
  }, [])

  const visibleArtists =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLowerCase()

      if (!normalizedSearch) {
        return artists
      }

      return artists.filter(
        (artist) =>
          [
            artist.name,
            artist.slug,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              normalizedSearch,
            ),
      )
    }, [
      artists,
      searchQuery,
    ])

  const withImageCount =
    artists.filter(
      (artist) =>
        Boolean(
          artist.image_url,
        ),
    ).length

  function handleFileChange(
    artistId: number,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      setError(
        "Please choose an image file.",
      )
      return
    }

    setError(null)
    setSuccessArtistId(
      null,
    )

    const previewUrl =
      URL.createObjectURL(
        file,
      )

    setPendingImages(
      (current) => {
        const existing =
          current[artistId]

        if (existing) {
          URL.revokeObjectURL(
            existing.previewUrl,
          )
        }

        return {
          ...current,
          [artistId]: {
            file,
            previewUrl,
          },
        }
      },
    )
  }

  async function handleUpload(
    artist: ArtistRow,
  ) {
    const pendingImage =
      pendingImages[
        artist.id
      ]

    if (!pendingImage) {
      return
    }

    setSavingArtistId(
      artist.id,
    )
    setSuccessArtistId(
      null,
    )
    setError(null)

    try {
      const croppedBlob =
        await cropImageToFourThree(
          pendingImage.file,
        )

      const storagePath =
        `artists/${artist.id}/hero.webp`

      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(
            "artist-images",
          )
          .upload(
            storagePath,
            croppedBlob,
            {
              contentType:
                OUTPUT_MIME_TYPE,
              upsert: true,
              cacheControl:
                "3600",
            },
          )

      if (uploadError) {
        throw uploadError
      }

      const {
        data:
          publicUrlData,
      } =
        supabase.storage
          .from(
            "artist-images",
          )
          .getPublicUrl(
            storagePath,
          )

      const imageUrl =
        `${publicUrlData.publicUrl}?v=${Date.now()}`

      const {
        data:
          updatedRows,
        error:
          updateError,
      } =
        await supabase
          .from("artists")
          .update({
            image_url:
              imageUrl,
          })
          .eq(
            "id",
            artist.id,
          )
          .select(
            "id, image_url",
          )

      if (updateError) {
        throw updateError
      }

      if (
        !updatedRows ||
        updatedRows.length ===
          0
      ) {
        throw new Error(
          "The image uploaded, but the artist row was not updated. Check the artists RLS policy.",
        )
      }

      setArtists(
        (current) =>
          current.map(
            (
              currentArtist,
            ) =>
              currentArtist.id ===
              artist.id
                ? {
                    ...currentArtist,
                    image_url:
                      imageUrl,
                  }
                : currentArtist,
          ),
      )

      setPendingImages(
        (current) => {
          const existing =
            current[
              artist.id
            ]

          if (existing) {
            URL.revokeObjectURL(
              existing.previewUrl,
            )
          }

          const next = {
            ...current,
          }

          delete next[
            artist.id
          ]

          return next
        },
      )

      setSuccessArtistId(
        artist.id,
      )
    } catch (
      uploadError
    ) {
      console.error(
        "Uploading artist image failed:",
        uploadError,
      )

      setError(
        uploadError instanceof
          Error
          ? uploadError.message
          : "Artist image could not be uploaded.",
      )
    } finally {
      setSavingArtistId(
        null,
      )
    }
  }

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
            Artist images
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            Upload the hero image used
            for each artist. Every image
            is centre-cropped to the same
            4:3 ratio and stored as a
            1200 × 900 WebP.
          </p>
        </header>

        {!loading && (
          <section className="mt-10 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Artists"
              value={
                artists.length
              }
            />

            <StatCard
              label="With image"
              value={
                withImageCount
              }
            />

            <StatCard
              label="Without image"
              value={
                artists.length -
                withImageCount
              }
            />
          </section>
        )}

        {!loading &&
          artists.length >
            0 && (
            <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
              <label
                htmlFor="artist-image-search"
                className="block text-sm font-semibold"
              >
                Search artists
              </label>

              <input
                id="artist-image-search"
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
                placeholder="Artist name…"
                className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)] sm:max-w-md"
              />
            </section>
          )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            <p className="font-semibold">
              Something went wrong
            </p>

            <p className="mt-2 text-sm">
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
            Loading artists…
          </div>
        ) : visibleArtists.length ===
          0 ? (
          <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <h2 className="text-xl font-semibold">
              No artists found
            </h2>

            <p className="mt-3 text-[var(--muted)]">
              Try a different search.
            </p>
          </div>
        ) : (
          <section className="mt-8 space-y-6">
            {visibleArtists.map(
              (artist) => {
                const pendingImage =
                  pendingImages[
                    artist.id
                  ]

                const isSaving =
                  savingArtistId ===
                  artist.id

                const wasSaved =
                  successArtistId ===
                  artist.id

                return (
                  <article
                    key={
                      artist.id
                    }
                    className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                          Artist
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                          {
                            artist.name
                          }
                        </h2>

                        <p className="mt-2 text-sm text-[var(--muted)]">
                          /artists/
                          {
                            artist.slug
                          }
                        </p>
                      </div>

                      {wasSaved && (
                        <span className="w-fit rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-600">
                          Saved
                        </span>
                      )}
                    </div>

                    <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]">
                      <ImagePanel
                        label="Current hero"
                        imageUrl={
                          artist.image_url
                        }
                        alt={
                          artist.name
                        }
                      />

                      <ImagePanel
                        label="New preview"
                        imageUrl={
                          pendingImage
                            ?.previewUrl ??
                          null
                        }
                        alt={`New ${artist.name} hero preview`}
                      />

                      <div className="flex flex-col justify-end gap-3">
                        <label className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-center text-sm font-semibold transition hover:border-[var(--accent)]">
                          Choose image

                          <input
                            type="file"
                            accept="image/*"
                            onChange={(
                              event,
                            ) =>
                              handleFileChange(
                                artist.id,
                                event,
                              )
                            }
                            className="sr-only"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            void handleUpload(
                              artist,
                            )
                          }
                          disabled={
                            !pendingImage ||
                            isSaving
                          }
                          className="rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isSaving
                            ? "Uploading…"
                            : artist.image_url
                              ? "Replace hero"
                              : "Upload hero"}
                        </button>

                        <p className="text-xs leading-5 text-[var(--muted)]">
                          The uploaded file
                          is automatically
                          centre-cropped to
                          4:3.
                        </p>
                      </div>
                    </div>
                  </article>
                )
              },
            )}
          </section>
        )}
      </div>
    </main>
  )
}

function ImagePanel({
  label,
  imageUrl,
  alt,
}: {
  label: string
  imageUrl: string | null
  alt: string
}) {
  return (
    <div>
      <p className="text-sm font-semibold">
        {label}
      </p>

      <div className="mt-3 aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]">
        {imageUrl ? (
          <img
            src={
              imageUrl
            }
            alt={
              alt
            }
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-5 text-center text-sm text-[var(--muted)]">
            No image
          </div>
        )}
      </div>
    </div>
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

async function cropImageToFourThree(
  file: File,
): Promise<Blob> {
  const image =
    await loadImage(
      file,
    )

  const sourceWidth =
    image.naturalWidth

  const sourceHeight =
    image.naturalHeight

  const targetRatio =
    OUTPUT_WIDTH /
    OUTPUT_HEIGHT

  const sourceRatio =
    sourceWidth /
    sourceHeight

  let cropWidth =
    sourceWidth

  let cropHeight =
    sourceHeight

  let sourceX = 0
  let sourceY = 0

  if (
    sourceRatio >
    targetRatio
  ) {
    cropWidth =
      sourceHeight *
      targetRatio

    sourceX =
      (sourceWidth -
        cropWidth) /
      2
  } else {
    cropHeight =
      sourceWidth /
      targetRatio

    sourceY =
      (sourceHeight -
        cropHeight) /
      2
  }

  const canvas =
    document.createElement(
      "canvas",
    )

  canvas.width =
    OUTPUT_WIDTH

  canvas.height =
    OUTPUT_HEIGHT

  const context =
    canvas.getContext(
      "2d",
    )

  if (!context) {
    throw new Error(
      "Image processing is not supported in this browser.",
    )
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    OUTPUT_WIDTH,
    OUTPUT_HEIGHT,
  )

  return new Promise(
    (
      resolve,
      reject,
    ) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "The cropped image could not be created.",
              ),
            )
            return
          }

          resolve(
            blob,
          )
        },
        OUTPUT_MIME_TYPE,
        OUTPUT_QUALITY,
      )
    },
  )
}

function loadImage(
  file: File,
): Promise<HTMLImageElement> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const objectUrl =
        URL.createObjectURL(
          file,
        )

      const image =
        new Image()

      image.onload = () => {
        URL.revokeObjectURL(
          objectUrl,
        )

        resolve(
          image,
        )
      }

      image.onerror = () => {
        URL.revokeObjectURL(
          objectUrl,
        )

        reject(
          new Error(
            "The selected image could not be opened.",
          ),
        )
      }

      image.src =
        objectUrl
    },
  )
}

export default AdminArtistsPage
