type FormTextareaProps = {
  id: string
  name: string
  label: string
  required?: boolean
  placeholder?: string
  helperText?: string
  rows?: number
  value?: string
  onChange?: (
    value: string,
  ) => void
}

function FormTextarea({
  id,
  name,
  label,
  required = false,
  placeholder,
  helperText,
  rows = 5,
  value,
  onChange,
}: FormTextareaProps) {
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

      <textarea
        id={id}
        name={name}
        required={required}
        placeholder={placeholder}
        rows={rows}
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
        className="mt-2 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
      />
    </div>
  )
}

export default FormTextarea