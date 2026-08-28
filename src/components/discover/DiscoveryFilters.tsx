import DiscoveryFilterGroup from "./DiscoveryFilterGroup"

import type {
  DiscoveryFilterSuggestion,
  DiscoveryFilterType,
  SelectedDiscoveryFilters,
} from "../../types/discovery"

type DiscoveryFiltersProps = {
  groupedSuggestions: Record<
    DiscoveryFilterType,
    DiscoveryFilterSuggestion[]
  >

  selectedFilters:
    SelectedDiscoveryFilters

  onSelect: (
    suggestion: DiscoveryFilterSuggestion,
  ) => void

  onRemove: (
    type: DiscoveryFilterType,
  ) => void

  onClear: () => void
}

const FILTER_GROUPS: {
  type: DiscoveryFilterType
  title: string
  defaultOpen: boolean
}[] = [
  {
    type: "gear_type",
    title: "Gear type",
    defaultOpen: false,
  },
  {
    type: "product",
    title: "Gear",
    defaultOpen: false,
  },
  {
    type: "brand",
    title: "Brands",
    defaultOpen: false,
  },
  {
    type: "reviewer",
    title: "Members",
    defaultOpen: false,
  },
  {
    type: "artist",
    title: "Artists",
    defaultOpen: false,
  },
  {
    type: "genre",
    title: "Genres",
    defaultOpen: false,
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
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-5">
        <h2 className="text-lg font-semibold">
          Filters
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Combine categories to
          narrow the coverage.
        </p>
      </div>

      {activeFilters.length >
        0 && (
        <div className="border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Active filters
            </p>

            <button
              type="button"
              onClick={onClear}
              className="shrink-0 text-sm font-medium text-[var(--accent)] transition hover:opacity-75"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
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
        </div>
      )}

      <div className="px-5">
        {FILTER_GROUPS.map(
          (group) => (
            <DiscoveryFilterGroup
              key={
                group.type
              }
              type={
                group.type
              }
              title={
                group.title
              }
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
              defaultOpen={
                group.defaultOpen
              }
            />
          ),
        )}
      </div>
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