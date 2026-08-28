type FormFieldProps = {
  id: string
  name: string
  label: string
  type?: "text" | "email" | "url"
  required?: boolean
  placeholder?: string
  helperText?: string
  autoComplete?: string
  value?: string
  onChange?: (
    value: string,
  ) => void
}

function FormField({
  id,
  name,
  label,
  type = "text",
  required = false,
  placeholder,
  helperText,
  autoComplete,
  value,
  onChange,
}: FormFieldProps) {
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

      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={
          onChange
            ? (event) =>
                onChange(event.target.value)
            : undefined
        }
        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
      />

      {helperText && (
        <p className="mt-2 px-4 text-sm leading-6 text-[var(--muted)]">
          {helperText}
        </p>
      )}
    </div>
  )
}

export default FormField