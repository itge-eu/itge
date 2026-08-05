import { useState } from "react"

import type {
  SearchSuggestion,
  SearchSuggestionType,
} from "../../types/search"

type DiscoverSectionProps = {
  type: SearchSuggestionType
  title: string
  description: string
  items: SearchSuggestion[]
  onSelect: (suggestion: SearchSuggestion) => void
}

const INITIAL_ITEM_COUNT = 6

function DiscoverSection({
  type,
  title,
  description,
  items,
  onSelect,
}: DiscoverSectionProps) {
  const [expanded, setExpanded] = useState(false)

  const visibleItems = expanded
    ? items
    : items.slice(0, INITIAL_ITEM_COUNT)

  const hasMoreItems = items.length > INITIAL_ITEM_COUNT

  return (
    <section className="border-t border-[var(--border)] py-12 first:border-t-0 first:pt-0">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
              <DiscoverTypeIcon type={type} />
            </span>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {title}
              </h2>

              <p className="mt-1 text-sm text-[var(--muted)]">
                {items.length} available
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-[var(--muted)]">
            {description}
          </p>
        </div>

        {hasMoreItems && (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="w-fit text-sm font-semibold text-[var(--accent)] transition hover:opacity-75"
          >
            {expanded ? "Show less" : `View all ${title.toLowerCase()}`} →
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--muted)]">
          Nothing has been added here yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              onClick={() => onSelect(item)}
              className="group flex min-w-0 items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--surface-soft)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)] transition group-hover:border-[var(--accent)]">
                <DiscoverTypeIcon type={item.type} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">
                  {item.name}
                </span>

                <span className="mt-1 block truncate text-sm text-[var(--muted)]">
                  {getItemDescription(item)}
                </span>
              </span>

              <ChevronIcon />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

function getItemDescription(
  item: SearchSuggestion,
): string {
  const reviewWord =
    item.reviewCount === 1 ? "review" : "reviews"

  if (item.type === "iem" && item.subtitle) {
    return `${item.subtitle} · ${item.reviewCount} ${reviewWord}`
  }

  if (
    item.type === "artist" ||
    item.type === "genre"
  ) {
    return `Mentioned in ${item.reviewCount} ${reviewWord}`
  }

  return `${item.reviewCount} ${reviewWord}`
}

function DiscoverTypeIcon({
  type,
}: {
  type: SearchSuggestionType
}) {
  switch (type) {
    case "iem":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
          <path d="M4 13a2 2 0 0 1 2-2h1v7H6a2 2 0 0 1-2-2Z" />
          <path d="M20 13a2 2 0 0 0-2-2h-1v7h1a2 2 0 0 0 2-2Z" />
        </svg>
      )

    case "manufacturer":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 21h18" />
          <path d="M5 21V10l5 3v-3l5 3V7l4 2v12" />
          <path d="M8 17h1" />
          <path d="M12 17h1" />
          <path d="M16 17h1" />
        </svg>
      )

    case "reviewer":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      )

    case "artist":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l10-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="16" cy="16" r="3" />
        </svg>
      )

    case "genre":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h10" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      )
  }
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-[var(--muted)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export default DiscoverSection