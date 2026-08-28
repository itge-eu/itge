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
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10"
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
    </label>
  )
}

export default DirectorySortSelect