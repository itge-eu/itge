import {
  publicSupabase,
  supabase,
} from "./supabase"

export type SeasonalTheme =
  | "none"
  | "halloween"

export async function getSeasonalTheme(): Promise<SeasonalTheme> {
  const {
    data,
    error,
  } =
    await publicSupabase
      .from("site_settings")
      .select("value")
      .eq(
        "key",
        "seasonal_theme",
      )
      .maybeSingle()

  if (error) {
    console.error(
      "Failed to load seasonal theme:",
      error,
    )

    return "none"
  }

  return data?.value === "halloween"
    ? "halloween"
    : "none"
}

export async function setSeasonalTheme(
  theme: SeasonalTheme,
) {
  const {
    error,
  } =
    await supabase
      .from("site_settings")
      .update({
        value: theme,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "key",
        "seasonal_theme",
      )

  if (error) {
    throw error
  }
}