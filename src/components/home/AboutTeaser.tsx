import { Link } from "react-router"

function AboutTeaser() {
  return (
    <section
      id="about"
      className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-6 py-20 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            About ITGE
          </p>

          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            A European community built around listening.
          </h2>
        </div>

        <div className="max-w-2xl">
          <p className="text-lg leading-8 text-[var(--muted)]">
            IEM Tour Group Europe brings together audio
            enthusiasts across Europe to share IEMs,
            experiences and independent opinions through
            organised product tours.
          </p>

          <p className="mt-4 leading-7 text-[var(--muted)]">
            Along the way we are building a growing library
            of reviews and listening impressions connected
            to the music people actually use when evaluating
            an IEM.
          </p>

          <Link
            to="/about"
            className="mt-7 inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--accent)]"
          >
            About ITGE →
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AboutTeaser