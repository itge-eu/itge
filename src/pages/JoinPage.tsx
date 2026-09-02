import ContactForm from "../components/forms/ContactForm"
import FormField from "../components/forms/FormField"
import FormSelect from "../components/forms/FormSelect"
import FormTextarea from "../components/forms/FormTextarea"

import usePageMetadata from "../hooks/usePageMetadata"
import { supabase } from "../lib/supabase"

function JoinPage() {
  usePageMetadata({
    title:
      "Join ITGE | IEM Tour Group Europe",

    description:
      "Interested in joining IEM Tour Group Europe? Tell us a little about yourself, your audio experience and how you would like to contribute.",
  })

  async function handleSubmit(
    formData: FormData,
  ) {
    const payload = {
      type: "join",

      name:
        formData
          .get("name")
          ?.toString() ?? "",

      email:
        formData
          .get("email")
          ?.toString() ?? "",

      country:
        formData
          .get("country")
          ?.toString() ?? "",

      headfi:
        formData
          .get("headfi")
          ?.toString() ?? "",

      audioExperience:
        formData
          .get("audio_experience")
          ?.toString() ?? "",

      currentGear:
        formData
          .get("current_gear")
          ?.toString() ?? "",

      reviewExperience:
        formData
          .get("review_experience")
          ?.toString() ?? "",

      motivation:
        formData
          .get("motivation")
          ?.toString() ?? "",

      website:
        formData
          .get("website")
          ?.toString() ?? "",
    }

    const {
      data,
      error,
    } =
      await supabase.functions.invoke(
        "contact",
        {
          body: payload,
        },
      )

    if (error) {
      console.error(
        "Contact function error:",
        error,
      )

      throw error
    }

    if (!data?.success) {
      throw new Error(
        data?.error ??
          "Could not submit application",
      )
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Join ITGE
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Want to join one of our tours?
          </h1>

          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            IEM Tour Group Europe brings audio gear to
            enthusiasts and reviewers across Europe so they
            can listen, compare and share their experiences
            with the wider community.
          </p>

          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            You don&apos;t need to be a professional reviewer.
            We&apos;re interested in people who genuinely enjoy
            audio, can take care of touring gear and are willing
            to share useful impressions or reviews.
          </p>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <ContactForm
            submitLabel="Apply to join ITGE"
            submittingLabel="Sending application…"
            successTitle="Application received"
            successMessage="Thanks for your interest in joining ITGE. We’ll review your application and get back to you."
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-px w-px overflow-hidden"
            />

            <FormSection
              title="Your details"
              description="Start with the basics so we know who we're talking to."
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  id="name"
                  name="name"
                  label="Name"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                />

                <FormField
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  id="country"
                  name="country"
                  label="Country"
                  required
                  autoComplete="country-name"
                  placeholder="e.g. Norway"
                />

                <FormField
                  id="headfi"
                  name="headfi"
                  label="Head-Fi username or profile"
                  placeholder="Optional"
                  helperText="A username or profile URL is fine."
                />
              </div>
            </FormSection>

            <FormSection
              title="Your audio experience"
              description="There is no right answer here. This simply helps us understand your background."
            >
              <FormSelect
                id="audio_experience"
                name="audio_experience"
                label="How long have you been interested in audio?"
                required
                options={[
                  {
                    value: "less_than_year",
                    label: "Less than a year",
                  },
                  {
                    value: "1_3_years",
                    label: "1–3 years",
                  },
                  {
                    value: "3_5_years",
                    label: "3–5 years",
                  },
                  {
                    value: "5_10_years",
                    label: "5–10 years",
                  },
                  {
                    value: "10_plus_years",
                    label: "More than 10 years",
                  },
                ]}
              />

              <FormTextarea
                id="current_gear"
                name="current_gear"
                label="What audio gear do you currently use?"
                placeholder="IEMs, headphones, DACs, DAPs, amplifiers, sources..."
                helperText="A short overview is enough."
                rows={4}
              />

              <FormTextarea
                id="review_experience"
                name="review_experience"
                label="Where do you publish reviews or impressions?"
                placeholder="Head-Fi, your own site, YouTube, Reddit, forums, social media..."
                helperText="Links are welcome, but previous reviewing experience is not required."
                rows={4}
              />
            </FormSection>

            <FormSection
              title="Why ITGE?"
              description="Tell us a little about what you're looking for and what you would bring to the group."
            >
              <FormTextarea
                id="motivation"
                name="motivation"
                label="Tell us about yourself and why you'd like to join ITGE"
                required
                placeholder="What interests you about the tours? What kind of listener are you? What would you like to contribute?"
                rows={7}
              />
            </FormSection>
          </ContactForm>

          <aside className="space-y-5 lg:sticky lg:top-26">
            <InfoCard
              title="What happens next?"
              text="We review each application before adding new members. This helps us keep tours manageable and make sure everyone understands how the group works."
            />

            <InfoCard
              title="Do I need to write full reviews?"
              text="Not necessarily. Listening impressions can be valuable too. What matters most is contributing something useful after taking part in a tour."
            />

            <InfoCard
              title="European tours"
              text="ITGE is focused on European tours, so participants need to be able to receive and forward gear within the region."
            />
          </aside>
        </div>
      </div>
    </main>
  )
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <div className="space-y-6">
        {children}
      </div>
    </section>
  )
}

function InfoCard({
  title,
  text,
}: {
  title: string
  text: string
}) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h2 className="font-semibold">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {text}
      </p>
    </div>
  )
}

export default JoinPage