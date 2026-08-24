import DiscoveryFilterGroup from "./DiscoveryFilterGroup"

import type {
  SearchSuggestion,
  SearchSuggestionType,
} from "../../types/search"

export type SelectedDiscoveryFilters =
  Record<
    SearchSuggestionType,
    SearchSuggestion | null
  >

type DiscoveryFiltersProps = {
  groupedSuggestions: Record<
    SearchSuggestionType,
    SearchSuggestion[]
  >

  selectedFilters:
    SelectedDiscoveryFilters

  onSelect: (
    suggestion: SearchSuggestion,
  ) => void

  onRemove: (
    type: SearchSuggestionType,
  ) => void

  onClear: () => void
}

const FILTER_GROUPS: {
  type: SearchSuggestionType
  title: string
}[] = [
  {
    type: "iem",
    title: "IEMs",
  },
  {
    type: "manufacturer",
    title: "Brands",
  },
  {
    type: "artist",
    title: "Artists",
  },
  {
    type: "genre",
    title: "Genres",
  },
  {
    type: "reviewer",
    title: "Members",
  },
]

function DiscoveryFilters({
  groupedSuggestions,
  selectedFilters,
  onSelect,
  onRemove,
  onClear,
}: DiscoveryFiltersProps) {
  const activeFilters =
    FILTER_GROUPS.flatMap(
      ({ type }) => {
        const filter =
          selectedFilters[type]

        return filter
          ? [filter]
          : []
      },
    )

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Filters
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Combine categories
            to narrow the
            coverage.
          </p>
        </div>

        {activeFilters.length >
          0 && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-sm font-medium text-[var(--accent)] transition hover:opacity-75"
          >
            Clear all
          </button>
        )}
      </div>

      {activeFilters.length >
        0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {activeFilters.map(
            (filter) => (
              <button
                key={
                  filter.type
                }
                type="button"
                onClick={() =>
                  onRemove(
                    filter.type,
                  )
                }
                aria-label={`Remove ${filter.name} filter`}
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-2 text-xs font-medium transition hover:border-[var(--accent)]"
              >
                <span className="truncate">
                  {
                    filter.name
                  }
                </span>

                <CloseIcon />
              </button>
            ),
          )}
        </div>
      )}

      {FILTER_GROUPS.map(
        (group) => (
          <DiscoveryFilterGroup
            key={group.type}
            type={group.type}
            title={group.title}
            items={
              groupedSuggestions[
                group.type
              ]
            }
            selectedItem={
              selectedFilters[
                group.type
              ]
            }
            onSelect={
              onSelect
            }
          />
        ),
      )}
    </div>
  )
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  )
}

export default DiscoveryFilters