import DirectorySortSelect from "./DirectorySortSelect"

type SortOption<
  T extends string,
> = {
  value: T
  label: string
}

type DirectoryResultsBarProps<
  T extends string,
> = {
  count: number
  singular: string
  plural: string
  loading?: boolean
  sortValue: T
  sortOptions: SortOption<T>[]
  onSortChange: (
    value: T,
  ) => void
  sortId: string
  caption?: string
  children?: React.ReactNode
  className?: string
}

function DirectoryResultsBar<
  T extends string,
>({
  count,
  singular,
  plural,
  loading = false,
  sortValue,
  sortOptions,
  onSortChange,
  sortId,
  caption,
  children,
  className = "mt-8",
}: DirectoryResultsBarProps<T>) {
  return (
    <div className={`sticky top-23 z-40 -mx-2 px-2 ${className}`}>
      <div className="bg-[var(--background)] pt-3">
        <div className="border-b border-[var(--border)] pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-2xl font-semibold">
                {loading
                  ? "Loading…"
                  : `${count} ${
                      count ===
                      1
                        ? singular
                        : plural
                    }`}
              </p>

              {!loading &&
                caption && (
                  <span className="text-sm text-[var(--muted)]">
                    {caption}
                  </span>
                )}
            </div>

            {!loading && (
              <DirectorySortSelect
                id={sortId}
                value={sortValue}
                options={
                  sortOptions
                }
                onChange={
                  onSortChange
                }
                className="w-full sm:w-60"
              />
            )}
          </div>

          {children && (
            <div className="mt-3">
              {children}
            </div>
          )}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none h-6 bg-gradient-to-b from-[var(--background)] to-transparent"
      />
    </div>
  )
}

export default DirectoryResultsBar
