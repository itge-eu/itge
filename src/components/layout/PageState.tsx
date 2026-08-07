import { Link } from "react-router"

type PageStateProps = {
  eyebrow?: string
  title: string
  message?: string
  backTo?: string
  backLabel?: string
}

function PageState({
  eyebrow,
  title,
  message,
  backTo,
  backLabel,
}: PageStateProps) {
  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {eyebrow}
          </p>
        )}

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {title}
        </h1>

        {message && (
          <p className="mt-4 max-w-2xl text-[var(--muted)]">
            {message}
          </p>
        )}

        {backTo && backLabel && (
          <Link
            to={backTo}
            className="mt-8 inline-block font-medium text-[var(--accent)] transition hover:opacity-75"
          >
            ← {backLabel}
          </Link>
        )}
      </div>
    </main>
  )
}

export default PageState