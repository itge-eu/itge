import {
  createContext,
  useContext,
} from "react"

import type {
  SeasonalTheme,
} from "../lib/siteSettings"

type SeasonalThemeContextValue = {
  seasonalTheme: SeasonalTheme
  halloweenMode: boolean
}

const SeasonalThemeContext =
  createContext<SeasonalThemeContextValue>({
    seasonalTheme: "none",
    halloweenMode: false,
  })

export function SeasonalThemeProvider({
  seasonalTheme,
  children,
}: {
  seasonalTheme: SeasonalTheme
  children: React.ReactNode
}) {
  return (
    <SeasonalThemeContext.Provider
      value={{
        seasonalTheme,
        halloweenMode:
          seasonalTheme === "halloween",
      }}
    >
      {children}
    </SeasonalThemeContext.Provider>
  )
}

export function useSeasonalTheme() {
  return useContext(
    SeasonalThemeContext,
  )
}