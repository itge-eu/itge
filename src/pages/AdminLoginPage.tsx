import {
  useEffect,
  useState,
} from "react"

import type {
  FormEvent,
} from "react"

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router"

import {
  supabase,
} from "../lib/supabase"

type LocationState = {
  from?: string
}

function AdminLoginPage() {
  const navigate =
    useNavigate()

  const location =
    useLocation()

  const [
    email,
    setEmail,
  ] =
    useState("")

  const [
    password,
    setPassword,
  ] =
    useState("")

  const [
    checking,
    setChecking,
  ] =
    useState(true)

  const [
    alreadyAdmin,
    setAlreadyAdmin,
  ] =
    useState(false)

  const [
    loggingIn,
    setLoggingIn,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  useEffect(() => {
    let active = true

    async function checkSession() {
      const {
        data,
      } =
        await supabase.auth.getUser()

      if (!active) {
        return
      }

      const user =
        data.user

      setAlreadyAdmin(
        user?.app_metadata
          ?.role ===
          "admin",
      )

      setChecking(false)
    }

    void checkSession()

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setLoggingIn(true)
    setError(null)

    const {
      data,
      error:
        signInError,
    } =
      await supabase.auth
        .signInWithPassword({
          email:
            email.trim(),

          password,
        })

    if (signInError) {
      setError(
        signInError.message,
      )

      setLoggingIn(false)
      return
    }

    const user =
      data.user

    if (
      user.app_metadata
        ?.role !==
      "admin"
    ) {
      await supabase.auth.signOut()

      setError(
        "This account does not have ITGE admin access.",
      )

      setLoggingIn(false)
      return
    }

    const state =
      location.state as
        | LocationState
        | null

    navigate(
      state?.from ||
        "/admin",
      {
        replace: true,
      },
    )
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
        <div className="mx-auto max-w-md">
          <p className="text-[var(--muted)]">
            Checking session…
          </p>
        </div>
      </main>
    )
  }

  if (alreadyAdmin) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-md">
        <Link
          to="/"
          className="text-sm font-medium text-[var(--accent)]"
        >
          ← Back to ITGE
        </Link>

        <section className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            ITGE Admin
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Sign in
          </h1>

          <p className="mt-4 leading-7 text-[var(--muted)]">
            Sign in with an
            authorised ITGE
            admin account.
          </p>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8"
          >
            <label
              htmlFor="admin-email"
              className="block text-sm font-semibold"
            >
              Email
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target
                    .value,
                )
              }
              autoComplete="email"
              required
              className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />

            <label
              htmlFor="admin-password"
              className="mt-6 block text-sm font-semibold"
            >
              Password
            </label>

            <input
              id="admin-password"
              type="password"
              value={
                password
              }
              onChange={(
                event,
              ) =>
                setPassword(
                  event.target
                    .value,
                )
              }
              autoComplete="current-password"
              required
              className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                loggingIn
              }
              className="mt-6 w-full rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingIn
                ? "Signing in…"
                : "Sign in"}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default AdminLoginPage