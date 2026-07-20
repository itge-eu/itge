import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import ReactMarkdown from "react-markdown"
import {
  getReviewBySlug,
  type FullReview,
} from "../lib/reviews"

function ReviewPage() {
  const { slug } = useParams<{ slug: string }>()

  const [review, setReview] = useState<FullReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReview() {
      if (!slug) {
        setError("No review was specified.")
        setLoading(false)
        return
      }

      try {
        const result = await getReviewBySlug(slug)
        setReview(result)
      } catch (loadError) {
        console.error("Could not load review:", loadError)
        setError("The review could not be loaded.")
      } finally {
        setLoading(false)
      }
    }

    loadReview()
  }, [slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)]">
        <div className="mx-auto max-w-4xl text-[var(--muted)]">
          Loading review…
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)]">
        <div className="mx-auto max-w-4xl">
          <p className="text-xl font-semibold">Unable to load review</p>
          <p className="mt-3 text-[var(--muted)]">{error}</p>
          <Link
            to="/"
            className="mt-8 inline-block text-[var(--accent)]"
          >
            ← Back to homepage
          </Link>
        </div>
      </main>
    )
  }

  if (!review) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)]">
        <div className="mx-auto max-w-4xl">
          <p className="text-xl font-semibold">Review not found</p>
          <Link
            to="/"
            className="mt-8 inline-block text-[var(--accent)]"
          >
            ← Back to homepage
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <article className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="text-sm font-medium text-[var(--accent)]"
        >
          ← Back to homepage
        </Link>

        <header className="mt-12 border-b border-[var(--border)] pb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            {review.brand}
          </p>

          <div className="mt-4 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                {review.model}
              </h1>

              <p className="mt-4 text-[var(--muted)]">
                Reviewed by {review.reviewer}
              </p>
            </div>

            <div className="w-fit rounded-full border border-[var(--border)] px-4 py-2 text-lg font-semibold">
              {review.rating.toFixed(1)}/5
            </div>
          </div>

          <p className="mt-8 max-w-3xl text-xl leading-9 text-[var(--muted)]">
            {review.summary}
          </p>
        </header>
		
		{review.heroImageUrl && (
          <figure className="mt-10 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <img
              src={review.heroImageUrl}
              alt={`${review.brand} ${review.model}`}
              className="aspect-[16/9] w-full object-cover"
            />
          </figure>
        )}

        <section className="py-12">
          {review.body ? (
            <div className="review-content">
			  <ReactMarkdown>{review.body}</ReactMarkdown>
			</div>
          ) : (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
              The full review has not been added yet.
            </div>
          )}
        </section>
      </article>
    </main>
  )
}

export default ReviewPage