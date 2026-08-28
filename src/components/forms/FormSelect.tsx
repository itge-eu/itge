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
        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
      >
        <option value="">
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
            >
              {option.label}
            </option>
          ),
        )}
      </select>
    </div>
  )
}

export default FormSelect