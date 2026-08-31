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
  onClear,
}: DiscoveryFiltersProps) {
  const activeFilterCount =
    getActiveFilterCount(
      selectedFilters,
    )

  return (
    <div className="flex max-h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Filters
          </h2>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 text-sm font-semibold text-[var(--accent)] transition hover:opacity-75"
            >
              Clear ({activeFilterCount})
            </button>
          )}
        </div>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Combine to narrow the coverage.
        </p>
      </div>

      <div className="min-h-0 overflow-y-auto px-5">
        {FILTER_GROUPS.map((group) => (
          <DiscoveryFilterGroup
            key={group.type}
            type={group.type}
            title={group.title}
            items={groupedSuggestions[group.type]}
            selectedItems={getSelectedItems(
              selectedFilters,
              group.type,
            )}
            onSelect={onSelect}
            defaultOpen={group.defaultOpen}
          />
        ))}
      </div>
    </div>
  )
}

function getSelectedItems(
  selectedFilters:
    SelectedDiscoveryFilters,
  type:
    DiscoveryFilterType,
): DiscoveryFilterSuggestion[] {
  switch (type) {
    case "gear_type":
      return selectedFilters.gear_type

    case "product":
      return selectedFilters.product
        ? [
            selectedFilters.product,
          ]
        : []

    case "brand":
      return selectedFilters.brand

    case "reviewer":
      return selectedFilters.reviewer

    case "artist":
      return selectedFilters.artist

    case "genre":
      return selectedFilters.genre
  }
}

function getActiveFilterCount(
  selectedFilters:
    SelectedDiscoveryFilters,
): number {
  return (
    selectedFilters.gear_type.length +
    (selectedFilters.product
      ? 1
      : 0) +
    selectedFilters.brand.length +
    selectedFilters.reviewer.length +
    selectedFilters.artist.length +
    selectedFilters.genre.length
  )
}

export default DiscoveryFilters
