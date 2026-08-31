import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react"

type ContactFormProps = {
  children: ReactNode
  submitLabel: string
  submittingLabel?: string
  successTitle?: string
  successMessage?: string
  onSubmit: (
    formData: FormData,
  ) => Promise<void>
}

function ContactForm({
  children,
  submitLabel,
  submittingLabel = "Sending…",
  successTitle = "Thank you!",
  successMessage = "Your message has been sent.",
  onSubmit,
}: ContactFormProps) {
  const [
    submitting,
    setSubmitting,
  ] = useState(false)

  const [
    submitted,
    setSubmitted,
  ] = useState(false)

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const form =
      event.currentTarget

    if (
      !form.reportValidity()
    ) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const formData =
        new FormData(form)

      await onSubmit(
        formData,
      )

      setSubmitted(true)
      form.reset()
    } catch (
      submitError
    ) {
      console.error(
        "Could not submit form:",
        submitError,
      )

      setError(
        "Something went wrong while sending the form. Please try again.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div
        className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10"
        role="status"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">
          <CheckIcon />
        </div>

        <h2 className="mt-6 text-3xl font-semibold tracking-tight">
          {successTitle}
        </h2>

        <p className="mt-3 max-w-xl leading-7 text-[var(--muted)]">
          {successMessage}
        </p>

        <button
          type="button"
          onClick={() =>
            setSubmitted(
              false,
            )
          }
          className="mt-7 font-semibold text-[var(--accent)] transition hover:opacity-75"
        >
          Send another response
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
    >
      <div className="space-y-7">
        {children}
      </div>

      {error && (
        <div
          className="mt-7 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <p className="mt-8 text-sm leading-6 text-[var(--muted)]">
        Fields marked with{" "}
        <span className="font-semibold text-[var(--accent)]">
          *
        </span>{" "}
        are required.
      </p>

      <div className="mt-5 flex justify-end border-t border-[var(--border)] pt-6">
        <button
          type="submit"
          disabled={
            submitting
          }
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? submittingLabel
            : submitLabel}
        </button>
      </div>
    </form>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

export default ContactForm