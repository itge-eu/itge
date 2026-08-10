import {
  useEffect,
  useState,
} from "react"

import {
  Link,
  useNavigate,
} from "react-router"

import {
  supabase,
} from "../lib/supabase"

function AdminPage() {
  const navigate =
    useNavigate()

  const [
    email,
    setEmail,
  ] =
    useState("")

  const [
    signingOut,
    setSigningOut,
  ] =
    useState(false)

  useEffect(() => {
    let active = true

    async function loadUser() {
      const {
        data,
      } =
        await supabase.auth.getUser()

      if (
        active &&
        data.user
      ) {
        setEmail(
          data.user.email ??
            "",
        )
      }
    }

    void loadUser()

    return () => {
      active = false
    }
  }, [])

  async function handleSignOut() {
    setSigningOut(true)

    const {
      error,
    } =
      await supabase.auth.signOut()

    if (error) {
      console.error(
        "Admin sign out failed:",
        error,
      )

      setSigningOut(false)
      return
    }

    navigate(
      "/admin/login",
      {
        replace: true,
      },
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="text-sm font-medium text-[var(--accent)]"
          >
            ← Back to homepage
          </Link>

          <button
            type="button"
            onClick={() =>
              void handleSignOut()
            }
            disabled={
              signingOut
            }
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signingOut
              ? "Signing out…"
              : "Sign out"}
          </button>
        </div>

        <header className="mt-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            ITGE Admin
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Admin
          </h1>

          {email && (
            <p className="mt-4 text-[var(--muted)]">
              Signed in as{" "}
              {email}
            </p>
          )}
        </header>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">
            Content
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <AdminCard
              title="Reviews"
              description="Manage review drafts, edit published reviews and featured content."
              to="/admin/reviews"
              action="Manage reviews"
            />

            <AdminCard
              title="Impressions"
              description="Manage imported listening impressions and Head-Fi forum posts."
              to="/admin/impressions"
              action="Manage impressions"
            />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">
            Import
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <AdminCard
              title="Import Head-Fi review"
              description="Paste review data created by the ITGE review bookmarklet."
              to="/admin/import"
              action="Import review"
            />

            <AdminCard
              title="Import Head-Fi impression"
              description="Paste forum-post data created by the ITGE impression bookmarklet."
              to="/admin/import-impression"
              action="Import impression"
            />
          </div>
        </section>
      </div>
    </main>
  )
}

function AdminCard({
  title,
  description,
  to,
  action,
}: {
  title: string
  description: string
  to: string
  action: string
}) {
  return (
    <Link
      to={to}
      className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:border-[var(--accent)] sm:p-8"
    >
      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-[var(--muted)]">
        {description}
      </p>

      <span className="mt-6 inline-flex font-semibold text-[var(--accent)]">
        {action}
        <span className="ml-2 transition-transform group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  )
}

export default AdminPage