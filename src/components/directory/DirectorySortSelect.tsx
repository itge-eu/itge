export type DirectorySortOption<
  TValue extends string,
> = {
  value: TValue
  label: string
}

type DirectorySortSelectProps<
  TValue extends string,
> = {
  id: string
  value: TValue

  options:
    DirectorySortOption<TValue>[]

  onChange: (
    value: TValue,
  ) => void

  label?: string
  className?: string
}

function DirectorySortSelect<
  TValue extends string,
>({
  id,
  value,
  options,
  onChange,
  label,
  className = "",
}: DirectorySortSelectProps<TValue>) {
  return (
    <label
      htmlFor={id}
      className={`block ${className}`}
    >
      {label ? (
        <span className="mb-2 block text-sm font-semibold">
          {label}
        </span>
      ) : (
        <span className="sr-only">
          Sort
        </span>
      )}

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(
            event,
          ) =>
            onChange(
              event.target
                .value as TValue,
            )
          }
          className="min-h-12 w-full appearance-none rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 pr-12 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
        >
          {options.map(
            (option) => (
              <option
                key={
                  option.value
                }
                value={
                  option.value
                }
              >
                {
                  option.label
                }
              </option>
            ),
          )}
        </select>

        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
        >
          <path
            d="m6 8 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </label>
  )
}

export default DirectorySortSelect