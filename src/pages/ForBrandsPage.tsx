import ContactForm from "../components/forms/ContactForm"
import FormField from "../components/forms/FormField"
import FormSelect from "../components/forms/FormSelect"
import FormTextarea from "../components/forms/FormTextarea"

import usePageMetadata from "../hooks/usePageMetadata"
import { supabase } from "../lib/supabase"

function ForBrandsPage() {
  usePageMetadata({
    title:
      "For Brands | IEM Tour Group Europe",

    description:
      "Interested in sending audio gear on tour with IEM Tour Group Europe? Tell us about your brand, product and what you have in mind.",
  })

  async function handleSubmit(
    formData: FormData,
  ) {
    const payload = {
      type: "brand",

      name:
        formData
          .get("name")
          ?.toString() ?? "",

      email:
        formData
          .get("email")
          ?.toString() ?? "",

      companyName:
        formData
          .get("company_name")
          ?.toString() ?? "",

      productName:
        formData
          .get("product_name")
          ?.toString() ?? "",

      productType:
        formData
          .get("product_type")
          ?.toString() ?? "",

      preferredTiming:
        formData
          .get("preferred_timing")
          ?.toString() ?? "",

      shippingDetails:
        formData
          .get("shipping_details")
          ?.toString() ?? "",

      message:
        formData
          .get("message")
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
          "Could not submit inquiry",
      )
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            For brands
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Let ITGE tour your gear
          </h1>

          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            ITGE organises European tours that put audio gear
            into the hands of multiple enthusiasts and reviewers
            across the region.
          </p>

          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            Members spend time with the gear, listen with their
            own music and equipment, and share independent
            reviews or listening impressions with the community.
          </p>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <ContactForm
            submitLabel="Send inquiry"
            submittingLabel="Sending inquiry…"
            successTitle="Inquiry received"
            successMessage="Thanks for getting in touch with ITGE. We’ll take a look at what you have in mind and get back to you."
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
              title="Contact details"
              description="Tell us who you are and which brand you're contacting us from."
            >
              <FormField
                id="company_name"
                name="company_name"
                label="Company or brand"
                required
                autoComplete="organization"
                placeholder="Brand name"
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  id="name"
                  name="name"
                  label="Contact person"
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
                  placeholder="you@brand.com"
                />
              </div>
            </FormSection>

            <FormSection
              title="The gear"
              description="Give us a little information about what you'd like to send on tour."
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  id="product_name"
                  name="product_name"
                  label="Product"
                  placeholder="Product name"
                />

                <FormSelect
                  id="product_type"
                  name="product_type"
                  label="Product type"
                  options={[
                    {
                      value: "iem",
                      label: "IEM",
                    },
                    {
                      value: "headphone",
                      label: "Headphone",
                    },
                    {
                      value: "source",
                      label: "Source gear",
                    },
                    {
                      value: "cable_accessory",
                      label: "Cable / accessory",
                    },
                  ]}
                />
              </div>

              <FormField
                id="preferred_timing"
                name="preferred_timing"
                label="Preferred timing"
                placeholder="e.g. October 2026, around launch, flexible..."
                helperText="If there is a launch date or particular period you're aiming for, let us know."
              />
            </FormSection>

            <FormSection
              title="Tour details"
              description="A little logistical information helps us work out what kind of tour makes sense."
            >
              <FormTextarea
                id="shipping_details"
                name="shipping_details"
                label="Shipping and availability"
                placeholder="Where will the gear ship from? Is it already available in Europe? Anything we should know about return shipping?"
                helperText="A rough overview is enough at this stage."
                rows={5}
              />

              <FormTextarea
                id="message"
                name="message"
                label="Tell us what you have in mind"
                required
                placeholder="What would you like to send on tour, what are you hoping to arrange, and is there anything else we should know?"
                rows={7}
              />
            </FormSection>
          </ContactForm>

          <aside className="space-y-5 lg:sticky lg:top-8">
            <InfoCard
              title="Independent coverage"
              text="Taking part in an ITGE tour does not guarantee positive coverage. Members are free to share their own experience and opinions."
            />

            <InfoCard
              title="Multiple listeners"
              text="A tour lets the same piece of gear reach several people, each with their own music, equipment, preferences and reviewing style."
            />

            <InfoCard
              title="Reviews and impressions"
              text="Coverage can include full reviews as well as shorter listening impressions. Published ITGE coverage is collected on the site."
            />

            <InfoCard
              title="European tours"
              text="ITGE focuses on organising tours across Europe. We can discuss routing, timing and return shipping once we know what you have in mind."
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

export default ForBrandsPage