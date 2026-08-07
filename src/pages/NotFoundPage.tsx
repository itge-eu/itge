import { Link } from "react-router"
import usePageMetadata from "../hooks/usePageMetadata"

function NotFoundPage() {
    usePageMetadata({
      title: "Page not found | ITGE",
      description:
        "The requested page could not be found.",
    })

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          404
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          Page not found
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          The page you were looking for doesn’t exist,
          may have moved, or may no longer be available.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
          >
            Go home
          </Link>

          <Link
            to="/discover"
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:bg-[var(--surface-soft)]"
          >
            Discover IEMs
          </Link>

          <Link
            to="/reviews"
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:bg-[var(--surface-soft)]"
          >
            Browse reviews
          </Link>
        </div>
      </div>
    </main>
  )
}

export default NotFoundPage