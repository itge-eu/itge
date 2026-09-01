import {
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Link,
  useParams,
} from "react-router"

import ReviewerAvatar from "../components/reviewers/ReviewerAvatar"
import Breadcrumbs from "../components/navigation/Breadcrumbs"
import PageState from "../components/layout/PageState"

import {
  getReviewBySlug,
  type FullReview,
} from "../lib/reviews"

import usePageMetadata from "../hooks/usePageMetadata"

function ReviewPage() {
  const { slug } =
    useParams<{
      slug: string
    }>()

  const [review, setReview] =
    useState<FullReview | null>(
      null,
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(
      null,
    )

  const preparedBody =
    useMemo(
      () =>
        prepareReviewHtml(
          review?.body ?? "",
          review?.heroImageUrl ??
            null,
        ),
      [
        review?.body,
        review?.heroImageUrl,
      ],
    )

  usePageMetadata({
    title: review
      ? `${review.model} review by ${review.reviewer} | ITGE`
      : "Review | ITGE",

    description: review
      ? `${review.brand} ${review.model} review by ${review.reviewer}. ${review.summary}`
      : "Independent gear reviews from ITGE.",
  })

  useEffect(() => {
    let cancelled = false

    async function loadReview() {
      if (!slug) {
        setError(
          "No review was specified.",
        )
        setLoading(false)
        return
      }

      try {
        const result =
          await getReviewBySlug(
            slug,
          )

        if (!cancelled) {
          setReview(result)
        }
      } catch (loadError) {
        console.error(
          "Could not load review:",
          loadError,
        )

        if (!cancelled) {
          setError(
            "The review could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadReview()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <PageState
        eyebrow="Review"
        title="Loading review…"
      />
    )
  }

  if (error) {
    return (
      <PageState
        eyebrow="Review"
        title="Unable to load review"
        message={error}
        backTo="/reviews"
        backLabel="Back to reviews"
      />
    )
  }

  if (!review) {
    return (
      <PageState
        eyebrow="404"
        title="Review not found"
        message="The review you were looking for doesn’t exist or is no longer available."
        backTo="/reviews"
        backLabel="Back to reviews"
      />
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <article className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            {
              label: "Reviews",
              to: "/reviews",
            },
            {
              label:
                review.model,
              to: `/gear/${review.productSlug}`,
            },
            {
              label: `${review.reviewer} review`,
            },
          ]}
        />

        <header className="border-b border-[var(--border)] pb-12">
          <Link
            to={`/brands/${review.brandSlug}`}
            className="inline-block text-sm uppercase tracking-[0.2em] text-[var(--accent)] transition hover:opacity-70"
          >
            {review.brand}
          </Link>

          <div className="mt-4 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                <Link
                  to={`/gear/${review.productSlug}`}
                  className="transition hover:text-[var(--accent)]"
                >
                  {
                    review.model
                  }
                </Link>
              </h1>

              {(review.driverConfiguration ||
                review.releaseYear !=
                  null ||
                review.launchPrice !=
                  null) && (
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--muted)]">
                  {review.driverConfiguration && (
                    <span>
                      {
                        review.driverConfiguration
                      }
                    </span>
                  )}

                  {review.driverConfiguration &&
                    review.releaseYear !=
                      null && (
                      <span aria-hidden="true">
                        ·
                      </span>
                    )}

                  {review.releaseYear !=
                    null && (
                    <span>
                      Released{" "}
                      {
                        review.releaseYear
                      }
                    </span>
                  )}

                  {(review.driverConfiguration ||
                    review.releaseYear !=
                      null) &&
                    review.launchPrice !=
                      null && (
                      <span aria-hidden="true">
                        ·
                      </span>
                    )}

                  {review.launchPrice !=
                    null && (
                    <span>
                      Launch price{" "}
                      {formatLaunchPrice(
                        review.launchPrice,
                        review.launchCurrency,
                      )}
                    </span>
                  )}
                </div>
              )}

              <Link
                to={`/members/${review.reviewerSlug}`}
                className="mt-5 inline-flex items-center gap-3 rounded-xl transition hover:opacity-80"
              >
                <ReviewerAvatar
                  name={
                    review.reviewer
                  }
                  slug={
                    review.reviewerSlug
                  }
                  size="sm"
                  shape="circle"
                  eager
                />

                <span className="text-[var(--muted)]">
                  Reviewed by{" "}
                  <span className="font-semibold text-[var(--accent)]">
                    {
                      review.reviewer
                    }
                  </span>
                </span>
              </Link>

              {review.artists
                .length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    Artists
                    mentioned
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.artists.map(
                      (
                        artist,
                      ) => (
                        <Link
                          key={
                            artist.musicbrainzId
                          }
                          to={`/artists/${encodeURIComponent(
                            artist.slug,
                          )}`}
                          className="rounded-full border border-[var(--accent)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-semibold transition hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                        >
                          {
                            artist.name
                          }
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              )}

              {review.genres
                .length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    Genres covered
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.genres.map(
                      (
                        genre,
                      ) => (
                        <Link
                          key={
                            genre.id
                          }
                          to={`/genres/${encodeURIComponent(
                            genre.slug,
                          )}`}
                          className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          {
                            genre.name
                          }
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-fit shrink-0 rounded-full border border-[var(--border)] px-4 py-2 text-lg font-semibold">
              {review.rating.toFixed(
                1,
              )}{" "}
              <span className="text-[var(--accent)]">
                ★
              </span>
            </div>
          </div>

          <p className="mt-8 max-w-3xl text-xl leading-9 text-[var(--muted)]">
            {review.summary}
          </p>

          {(review.pros ||
            review.cons) && (
            <section className="grid gap-6 py-8 md:grid-cols-2">
              {review.pros && (
                <div className="rounded-3xl border border-[var(--accent)]/35 bg-[var(--accent)]/[0.06] p-7">
                  <h2 className="flex items-center gap-3 text-lg font-semibold">
                    <span className="text-xl leading-none text-[var(--accent)]">
                      +
                    </span>
                    Pros
                  </h2>

                  <p className="mt-4 whitespace-pre-line leading-7">
                    {
                      review.pros
                    }
                  </p>
                </div>
              )}

              {review.cons && (
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-7">
                  <h2 className="flex items-center gap-3 text-lg font-semibold">
                    <span className="text-xl leading-none text-[var(--muted)]">
                      −
                    </span>
                    Cons
                  </h2>

                  <p className="mt-4 whitespace-pre-line leading-7">
                    {
                      review.cons
                    }
                  </p>
                </div>
              )}
            </section>
          )}
        </header>

        {review.heroImageUrl && (
          <figure className="mt-10 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <img
              src={
                review.heroImageUrl
              }
              alt={`${review.brand} ${review.model}`}
              className="aspect-[16/9] w-full object-cover"
            />
          </figure>
        )}

        <section className="mx-auto max-w-4xl py-12">
          {review.body ? (
            <div
              className="review-content"
              dangerouslySetInnerHTML={{
                __html:
                  preparedBody,
              }}
            />
          ) : (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
              The full review
              has not been added
              yet.
            </div>
          )}
        </section>

        <section className="border-t border-[var(--border)] py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Continue exploring
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              to="/reviews"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 transition hover:border-[var(--accent)]"
            >
              <span>
                <span className="block text-sm text-[var(--muted)]">
                  Back to
                </span>

                <span className="mt-1 block font-semibold transition group-hover:text-[var(--accent)]">
                  All reviews
                </span>
              </span>

              <ArrowLeftIcon />
            </Link>

            <Link
              to={`/gear/${review.productSlug}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 transition hover:border-[var(--accent)]"
            >
              <span>
                <span className="block text-sm text-[var(--muted)]">
                  More coverage
                </span>

                <span className="mt-1 block font-semibold transition group-hover:text-[var(--accent)]">
                  {
                    review.model
                  }
                </span>
              </span>

              <ArrowRightIcon />
            </Link>
          </div>
        </section>
      </article>
    </main>
  )
}

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-[var(--accent)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-[var(--accent)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function formatLaunchPrice(
  price: number,
  currency: string | null,
): string {
  if (!currency) {
    return price.toLocaleString(
      "en-US",
    )
  }

  try {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency,
        maximumFractionDigits:
          Number.isInteger(
            price,
          )
            ? 0
            : 2,
      },
    ).format(price)
  } catch {
    return `${price.toLocaleString(
      "en-US",
    )} ${currency}`
  }
}

function prepareReviewHtml(
  html: string,
  heroImageUrl:
    | string
    | null,
) {
  const document =
    new DOMParser().parseFromString(
      html,
      "text/html",
    )

  if (heroImageUrl) {
    const firstImage =
      document.querySelector<HTMLImageElement>(
        "img",
      )

    const firstImageUrl =
      firstImage?.getAttribute(
        "src",
      ) ?? null

    if (
      firstImage &&
      firstImageUrl ===
        heroImageUrl
    ) {
      removeImageWrapper(
        firstImage,
      )
    }
  }

  document
    .querySelectorAll(
      ".bbCodeSpoiler",
    )
    .forEach((spoiler) => {
      const title =
        spoiler
          .querySelector(
            ".bbCodeSpoiler-button-title",
          )
          ?.textContent?.trim() ||
        "Spoiler"

      const content =
        spoiler.querySelector(
          ".bbCodeSpoiler-content",
        )?.innerHTML || ""

      const details =
        document.createElement(
          "details",
        )

      details.className =
        "review-spoiler"

      const summary =
        document.createElement(
          "summary",
        )

      summary.textContent =
        title

      const contentWrapper =
        document.createElement(
          "div",
        )

      contentWrapper.className =
        "review-spoiler-content"

      contentWrapper.innerHTML =
        content

      details.append(
        summary,
        contentWrapper,
      )

      spoiler.replaceWith(
        details,
      )
    })

  return document.body
    .innerHTML
}

function removeImageWrapper(
  image: HTMLImageElement,
) {
  const link =
    image.closest("a")

  if (
    link &&
    link.childElementCount ===
      1
  ) {
    const parent =
      link.parentElement

    link.remove()

    removeEmptyWrapper(
      parent,
    )

    return
  }

  const parent =
    image.parentElement

  image.remove()

  removeEmptyWrapper(
    parent,
  )
}

function removeEmptyWrapper(
  element: HTMLElement | null,
) {
  if (!element) {
    return
  }

  const hasText =
    Boolean(
      element.textContent?.trim(),
    )

  const hasContent =
    Boolean(
      element.querySelector(
        "img, video, iframe, table, ul, ol, blockquote",
      ),
    )

  if (
    !hasText &&
    !hasContent
  ) {
    element.remove()
  }
}

export default ReviewPage