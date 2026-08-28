type DirectorySearchInputProps = {
  id: string
  value: string
  onChange: (
    value: string,
  ) => void

  placeholder: string

  label?: string
  className?: string
}

function DirectorySearchInput({
  id,
  value,
  onChange,
  placeholder,
  label,
  className = "",
}: DirectorySearchInputProps) {
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
          Search
        </span>
      )}

      <div className="relative">
        <SearchIcon />

        <input
          id={id}
          type="search"
          value={value}
          onChange={(
            event,
          ) =>
            onChange(
              event.target.value,
            )
          }
          placeholder={
            placeholder
          }
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] py-3 pl-11 pr-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10"
        />
      </div>
    </label>
  )
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export default DirectorySearchInput