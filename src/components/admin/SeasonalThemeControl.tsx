import {
  useEffect,
  useState,
} from "react"

import {
  getSeasonalTheme,
  setSeasonalTheme,
  type SeasonalTheme,
} from "../../lib/siteSettings"

function SeasonalThemeControl() {
  const [
    theme,
    setTheme,
  ] =
    useState<SeasonalTheme>("none")

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    saving,
    setSaving,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadTheme() {
      const currentTheme =
        await getSeasonalTheme()

      if (active) {
        setTheme(currentTheme)
        setLoading(false)
      }
    }

    void loadTheme()

    return () => {
      active = false
    }
  }, [])

  async function handleToggle() {
    if (saving) {
      return
    }

    const nextTheme:
      SeasonalTheme =
      theme === "halloween"
        ? "none"
        : "halloween"

    setSaving(true)
    setError(null)

    try {
      await setSeasonalTheme(
        nextTheme,
      )

      setTheme(nextTheme)
    } catch (err) {
      console.error(
        "Failed to update seasonal theme:",
        err,
      )

      setError(
        "Could not update Halloween mode.",
      )
    } finally {
      setSaving(false)
    }
  }

  const enabled =
    theme === "halloween"

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold">
        Site settings
      </h2>

      <div className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold">
              🎃 Halloween mode
            </h3>

            <p className="mt-2 max-w-2xl leading-7 text-[var(--muted)]">
              Enables the Halloween homepage,
              logo and seasonal styling across
              the public ITGE website.
            </p>

            {!loading && (
              <p className="mt-3 text-sm font-semibold text-[var(--accent)]">
                Currently{" "}
                {enabled
                  ? "ON"
                  : "OFF"}
              </p>
            )}

            {error && (
              <p className="mt-3 text-sm text-red-500">
                {error}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              void handleToggle()
            }
            disabled={
              loading ||
              saving
            }
            className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold transition hover:border-[var(--accent)] hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Loading…"
              : saving
                ? "Saving…"
                : enabled
                  ? "Turn off"
                  : "Turn on"}
          </button>
        </div>
      </div>
    </section>
  )
}

export default SeasonalThemeControl