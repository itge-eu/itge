import { Link } from "react-router"

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1.4fr_0.6fr]">
          <div>
            <Link
              to="/"
              aria-label="IEM Tour Group Europe homepage"
              className="inline-flex"
            >
              <img
                src={`${import.meta.env.BASE_URL}branding/logo-primary-light.svg`}
                alt="IEM Tour Group Europe"
                className="h-28 w-auto dark:hidden"
              />

              <img
                src={`${import.meta.env.BASE_URL}branding/logo-primary-dark.svg`}
                alt="IEM Tour Group Europe"
                className="hidden h-28 w-auto dark:block"
              />
            </Link>

            <p className="mt-6 max-w-xl leading-7 text-[var(--muted)]">
              Independent reviews by enthusiasts, helping listeners find the
              IEM that fits their music.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid content-start gap-4 text-sm"
          >
		    <Link
              to="/discover"
              className="text-[var(--muted)] transition hover:text-[var(--accent)]"
            >
              Discover
            </Link>

            <Link
              to="/reviews"
              className="text-[var(--muted)] transition hover:text-[var(--accent)]"
            >
              Reviews
            </Link>

            <Link
              to="/members"
              className="text-[var(--muted)] transition hover:text-[var(--accent)]"
            >
              Reviewers
            </Link>

            <Link
              to="/join"
              className="text-[var(--muted)] transition hover:text-[var(--accent)]"
            >
              Join
            </Link>

            <Link
              to="/about"
              className="text-[var(--muted)] transition hover:text-[var(--accent)]"
            >
              About
            </Link>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[var(--border)] pt-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 IEM Tour Group Europe</span>

          <span>
            Independent reviews. Opinions belong to the individual reviewers.
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer