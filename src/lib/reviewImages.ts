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

function normalizeUrl(value: string) {
  try {
    return new URL(value, window.location.href).href;
  } catch {
    return value;
  }
}

function urlsMatch(
  first: string | null,
  second: string,
) {
  if (!first) {
    return false;
  }

  return normalizeUrl(first) === normalizeUrl(second);
}

function isImgBbPageUrl(value: string | null) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value, window.location.href);

    return (
      url.protocol === "https:" &&
      url.hostname.toLowerCase() === "ibb.co"
    );
  } catch {
    return false;
  }
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

  /*
   * Browser-side review editing always has DOMParser
   * available. Keep the simple replacement fallback
   * below just in case this helper is ever called in
   * another environment.
   */
  if (typeof DOMParser === "undefined") {
    let updatedHtml = html;

    for (const image of images) {
      if (!image.originalUrl || !image.publicUrl) {
        continue;
      }

      updatedHtml = updatedHtml
        .split(image.originalUrl)
        .join(image.publicUrl);
    }

    return updatedHtml;
  }

  const parser = new DOMParser();

  const document = parser.parseFromString(
    `<div id="itge-review-root">${html}</div>`,
    "text/html",
  );

  const root = document.querySelector(
    "#itge-review-root",
  );

  if (!root) {
    return html;
  }

  for (const image of images) {
    if (!image.originalUrl || !image.publicUrl) {
      continue;
    }

    const originalUrl = normalizeUrl(
      image.originalUrl,
    );

    /*
     * Find every <img> belonging to this copied image.
     *
     * Head-Fi may store the same URL in src, data-src
     * and/or data-url, so check all three.
     */
    const imageElements = [
      ...root.querySelectorAll("img"),
    ].filter((element) => {
      return (
        urlsMatch(
          element.getAttribute("src"),
          originalUrl,
        ) ||
        urlsMatch(
          element.getAttribute("data-src"),
          originalUrl,
        ) ||
        urlsMatch(
          element.getAttribute("data-url"),
          originalUrl,
        )
      );
    });

    for (const element of imageElements) {
      /*
       * Replace every URL attribute that actually
       * points to the original image.
       */
      for (const attribute of [
        "src",
        "data-src",
        "data-url",
      ]) {
        if (
          urlsMatch(
            element.getAttribute(attribute),
            originalUrl,
          )
        ) {
          element.setAttribute(
            attribute,
            image.publicUrl,
          );
        }
      }

      /*
       * ImgBB wraps images in a link to its own
       * image page:
       *
       * <a href="https://ibb.co/...">
       *   <img src="https://i.ibb.co/...">
       * </a>
       *
       * Once ITGE owns a copied version, point that
       * wrapper directly to our Supabase image
       * instead.
       *
       * We ONLY alter an ImgBB anchor that actually
       * contains this imported image. Other links in
       * the review remain untouched.
       */
      const parentLink = element.closest("a");

      if (
        parentLink &&
        isImgBbPageUrl(
          parentLink.getAttribute("href"),
        )
      ) {
        parentLink.setAttribute(
          "href",
          image.publicUrl,
        );

        /*
         * The external-site attributes are no longer
         * needed because the link now points to our
         * own image.
         */
        parentLink.removeAttribute("target");
        parentLink.removeAttribute("rel");
      }
    }

    /*
     * Preserve the old behaviour too. This catches
     * occurrences elsewhere in Head-Fi's imported
     * markup that aren't attached directly to the
     * <img> element.
     */
    root.innerHTML = root.innerHTML
      .split(image.originalUrl)
      .join(image.publicUrl);
  }

  return root.innerHTML;
}