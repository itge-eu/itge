import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type Theme = "light" | "dark"

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem("itge-theme")

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function Navbar() {

  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  
  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === "dark"
  
    root.classList.toggle("dark", isDark)
    localStorage.setItem("itge-theme", theme)
  }, [theme])
  
  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    )
  }
  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center"
          aria-label="IEM Tour Group Europe homepage"
        >
          <picture>
            <source
              media="(max-width: 639px)"
              srcSet={`${import.meta.env.BASE_URL}branding/icon-light.svg`}
            />
        
            <img
              src={`${import.meta.env.BASE_URL}branding/logo-compact-light.svg`}
              alt="IEM Tour Group Europe"
              className="h-11 w-auto dark:hidden"
            />
          </picture>
        
          <picture>
            <source
              media="(max-width: 639px)"
              srcSet={`${import.meta.env.BASE_URL}branding/icon-dark.svg`}
            />
        
            <img
              src={`${import.meta.env.BASE_URL}branding/logo-compact-dark.svg`}
              alt="IEM Tour Group Europe"
              className="hidden h-11 w-auto dark:block"
            />
          </picture>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-[var(--muted)] md:flex">
          <Link
            to="reviews"
            className="transition hover:text-[var(--foreground)]"
          >
            Reviews
          </Link>

          <Link
		    to="reviewers"
		    className="transition hover:text-[var(--foreground)]"
		  >
		    Reviewers
		  </Link>

          <Link
		    to="join"
		    className="transition hover:text-[var(--foreground)]"
		  >
		    Join
		  </Link>

          <Link
            to="about"
            className="transition hover:text-[var(--foreground)]"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-soft)]"
            aria-label={`Switch to ${
              theme === "dark" ? "light" : "dark"
            } mode`}
            title={`Switch to ${
              theme === "dark" ? "light" : "dark"
            } mode`}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <Link
            to="/#reviews"
            className="hidden rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] sm:inline-flex"
          >
            Browse reviews
          </Link>
        </div>
      </div>
    </header>
  );
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

export default Navbar;