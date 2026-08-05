import { Outlet } from "react-router"
import Navbar from "./Navbar"
import Footer from "./Footer"
import ScrollToTop from "./ScrollToTop"

function Layout() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <ScrollToTop />

      <Navbar />

      <div className="min-h-[calc(100vh-5rem)]">
        <Outlet />
      </div>

      <Footer />
    </div>
  )
}

export default Layout