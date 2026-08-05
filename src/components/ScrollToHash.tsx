import { useEffect } from "react"
import { useLocation } from "react-router-dom"

function ScrollToHash() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return

    const id = hash.replace("#", "")

    requestAnimationFrame(() => {
      const element = document.getElementById(id)

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  }, [hash])

  return null
}

export default ScrollToHash