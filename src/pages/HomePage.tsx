import { useEffect, useState } from "react"
import { Link } from "react-router"
import {
  getFeaturedReviews,
  type FeaturedReview,
} from "../lib/reviews"

function HomePage() {
  const [featuredReviews, setFeaturedReviews] = useState<FeaturedReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  
  useEffect(() => {
    async function loadFeaturedReviews() {
      setReviewsLoading(true)
      setReviewsError(null)
  
      try {
        const reviews = await getFeaturedReviews()
        setFeaturedReviews(reviews)
      } catch (error) {
        console.error("Could not load featured reviews:", error)
        setReviewsError("The featured reviews could not be loaded.")
      } finally {
        setReviewsLoading(false)
      }
    }
  
    loadFeaturedReviews()
  }, [])

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
	
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(22,199,132,0.11),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(44,219,152,0.10),transparent_38%)]" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-32">
            <div className="max-w-3xl">
              <p className="mb-6 text-sm font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
                Reviews built around real listening
              </p>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Find the IEM that fits your music.
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                Independent reviews from experienced listeners, enriched with
                artists, genres and sonic profiles so you can search by what
                actually matters to you.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#reviews"
                  className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
                >
                  Explore reviews
                </a>

                <a
                  href="#reviewers"
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:bg-[var(--surface-soft)]"
                >
                  Meet the reviewers
                </a>
              </div>
            </div>

            <div className="self-end rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-xl shadow-black/5 dark:shadow-black/30">
              <div className="text-sm text-[var(--muted)]">Search by</div>

              <div className="mt-5 flex flex-wrap gap-3">
                {[
                  "Radiohead",
                  "Electronic",
                  "Warm",
                  "Wide stage",
                  "Female vocals",
                  "Reviewer",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm text-[var(--muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Example
                </div>

                <p className="mt-3 leading-7">
                  Show me musical IEMs reviewed with Radiohead and Massive
                  Attack.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="reviews"
          className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-20 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                  Latest listening notes
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Featured reviews
                </h2>
              </div>

              <Link
                to="/reviews"
                className="text-sm font-medium text-[var(--accent)] transition hover:opacity-75"
              >
                View all reviews →
              </Link>
            </div>

{reviewsLoading && (
  <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
    Loading featured reviews…
  </div>
)}

{reviewsError && (
  <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
    <p className="font-medium">Unable to load reviews</p>
    <p className="mt-2 text-sm text-[var(--muted)]">
      {reviewsError}
    </p>
  </div>
)}

{!reviewsLoading && !reviewsError && featuredReviews.length === 0 && (
  <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
    No featured reviews have been published yet.
  </div>
)}

{!reviewsLoading && !reviewsError && featuredReviews.length > 0 && (
  <div className="mt-10 grid gap-6 lg:grid-cols-3">
    {featuredReviews.map((review) => (
      <article
        key={review.id}
        className="group flex min-h-80 flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:bg-[var(--surface-soft)] dark:shadow-none"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-sm text-[var(--muted)]">
              {review.brand}
            </div>

            <h3 className="mt-1 text-2xl font-semibold">
              {review.model}
            </h3>
          </div>

          <div className="rounded-full border border-[var(--border)] px-3 py-1 text-sm font-semibold">
            {Number(review.rating).toFixed(1)}/5
          </div>
        </div>

        <p className="mt-6 leading-7 text-[var(--muted)]">
          {review.summary}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-8 text-sm">
          <span className="text-[var(--muted)]">
            Reviewed by {review.reviewer}
          </span>

          <Link
            to={`/reviews/${review.slug}`}
            className="font-medium text-[var(--accent)] transition group-hover:opacity-75"
          >
            Read review →
          </Link>
        </div>
      </article>
    ))}
  </div>
)}
          </div>
        </section>

        <section
          id="join"
          className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-6 py-20 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                Take part
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Join the community or send an IEM on tour.
              </h2>

              <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
                ITGE connects experienced listeners, tour organisers and
                manufacturers through structured European review tours.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="group flex min-h-80 flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] dark:shadow-none">
                <div className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                  For listeners
                </div>

                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Become an ITGE reviewer
                </h3>

                <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
                  Join our European tour community, listen to new and
                  established in-ear monitors, and share thoughtful reviews
                  based on real-world listening.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "European tours",
                    "Independent reviews",
                    "Shared experience",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-xs text-[var(--muted)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <a
                  href="mailto:contact@itge.eu?subject=Joining ITGE"
                  className="mt-auto inline-flex items-center pt-10 text-sm font-semibold text-[var(--accent)] transition group-hover:opacity-75"
                >
                  Contact us to participate →
                </a>
              </article>

              <article className="group flex min-h-80 flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] dark:shadow-none">
                <div className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                  For manufacturers
                </div>

                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Let Europe hear your IEM
                </h3>

                <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
                  Put your product into the hands of experienced reviewers
                  across Europe through an organised tour with independent,
                  long-form listening impressions.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "Multiple reviewers",
                    "European reach",
                    "Structured feedback",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-xs text-[var(--muted)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <a
                  href="mailto:contact@itge.eu?subject=IEM tour proposal"
                  className="mt-auto inline-flex items-center pt-10 text-sm font-semibold text-[var(--accent)] transition group-hover:opacity-75"
                >
                  Let us tour your IEM →
                </a>
              </article>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-20 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                Built differently
              </p>

              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">
                Reviews connected to the music used to evaluate them.
              </h2>
            </div>

            <div className="space-y-5 text-lg leading-8 text-[var(--muted)]">
              <p>
                Most review sites tell you what a product sounds like. ITGE
                also records which artists, genres and sonic qualities informed
                that opinion.
              </p>

              <p>
                That makes it possible to browse reviews through your own
                listening habits rather than relying on a single score or
                ranking.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 IEM Tour Group Europe</span>
          <span>Independent reviews. Shared listening.</span>
        </div>
      </footer>
    </div>
  )
}

export default HomePage