import {
  useEffect,
  useState,
} from "react"

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router"

import {
  supabase,
} from "../../lib/supabase"

type AuthState =
  | "loading"
  | "admin"
  | "unauthenticated"
  | "forbidden"

function RequireAdmin() {
  const location =
    useLocation()

  const [
    authState,
    setAuthState,
  ] =
    useState<AuthState>(
      "loading",
    )

  useEffect(() => {
    let active = true

    async function checkAdmin() {
      const {
        data,
        error,
      } =
        await supabase.auth.getUser()

      if (!active) {
        return
      }

      if (
        error ||
        !data.user
      ) {
        setAuthState(
          "unauthenticated",
        )
        return
      }

      const role =
        data.user.app_metadata
          ?.role

      if (role !== "admin") {
        setAuthState(
          "forbidden",
        )
        return
      }

      setAuthState(
        "admin",
      )
    }

    void checkAdmin()

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        () => {
          void checkAdmin()
        },
      )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  if (
    authState ===
    "loading"
  ) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="text-[var(--muted)]">
              Checking admin
              access…
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (
    authState ===
    "unauthenticated"
  ) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    )
  }

  if (
    authState ===
    "forbidden"
  ) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
            <h1 className="text-2xl font-semibold">
              Admin access
              required
            </h1>

            <p className="mt-3 text-[var(--muted)]">
              You are signed
              in, but this
              account does not
              have ITGE admin
              access.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return <Outlet />
}

export default RequireAdmin