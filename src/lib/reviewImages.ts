import { supabase } from "./supabase";

export type PendingReviewImage = {
  url: string;
  alt?: string;
};

export type UploadedReviewImage = {
  storagePath: string;
  publicUrl: string;
  originalUrl: string;
  alt: string;
};

type CopyImageResponse = {
  storagePath?: string;
  publicUrl?: string;
  originalUrl?: string;
  alt?: string;
  error?: string;
};

export async function uploadReviewImages(
  reviewId: number,
  images: PendingReviewImage[],
  onProgress?: (current: number, total: number) => void,
): Promise<UploadedReviewImage[]> {
  const uploadedImages: UploadedReviewImage[] = [];

  for (let index = 0; index < images.length; index++) {
    const image = images[index];

    onProgress?.(index + 1, images.length);

    const { data, error } =
      await supabase.functions.invoke<CopyImageResponse>(
        "copy-review-image",
        {
          body: {
            reviewId,
            imageUrl: image.url,
            alt: image.alt ?? "",
            sortOrder: index,
		    replaceExisting: index === 0,
          },
        },
      );

    if (error) {
      throw new Error(
        `Copying image ${index + 1} failed: ${error.message}`,
      );
    }

    if (data?.error) {
      throw new Error(
        `Copying image ${index + 1} failed: ${data.error}`,
      );
    }

    if (
      !data?.storagePath ||
      !data.publicUrl ||
      !data.originalUrl
    ) {
      throw new Error(
        `Copying image ${index + 1} returned incomplete data.`,
      );
    }

    uploadedImages.push({
      storagePath: data.storagePath,
      publicUrl: data.publicUrl,
      originalUrl: data.originalUrl,
      alt: data.alt ?? "",
    });
  }

  return uploadedImages;
}

export function replaceReviewImageUrls(
  html: string,
  images: {
    originalUrl: string;
    publicUrl: string;
  }[],
) {
  if (!html || images.length === 0) {
    return html;
  }

  let updatedHtml = html;

  for (const image of images) {
    if (!image.originalUrl || !image.publicUrl) {
      continue;
    }

    updatedHtml = updatedHtml.split(image.originalUrl).join(
      image.publicUrl,
    );
  }

  return updatedHtml;
}