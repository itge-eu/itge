import { useMemo, useState } from "react"

import type {
  SearchSuggestion,
  SearchSuggestionType,
} from "../../types/search"

type DiscoveryFilterGroupProps = {
  type: SearchSuggestionType
  title: string
  items: SearchSuggestion[]
  selectedItem: SearchSuggestion | null
  onSelect: (suggestion: SearchSuggestion) => void
}

const INITIAL_VISIBLE_ITEMS = 6

function DiscoveryFilterGroup({
  type,
  title,
  items,
  selectedItem,
  onSelect,
}: DiscoveryFilterGroupProps) {
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState("")

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return items
    }

    return items.filter((item) =>
      [item.name, item.subtitle]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [items, query])

  const visibleItems = expanded
    ? filteredItems
    : filteredItems.slice(0, INITIAL_VISIBLE_ITEMS)

  const hasMoreItems =
    filteredItems.length > INITIAL_VISIBLE_ITEMS

  return (
    <section className="border-t border-[var(--border)] py-5 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)]">
            <FilterTypeIcon type={type} />
          </span>

          <h3 className="font-semibold">
            {title}
          </h3>
        </div>

        <span className="text-xs text-[var(--muted)]">
          {filteredItems.length}
        </span>
      </div>

      {items.length > INITIAL_VISIBLE_ITEMS && (
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setExpanded(true)
          }}
          placeholder={`Find ${title.toLowerCase()}...`}
          aria-label={`Search ${title.toLowerCase()}`}
          className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
        />
      )}

      {visibleItems.length === 0 ? (
        <p className="py-2 text-sm text-[var(--muted)]">
          No matching options.
        </p>
      ) : (
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const selected =
              selectedItem?.type === item.type &&
              selectedItem.id === item.id

            return (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => onSelect(item)}
                aria-pressed={selected}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  selected
                    ? "bg-[var(--accent)]/12 text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selected
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  {selected && <CheckIcon />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate">
                    {item.name}
                  </span>

                  {item.type === "iem" &&
                    item.subtitle && (
                      <span className="block truncate text-xs text-[var(--muted)]">
                        {item.subtitle}
                      </span>
                    )}
                </span>

                <span className="shrink-0 text-xs text-[var(--muted)]">
                  {item.reviewCount}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {hasMoreItems && (
        <button
          type="button"
          onClick={() =>
            setExpanded((current) => !current)
          }
          className="mt-3 text-sm font-medium text-[var(--accent)] transition hover:opacity-75"
        >
          {expanded
            ? "Show fewer"
            : `Show all ${filteredItems.length}`}
        </button>
      )}
    </section>
  )
}

function FilterTypeIcon({
  type,
}: {
  type: SearchSuggestionType
}) {
  const commonProps = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    className: "h-4 w-4",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  switch (type) {
    case "iem":
      return (
        <svg {...commonProps}>
          <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
          <path d="M4 13a2 2 0 0 1 2-2h1v7H6a2 2 0 0 1-2-2Z" />
          <path d="M20 13a2 2 0 0 0-2-2h-1v7h1a2 2 0 0 0 2-2Z" />
        </svg>
      )

    case "brand":
      return (
        <svg {...commonProps}>
          <path d="M3 21h18" />
          <path d="M5 21V10l5 3v-3l5 3V7l4 2v12" />
        </svg>
      )

    case "reviewer":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      )

    case "artist":
      return (
        <svg {...commonProps}>
          <path d="M9 18V5l10-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="16" cy="16" r="3" />
        </svg>
      )

    case "genre":
      return (
        <svg {...commonProps}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h10" />
        </svg>
      )
  }
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

export default DiscoveryFilterGroup