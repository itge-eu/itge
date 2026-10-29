import {
  useEffect,
  useState,
} from "react"

import {
  Link,
} from "react-router"

import {
  getLatestReviews,
} from "../lib/reviews"

import {
  getLatestImpressions,
} from "../lib/impressions"

import LatestCoverageCarousel, {
  buildLatestCoverageItems,
  type LatestCoverageItem,
} from "../components/home/LatestCoverageCarousel"

type HalloweenGalleryItem = {
  image: string
  title: string
  credit: string
  href: string
  featured?: boolean
}

// Add/remove Halloween photos here. Files live in public/halloween/gallery/.
const halloweenGallery: HalloweenGalleryItem[] = [
  {
    image: "/halloween/gallery/cinisi-brice-kimmel-lily-of-the-valley.jpeg",
    title: "Bryce&Kimmel Lily of the Valley",
    credit: "cinisi",
    href: "/members/cinisi",
    featured: true,
  },
  {
    image: "/halloween/gallery/faxepremium-io-volare.jpeg",
    title: "I/O Volare",
    credit: "Faxepremium",
    href: "/members/faxepremium",
  },
  {
    image: "/halloween/gallery/mr-martin-melody-wings-neptune.jpeg",
    title: "Melody Wings Neptune",
    credit: "Mr Martin",
    href: "/members/mr-martin",
  },
  {
    image: "/halloween/gallery/mr-martin-penon-archangel.jpeg",
    title: "Penon Archangel",
    credit: "Mr Martin",
    href: "/members/mr-martin",
  },
  {
    image: "/halloween/gallery/pseudonym031-letshuoer-ej10.jpeg",
    title: "Letshuoer EJ10",
    credit: "Pseudonym031",
    href: "/members/pseudonym031",
  },
  {
    image: "/halloween/gallery/raymondvanmil-tangzu-dont-waneer.jpeg",
    title: "Tanzu Wan'Er",
    credit: "RaymondVanMil",
    href: "/members/raymondvanmil",
  },
  {
    image: "/halloween/gallery/rinderkappajoe-letshuoer-cadenza-12.jpeg",
    title: "Letshuoer Cadenza 12",
    credit: "rinderkappajoe",
    href: "/members/rinderkappajoe",
  },
  {
    image: "/halloween/gallery/themattyb-letshuoer-sonata.jpeg",
    title: "Letshuoer Sonata",
    credit: "themattyb",
    href: "/members/themattyb",
  },
  {
    image: "/halloween/gallery/themattyb-txn-diamond.jpeg",
    title: "TXN Diamond",
    credit: "themattyb",
    href: "/members/themattyb",
  },
  {
    image: "/halloween/gallery/vic29-spiral-ear-se3-nebula.jpeg",
    title: "Spiral Ear SE3 Nebula",
    credit: "Vic29",
    href: "/members/vic29",
  },
  {
    image: "/halloween/gallery/xsoundscapex-fatfreq-grand-maestro.jpg",
    title: "FatFreq Grand Maestro",
    credit: "ToobinTobes",
    href: "/members/toobintobes",
  },
  {
    image: "/halloween/gallery/pseudonym031-final-a10000.jpg",
    title: "Final Audio A10000",
    credit: "Pseudonym031",
    href: "/members/pseudonym031",
  }
]

function HalloweenHomePage() {
  const [
    shuffledGallery,
  ] = useState(() =>
    shuffleGallery(
      halloweenGallery,
    ),
  )

  const [
    latestCoverage,
    setLatestCoverage,
  ] =
    useState<
      LatestCoverageItem[]
    >([])

  const [
    coverageLoading,
    setCoverageLoading,
  ] =
    useState(true)

  const [
    coverageError,
    setCoverageError,
  ] =
    useState<
      string | null
    >(null)

  useEffect(() => {
    let cancelled = false

    async function loadLatestCoverage() {
      setCoverageLoading(true)
      setCoverageError(null)

      try {
        const [latestReviews, latestImpressions] =
          await Promise.all([
            getLatestReviews(20),
            getLatestImpressions(20),
          ])

        if (cancelled) return

        setLatestCoverage(
          buildLatestCoverageItems(
            latestReviews,
            latestImpressions,
          ),
        )
      } catch (error) {
        console.error(
          "Could not load latest Halloween coverage:",
          error,
        )

        if (!cancelled) {
          setCoverageError(
            "The latest ITGE content could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) {
          setCoverageLoading(false)
        }
      }
    }

    void loadLatestCoverage()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main>
        <section className="relative overflow-hidden border-b border-[var(--border)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,101,0,0.18),transparent_34%),radial-gradient(circle_at_10%_80%,rgba(255,101,0,0.08),transparent_28%),radial-gradient(circle_at_90%_75%,rgba(255,101,0,0.08),transparent_28%)]" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pb-16 pt-12 text-center lg:px-8 lg:pb-20 lg:pt-16">
            <img
              src={`${import.meta.env.BASE_URL}halloween/logo-full.png`}
              alt="IEM Tour Group Europe Halloween"
              className="w-full max-w-[310px] drop-shadow-[0_0_28px_rgba(255,101,0,0.18)] sm:max-w-[390px]"
            />

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
              Halloween at ITGE
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Something wicked this way comes.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Independent reviews. Questionable lighting. Excellent taste in audio.
            </p>
          </div>
        </section>

        <section className="relative py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                  Trick or treat?
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  The haunted gallery
                </h2>
                <p className="mt-4 max-w-2xl text-[var(--muted)]">
                  A Halloween selection from the ITGE community. Pick a creature to explore the gear behind the photo.
                </p>
              </div>

              <Link
                to="/gear"
                className="shrink-0 text-sm font-medium text-[var(--accent)] transition hover:opacity-75"
              >
                Browse all gear →
              </Link>
            </div>

            <div className="mt-10 grid auto-rows-[190px] grid-cols-1 gap-4 sm:grid-cols-2 sm:auto-rows-[220px] lg:grid-cols-3 lg:auto-rows-[240px]">
              {shuffledGallery.map((item, index) => {
                const large =
                  item.featured || index % 7 === 0

                return (
                  <HalloweenGalleryCard
                    key={`${item.image}-${item.href}`}
                    item={item}
                    large={large}
                  />
                )
              })}
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-t border-[var(--border)] bg-[var(--surface-soft)] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                  Fresh from the crypt
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Latest coverage
                </h2>
                <p className="mt-4 max-w-2xl text-[var(--muted)]">
                  The newest reviews and listening impressions from ITGE members across Europe.
                </p>
              </div>

              <Link
                to="/reviews"
                className="mb-[1px] shrink-0 text-sm font-medium text-[var(--accent)] transition hover:opacity-75"
              >
                Browse all →
              </Link>
            </div>
          </div>

          {!coverageLoading &&
            !coverageError &&
            latestCoverage.length > 0 && (
              <div className="mt-10">
                <LatestCoverageCarousel
                  items={latestCoverage}
                />
              </div>
            )}

          {coverageLoading && (
            <div className="mx-auto mt-10 max-w-7xl px-6 lg:px-8">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                Raising the latest coverage from the dead…
              </div>
            </div>
          )}

          {coverageError && (
            <div className="mx-auto mt-10 max-w-7xl px-6 lg:px-8">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
                {coverageError}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function shuffleGallery<T>(
  items: T[],
): T[] {
  const shuffled = [
    ...items,
  ]

  for (
    let index =
      shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex =
      Math.floor(
        Math.random() *
          (index + 1),
      )

    const current =
      shuffled[index]

    shuffled[index] =
      shuffled[randomIndex]

    shuffled[randomIndex] =
      current
  }

  return shuffled
}

function HalloweenGalleryCard({
  item,
  large,
}: {
  item: HalloweenGalleryItem
  large: boolean
}) {
  return (
    <Link
      to={item.href}
      className={`group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition duration-500 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_0_32px_rgba(255,101,0,0.16)] ${
        large
          ? "sm:col-span-2 sm:row-span-2"
          : ""
      }`}
    >
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/15 to-transparent opacity-90 transition group-hover:opacity-100" />

      <div className="relative flex h-full flex-col justify-end p-5 text-white sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff8a3d] sm:text-xs">
          Photo by {item.credit}
        </p>
        <h3 className={`${large ? "text-2xl sm:text-3xl" : "text-xl"} mt-1 font-semibold leading-tight`}>
          {item.title}
        </h3>
      </div>
    </Link>
  )
}

export default HalloweenHomePage
