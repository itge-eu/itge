import { Outlet } from "react-router"
import Navbar from "./Navbar"
import Footer from "./Footer"
import ScrollToTop from "./ScrollToTop"
import ScrollToHash from "./ScrollToHash"

function Layout() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <ScrollToTop />
      <ScrollToHash />

      <Navbar />

      <div className="min-h-[calc(100vh-5rem)]">
        <Outlet />
      </div>

      <Footer />
    </div>
  )
}

export default Layout