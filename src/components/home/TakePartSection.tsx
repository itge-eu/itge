import { Link } from "react-router"

function TakePartSection() {
  return (
    <section
      id="join"
      className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-20 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Take part
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Be part of ITGE.
          </h2>

          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Whether you want to join our community of
            listeners or put your IEMs into the hands of
            reviewers across Europe, there is a place for
            you in ITGE.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="group flex min-h-64 flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              For listeners
            </p>

            <h3 className="mt-4 text-3xl font-semibold tracking-tight">
              Join the community
            </h3>

            <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
              Take part in European IEM tours, meet other
              enthusiasts and share what you hear through
              reviews and listening impressions.
            </p>

            <Link
              to="/join"
              className="mt-auto inline-flex items-center pt-8 text-sm font-semibold text-[var(--accent)] transition group-hover:translate-x-0.5"
            >
              Join ITGE →
            </Link>
          </article>

          <article className="group flex min-h-64 flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              For brands
            </p>

            <h3 className="mt-4 text-3xl font-semibold tracking-tight">
              Send an IEM on tour
            </h3>

            <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
              Put your IEM into the hands of experienced
              listeners across Europe through an organised
              ITGE tour with independent coverage.
            </p>

            <Link
              to="/for-brands"
              className="mt-auto inline-flex items-center pt-8 text-sm font-semibold text-[var(--accent)] transition group-hover:translate-x-0.5"
            >
              Work with ITGE →
            </Link>
          </article>
        </div>
      </div>
    </section>
  )
}

export default TakePartSection