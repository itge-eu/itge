import { Link } from "react-router-dom"

import usePageMetadata from "../hooks/usePageMetadata"
import PageContainer from "../components/layout/PageContainer"

function AboutPage() {
  usePageMetadata({
    title:
      "About ITGE | IEM Tour Group Europe",

    description:
      "Learn more about IEM Tour Group Europe, how our audio tours work, and the principles behind ITGE reviews and listening impressions.",
  })

  return (
    <main className="min-h-screen bg-[var(--background)] py-16 text-[var(--foreground)]">
      <PageContainer>
        {/* PAGE HEADER */}
        <header className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            About ITGE
          </p>

          <div className="mt-8 max-w-[240px]">
            <img
              src={`${import.meta.env.BASE_URL}branding/logo-primary-light.svg`}
              alt="IEM Tour Group Europe"
              className="h-auto w-full dark:hidden"
            />

            <img
              src={`${import.meta.env.BASE_URL}branding/logo-primary-dark.svg`}
              alt="IEM Tour Group Europe"
              className="hidden h-auto w-full dark:block"
            />
          </div>

          <h1 className="mt-7 text-xl font-semibold tracking-tight text-[var(--accent)] sm:text-2xl">
            Connecting Europe with the world of personal audio
          </h1>

          <div className="mt-4 space-y-5 text-base leading-8 text-[var(--muted)]">
            <p>
              IEM Tour Group Europe is an independent,
              community-run collective connecting European
              enthusiasts and reviewers with manufacturers and
              retailers worldwide.
            </p>

            <p>
              Our main focus is IEMs, though we also arrange tours
              for selected products from the wider personal audio
              field.
            </p>
          </div>
        </header>

        {/* BETTER ACCESS */}
        <section className="mt-10 max-w-4xl">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--accent)] sm:text-2xl">
            Better access, wider reach
          </h2>

          <div className="mt-4 space-y-5 text-base leading-8 text-[var(--muted)]">
            <p>
              Many specialist audio products are difficult to
              audition across Europe. Our tours place them with
              engaged listeners who share reviews, impressions and
              conversations with the wider community.
            </p>

            <p>
              Members gain access to products they may not otherwise
              experience. Partners reach a knowledgeable and highly
              relevant European audience in a direct, organic way.
            </p>
          </div>
        </section>

        {/* COMMUNITY */}
        <section className="mt-10 max-w-4xl">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--accent)] sm:text-2xl">
            Built around the community
          </h2>

          <div className="mt-4 space-y-5 text-base leading-8 text-[var(--muted)]">
            <p>
              Our group brings together dedicated enthusiasts,
              experienced reviewers and some of Europe&apos;s most
              established voices in the audio scene.
            </p>

            <p>
              We work with many of the world&apos;s most respected
              personal audio manufacturers and retailers. These
              relationships have developed into repeat collaborations
              or ongoing partnerships.
            </p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-20 border-t border-[var(--border)] pt-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              One piece of gear, multiple perspectives
            </h2>

            <p className="mt-5 leading-7 text-[var(--muted)]">
              Instead of sending a product to a single person, a
              tour lets several ITGE members spend time with the
              same gear before passing it on to the next listener.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <StepCard
              number="01"
              title="Gear enters a tour"
              text="A piece of audio gear is made available to ITGE and a tour is organised among participating members."
            />

            <StepCard
              number="02"
              title="Members listen"
              text="Each participant gets time to use the gear with their own music, equipment and listening preferences."
            />

            <StepCard
              number="03"
              title="Experiences are shared"
              text="Members publish reviews or listening impressions, which are collected and connected here on the ITGE site."
            />
          </div>
        </section>

        {/* INDEPENDENCE */}
        <section className="mt-20 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Independent by design
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Access to gear does not buy an opinion
            </h2>

            <p className="mt-5 leading-7 text-[var(--muted)]">
              Brands can make gear available for ITGE tours, but
              participation does not guarantee positive coverage.
              Members remain free to describe their own experience,
              including criticism where they feel it is warranted.
            </p>

            <p className="mt-4 leading-7 text-[var(--muted)]">
              The value of a tour comes from hearing different
              perspectives from different listeners, not from
              producing a predetermined conclusion.
            </p>
          </div>
        </section>

        {/* TAKE PART */}
        <section className="mt-16 border-t border-[var(--border)] pt-12">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--accent)] sm:text-2xl">
            Take part
          </h2>

          <div className="mt-4 space-y-5 text-base leading-8 text-[var(--muted)]">
            <p>
              Whether you create, sell, review or simply enjoy
              personal audio, IEM Tour Group Europe is a place to
              connect, share experiences and discover something new.
            </p>

            <p>
              Our purpose is simple: make great audio more accessible
              and help the community grow across Europe and beyond
              together.
            </p>
          </div>
        </section>

        {/* CTAS */}
        <section className="mt-10 grid items-stretch gap-6 md:grid-cols-2">
          <CallToAction
            eyebrow="For listeners"
            title="Want to join ITGE?"
            text="Interested in taking part in future tours and sharing your own listening experiences?"
            linkLabel="Join ITGE"
            to="/join"
          />

          <CallToAction
            eyebrow="For brands"
            title="Let ITGE tour your gear"
            text="Have audio gear you'd like to put in front of multiple European listeners and reviewers?"
            linkLabel="For brands"
            to="/for-brands"
          />
        </section>
      </PageContainer>
    </main>
  )
}

function StepCard({
  number,
  title,
  text,
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7">
      <p className="text-sm font-semibold text-[var(--accent)]">
        {number}
      </p>

      <h3 className="mt-4 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {text}
      </p>
    </article>
  )
}

function CallToAction({
  eyebrow,
  title,
  text,
  linkLabel,
  to,
}: {
  eyebrow: string
  title: string
  text: string
  linkLabel: string
  to: string
}) {
  return (
    <Link
      to={to}
      className="group flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        {eyebrow}
      </p>

      <h2 className="mt-4 text-3xl font-semibold tracking-tight">
        {title}
      </h2>

      <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
        {text}
      </p>

      <span className="mt-auto inline-flex items-center pt-8 text-sm font-semibold text-[var(--accent)] transition group-hover:translate-x-0.5">
        {linkLabel} →
      </span>
    </Link>
  )
}

export default AboutPage