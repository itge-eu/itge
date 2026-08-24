import { useEffect, useState } from "react"
import {
  Link,
  useLocation,
} from "react-router-dom"

type Theme = "light" | "dark"

function getInitialTheme(): Theme {
  const savedTheme =
    localStorage.getItem("itge-theme")

  if (
    savedTheme === "light" ||
    savedTheme === "dark"
  ) {
    return savedTheme
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light"
}

function Navbar() {
  const [theme, setTheme] =
    useState<Theme>(getInitialTheme)

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false)

  const [
    mobileExploreOpen,
    setMobileExploreOpen,
  ] = useState(false)

  const [
    mobileAboutOpen,
    setMobileAboutOpen,
  ] = useState(false)

  const [
    desktopExploreOpen,
    setDesktopExploreOpen,
  ] = useState(false)

  const [
    desktopAboutOpen,
    setDesktopAboutOpen,
  ] = useState(false)

  const location = useLocation()

  useEffect(() => {
    const root =
      document.documentElement

    const isDark =
      theme === "dark"

    root.classList.toggle(
      "dark",
      isDark,
    )

    localStorage.setItem(
      "itge-theme",
      theme,
    )
  }, [theme])

  useEffect(() => {
    setMobileMenuOpen(false)
    setMobileExploreOpen(false)
    setMobileAboutOpen(false)
    setDesktopExploreOpen(false)
    setDesktopAboutOpen(false)
  }, [
    location.pathname,
    location.hash,
  ])

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key !== "Escape") {
        return
      }

      setMobileMenuOpen(false)
      setMobileExploreOpen(false)
      setMobileAboutOpen(false)
      setDesktopExploreOpen(false)
      setDesktopAboutOpen(false)
    }

    window.addEventListener(
      "keydown",
      handleEscape,
    )

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape,
      )
    }
  }, [])

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark"
        ? "light"
        : "dark",
    )
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setMobileExploreOpen(false)
    setMobileAboutOpen(false)
  }

  const closeDesktopMenus = () => {
    setDesktopExploreOpen(false)
    setDesktopAboutOpen(false)
  }

  return (
    <header className="relative z-50 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 lg:px-10">
        <Link
          to="/"
          className="flex shrink-0 items-center"
          aria-label="IEM Tour Group Europe homepage"
          onClick={() => {
            closeMobileMenu()
            closeDesktopMenus()
          }}
        >
          <span className="flex items-center dark:hidden">
            <img
              src={`${import.meta.env.BASE_URL}branding/icon-light.svg`}
              alt=""
              aria-hidden="true"
              className="h-11 w-auto sm:hidden"
            />

            <img
              src={`${import.meta.env.BASE_URL}branding/logo-compact-light.svg`}
              alt="IEM Tour Group Europe"
              className="hidden h-14 w-auto sm:block"
            />
          </span>

          <span className="hidden items-center dark:flex">
            <img
              src={`${import.meta.env.BASE_URL}branding/icon-dark.svg`}
              alt=""
              aria-hidden="true"
              className="h-11 w-auto sm:hidden"
            />

            <img
              src={`${import.meta.env.BASE_URL}branding/logo-compact-dark.svg`}
              alt="IEM Tour Group Europe"
              className="hidden h-14 w-auto sm:block"
            />
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex"
        >
          <Link
            to="/reviews"
            onClick={closeDesktopMenus}
            className="rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
          >
            Reviews
          </Link>

          <Link
            to="/iems"
            onClick={closeDesktopMenus}
            className="transition hover:text-[var(--foreground)]"
          >
            IEM's
          </Link>

          <Link
            to="/brands"
            onClick={closeDesktopMenus}
            className="transition hover:text-[var(--foreground)]"
          >
            Brands
          </Link>

          <div
            className="relative"
            onMouseEnter={() => {
              setDesktopExploreOpen(true)
              setDesktopAboutOpen(false)
            }}
            onMouseLeave={() =>
              setDesktopExploreOpen(false)
            }
          >
            <button
              type="button"
              onClick={() => {
                setDesktopExploreOpen(
                  (current) => !current,
                )
                setDesktopAboutOpen(false)
              }}
              onFocus={() => {
                setDesktopExploreOpen(true)
                setDesktopAboutOpen(false)
              }}
              className="flex items-center gap-1.5 py-3 transition hover:text-[var(--foreground)]"
              aria-haspopup="true"
              aria-expanded={
                desktopExploreOpen
              }
            >
              Explore

              <span
                className={`transition-transform duration-200 ${
                  desktopExploreOpen
                    ? "rotate-180"
                    : ""
                }`}
              >
                <ChevronDownIcon />
              </span>
            </button>

            {desktopExploreOpen && (
              <div className="absolute left-1/2 top-full w-52 -translate-x-1/2 pt-2">
                <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                  <DropdownLink
                    to="/artists"
                    title="Artists"
                    description="Browse listening references"
                    onClick={
                      closeDesktopMenus
                    }
                  />

                  <DropdownLink
                    to="/genres"
                    title="Genres"
                    description="Explore reviews by genre"
                    onClick={
                      closeDesktopMenus
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => {
              setDesktopAboutOpen(true)
              setDesktopExploreOpen(false)
            }}
            onMouseLeave={() =>
              setDesktopAboutOpen(false)
            }
          >
            <button
              type="button"
              onClick={() => {
                setDesktopAboutOpen(
                  (current) => !current,
                )
                setDesktopExploreOpen(false)
              }}
              onFocus={() => {
                setDesktopAboutOpen(true)
                setDesktopExploreOpen(false)
              }}
              className="flex items-center gap-1.5 py-3 transition hover:text-[var(--foreground)]"
              aria-haspopup="true"
              aria-expanded={
                desktopAboutOpen
              }
            >
              About

              <span
                className={`transition-transform duration-200 ${
                  desktopAboutOpen
                    ? "rotate-180"
                    : ""
                }`}
              >
                <ChevronDownIcon />
              </span>
            </button>

            {desktopAboutOpen && (
              <div className="absolute left-1/2 top-full w-60 -translate-x-1/2 pt-2">
                <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                  <DropdownLink
                    to="/#about"
                    title="About us"
                    description="Learn more about ITGE"
                    onClick={
                      closeDesktopMenus
                    }
                  />

                  <DropdownLink
                    to="/reviewers"
                    title="Reviewers"
                    description="Meet the ITGE reviewers"
                    onClick={
                      closeDesktopMenus
                    }
                  />

                  <DropdownLink
                    to="/#join"
                    title="Join ITGE"
                    description="Become part of our tour group"
                    onClick={
                      closeDesktopMenus
                    }
                  />

                  <DropdownLink
                    to="/#join"
                    title="For brands"
                    description="Send an IEM on tour with ITGE"
                    onClick={
                      closeDesktopMenus
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-soft)]"
            aria-label={`Switch to ${
              theme === "dark"
                ? "light"
                : "dark"
            } mode`}
            title={`Switch to ${
              theme === "dark"
                ? "light"
                : "dark"
            } mode`}
          >
            {theme === "dark"
              ? <SunIcon />
              : <MoonIcon />}
          </button>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (current) => !current,
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-soft)] md:hidden"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={
              mobileMenuOpen
            }
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen
              ? <CloseIcon />
              : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-5 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            <Link
              to="/reviews"
              onClick={closeMobileMenu}
              className="rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
            >
              Reviews
            </Link>

            <MobileLink
              to="/iems"
              onClick={closeMobileMenu}
              className="rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
            >
              IEM's
            </MobileLink>

            <MobileLink
              to="/brands"
              onClick={closeMobileMenu}
              className="rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
            >
              Brands
            </MobileLink>

            <div>
              <button
                type="button"
                onClick={() => {
                  setMobileExploreOpen(
                    (current) => !current,
                  )
                  setMobileAboutOpen(false)
                }}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]"
                aria-expanded={
                  mobileExploreOpen
                }
              >
                Explore

                <span
                  className={`transition-transform duration-200 ${
                    mobileExploreOpen
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  <ChevronDownIcon />
                </span>
              </button>

              {mobileExploreOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-[var(--border)] pl-3">
                  <MobileDropdownLink
                    to="/artists"
                    onClick={
                      closeMobileMenu
                    }
                  >
                    Artists
                  </MobileDropdownLink>

                  <MobileDropdownLink
                    to="/genres"
                    onClick={
                      closeMobileMenu
                    }
                  >
                    Genres
                  </MobileDropdownLink>
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setMobileAboutOpen(
                    (current) => !current,
                  )
                  setMobileExploreOpen(false)
                }}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]"
                aria-expanded={
                  mobileAboutOpen
                }
              >
                About

                <span
                  className={`transition-transform duration-200 ${
                    mobileAboutOpen
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  <ChevronDownIcon />
                </span>
              </button>

              {mobileAboutOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-[var(--border)] pl-3">
                  <MobileDropdownLink
                    to="/#about"
                    onClick={
                      closeMobileMenu
                    }
                  >
                    About us
                  </MobileDropdownLink>

                  <MobileDropdownLink
                    to="/reviewers"
                    onClick={
                      closeMobileMenu
                    }
                  >
                    Reviewers
                  </MobileDropdownLink>

                  <MobileDropdownLink
                    to="/#join"
                    onClick={
                      closeMobileMenu
                    }
                  >
                    Join ITGE
                  </MobileDropdownLink>

                  <MobileDropdownLink
                    to="/#join"
                    onClick={
                      closeMobileMenu
                    }
                  >
                    For brands
                  </MobileDropdownLink>
                </div>
              )}
            </div>

          </div>
        </nav>
      )}
    </header>
  )
}

function DropdownLink({
  to,
  title,
  description,
  onClick,
}: {
  to: string
  title: string
  description: string
  onClick?: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-xl px-4 py-3 transition hover:bg-[var(--surface-soft)] focus:bg-[var(--surface-soft)] focus:outline-none"
    >
      <p className="font-semibold text-[var(--foreground)]">
        {title}
      </p>

      <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
        {description}
      </p>
    </Link>
  )
}

function MobileLink({
  to,
  onClick,
  children,
  className = "",
}: {
  to: string
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={
        className ||
        "rounded-xl px-4 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]"
      }
    >
      {children}
    </Link>
  )
}

function MobileDropdownLink({
  to,
  onClick,
  children,
}: {
  to: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
    >
      {children}
    </Link>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.42 1.42" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m4.93 19.07 1.42-1.42" />
      <path d="m17.66 6.34 1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.4 15.6A8.5 8.5 0 0 1 8.4 3.6 8.5 8.5 0 1 0 20.4 15.6Z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  )
}

export default Navbar