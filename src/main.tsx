import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import "./index.css"
import App from "./App"
import "flag-icons/css/flag-icons.min.css"

// Redirect old hash-based ITGE URLs to the new clean URL format.
// Example: /#/gear/cadenza-12 → /gear/cadenza-12
if (
  window.location.hash.startsWith(
    "#/",
  )
) {
  const cleanPath =
    window.location.hash.slice(1)

  window.history.replaceState(
    null,
    "",
    cleanPath,
  )
}

createRoot(
  document.getElementById("root")!,
).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)