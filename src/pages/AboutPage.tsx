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

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Independent listening,
            built around community.
          </h1>
        </header>

        {/* OUR STORY */}
        <section className="mt-12 max-w-4xl">
          <div className="grid gap-8 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center">
            <div className="max-w-[190px]">
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

            <p className="text-base leading-8 text-[var(--muted)]">
              IEM Tour Group Europe is an independent,
              community-driven collective connecting enthusiasts
              and reviewers across Europe with manufacturers and
              retailers from around the world. Audio gear is at
              the heart of what we do, with tours covering
              products across personal audio.
            </p>
          </div>

          <div className="mt-8 space-y-6 text-base leading-8 text-[var(--muted)]">
            <p>
              We organise tours that give our members the opportunity
              to experience products they may not otherwise be able
              to audition. They then share their experiences through
              reviews, listening impressions and conversations that
              help others discover new products and make more
              informed choices.
            </p>

            <p>
              Our aim is to make the field more accessible and keep
              the European personal audio community active, curious
              and connected. We believe the best conversations
              happen when brands, retailers and listeners come
              together through a shared interest in great audio and
              a shared respect for different perspectives.
            </p>

            <p>
              For our partners, the tours offer a direct and natural
              way to introduce their work to knowledgeable, engaged
              listeners across Europe. For our members, they provide
              access to interesting products, new experiences and a
              community of people who truly care about the hobby.
            </p>

            <p>
              Today our group includes dedicated enthusiasts and some
              of the most established voices in the European audio
              community. We are also proud to work with many of the
              field&apos;s most respected manufacturers and retailers
              worldwide.
            </p>

            <p>
              Whether you create personal audio products, sell them,
              write about them or simply enjoy discovering new ways
              to listen, IEM Tour Group Europe is a place to connect,
              exchange ideas and take part.
            </p>

            <p>
              We are here to share our enthusiasm, make exceptional
              audio easier to experience and help the hobby grow
              across Europe and beyond.
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

        {/* CTAS */}
        <section className="mt-20 grid gap-6 md:grid-cols-2">
          <CallToAction
            eyebrow="For listeners"
            title="Want to join ITGE?"
            text="Interested in taking part in future tours and sharing your own listening experiences?"
            buttonLabel="Join ITGE"
            to="/join"
          />

          <CallToAction
            eyebrow="For brands"
            title="Let ITGE tour your gear"
            text="Have audio gear you'd like to put in front of multiple European listeners and reviewers?"
            buttonLabel="For brands"
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
  buttonLabel,
  to,
}: {
  eyebrow: string
  title: string
  text: string
  buttonLabel: string
  to: string
}) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-2xl font-semibold tracking-tight">
        {title}
      </h2>

      <p className="mt-3 leading-7 text-[var(--muted)]">
        {text}
      </p>

      <Link
        to={to}
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[var(--accent)] px-5 py-3 font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
      >
        {buttonLabel}
      </Link>
    </div>
  )
}

export default AboutPage