export type FormSelectOption = {
  value: string
  label: string
}

type FormSelectProps = {
  id: string
  name: string
  label: string
  options: FormSelectOption[]
  required?: boolean
  placeholder?: string
  helperText?: string
  value?: string
  onChange?: (
    value: string,
  ) => void
}

function FormSelect({
  id,
  name,
  label,
  options,
  required = false,
  placeholder = "Select an option",
  helperText,
  value,
  onChange,
}: FormSelectProps) {
  const hasValue =
    value !== undefined &&
    value !== ""

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-[var(--foreground)]"
      >
        {label}

        {required && (
          <span
            className="ml-1 text-[var(--accent)]"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      {helperText && (
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          {helperText}
        </p>
      )}

      <div className="relative mt-2">
        <select
          id={id}
          name={name}
          required={required}
          value={value}
          onChange={
            onChange
              ? (event) =>
                  onChange(
                    event.target
                      .value,
                  )
              : undefined
          }
          className={`min-h-12 w-full appearance-none rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 pr-12 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 ${
            hasValue
              ? "text-[var(--foreground)]"
              : "text-[var(--muted)]"
          }`}
        >
          <option
            value=""
            disabled={
              required
            }
          >
            {placeholder}
          </option>

          {options.map(
            (option) => (
              <option
                key={
                  option.value
                }
                value={
                  option.value
                }
                className="text-[var(--foreground)]"
              >
                {option.label}
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
    </div>
  )
}

export default FormSelect