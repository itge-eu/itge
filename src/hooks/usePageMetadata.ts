import { useEffect } from "react"

type PageMetadata = {
  title: string
  description?: string
}

function usePageMetadata({
  title,
  description,
}: PageMetadata) {
  useEffect(() => {
    const previousTitle = document.title

    document.title = title

    let metaDescription =
      document.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      )

    const previousDescription =
      metaDescription?.getAttribute("content") ?? null

    if (description) {
      if (!metaDescription) {
        metaDescription =
          document.createElement("meta")

        metaDescription.setAttribute(
          "name",
          "description",
        )

        document.head.appendChild(metaDescription)
      }

      metaDescription.setAttribute(
        "content",
        description,
      )
    }

    return () => {
      document.title = previousTitle

      if (!metaDescription) {
        return
      }

      if (previousDescription != null) {
        metaDescription.setAttribute(
          "content",
          previousDescription,
        )
      }
    }
  }, [title, description])
}

export default usePageMetadata