import {
  supabase,
} from "./supabase"

export type PendingImpressionImage = {
  url: string
  alt: string
}

export type UploadedImpressionImage = {
  storagePath: string
  publicUrl: string
  originalUrl: string
  alt: string
}

export async function uploadImpressionImages(
  impressionId: number,
  images: PendingImpressionImage[],
  onProgress?: (
    current: number,
    total: number,
  ) => void,
): Promise<
  UploadedImpressionImage[]
> {
  const uploaded:
    UploadedImpressionImage[] =
    []

  for (
    let index = 0;
    index < images.length;
    index += 1
  ) {
    const image =
      images[index]

    onProgress?.(
      index + 1,
      images.length,
    )

    const {
      data,
      error,
    } =
      await supabase.functions.invoke(
        "copy-impression-image",
        {
          body: {
            impressionId,

            imageUrl:
              image.url,

            alt:
              image.alt ?? "",

            sortOrder:
              index,

            /*
             * The first upload clears
             * existing stored images.
             */
            replaceExisting:
              index === 0,
          },
        },
      )

    if (error) {
      throw new Error(
        `Image ${
          index + 1
        } could not be copied: ${
          error.message
        }`,
      )
    }

    if (
      !data ||
      typeof data.publicUrl !==
        "string" ||
      typeof data.storagePath !==
        "string"
    ) {
      throw new Error(
        `Image ${
          index + 1
        } returned an invalid response.`,
      )
    }

    uploaded.push({
      storagePath:
        data.storagePath,

      publicUrl:
        data.publicUrl,

      originalUrl:
        typeof data.originalUrl ===
        "string"
          ? data.originalUrl
          : image.url,

      alt:
        typeof data.alt ===
        "string"
          ? data.alt
          : image.alt,
    })
  }

  return uploaded
}

export function replaceImpressionImageUrls(
  html: string,
  images:
    UploadedImpressionImage[],
) {
  let result =
    html

  for (
    const image of images
  ) {
    if (
      !image.originalUrl ||
      !image.publicUrl
    ) {
      continue
    }

    result =
      result
        .split(
          image.originalUrl,
        )
        .join(
          image.publicUrl,
        )
  }

  return result
}