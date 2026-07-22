import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { supabase } from "../lib/supabase";

type ReviewForm = {
  id: number;
  title: string;
  slug: string;
  rating: string;
  summary: string;
  body: string;
  pros: string;
  cons: string;
  heroImageUrl: string;
  status: string;
  published: boolean;
  featured: boolean;
  sourcePlatform: string;
  sourceReviewId: string;
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
  reviewerName: string;
  iemName: string;
};

function createEmptyReview(): ReviewForm {
  return {
    id: 0,
    title: "",
    slug: "",
    rating: "",
    summary: "",
    body: "",
    pros: "",
    cons: "",
    heroImageUrl: "",
    status: "draft",
    published: false,
    featured: false,
    sourcePlatform: "",
    sourceReviewId: "",
    sourceUrl: "",
    createdAt: "",
    updatedAt: "",
    reviewerName: "",
    iemName: "",
  };
}

function formatDate(value: string) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function AdminEditReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState<ReviewForm>(createEmptyReview());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bodyMode, setBodyMode] = useState<"preview" | "html">("preview");

  useEffect(() => {
    async function loadReview() {
      if (!id) {
        setError("No review ID was provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("reviews")
        .select(`
          id,
          title,
          slug,
          rating,
          summary,
          body,
		  source_html,
          pros,
          cons,
          hero_image_url,
          status,
          published,
          featured,
          source_platform,
          source_review_id,
          source_url,
          created_at,
          updated_at,
          reviewers (
            name
          ),
          iems (
            model,
            manufacturers (
              name
            )
          )
        `)
        .eq("id", id)
        .single();

      if (queryError) {
        console.error("Loading review failed:", queryError);
        setError(queryError.message);
        setLoading(false);
        return;
      }

      const iemRelation = Array.isArray(data.iems)
        ? data.iems[0]
        : data.iems;
      
      const manufacturerRelation = Array.isArray(iemRelation?.manufacturers)
        ? iemRelation.manufacturers[0]
        : iemRelation?.manufacturers;
      
      const reviewerRelation = Array.isArray(data.reviewers)
        ? data.reviewers[0]
        : data.reviewers;
      
      const manufacturerName =
        manufacturerRelation?.name?.trim() ?? "";
      
      const modelName =
        iemRelation?.model?.trim() ?? "";
      
      const iemName = [manufacturerName, modelName]
        .filter(Boolean)
        .join(" ");

      setReview({
        id: Number(data.id),
        title: data.title ?? "",
        slug: data.slug ?? "",
        rating:
          data.rating == null
            ? ""
            : String(data.rating),
        summary: data.summary ?? "",
        body: data.source_html ?? data.body ?? "",
        pros: data.pros ?? "",
        cons: data.cons ?? "",
        heroImageUrl: data.hero_image_url ?? "",
        status: data.status ?? "draft",
        published: Boolean(data.published),
        featured: Boolean(data.featured),
        sourcePlatform: data.source_platform ?? "",
        sourceReviewId: data.source_review_id ?? "",
        sourceUrl: data.source_url ?? "",
        createdAt: data.created_at ?? "",
        updatedAt: data.updated_at ?? "",
        reviewerName: reviewerRelation?.name ?? "Unknown reviewer",
        iemName: iemName || "Unknown IEM",
      });

      setLoading(false);
    }

    void loadReview();
  }, [id]);

  function updateField<K extends keyof ReviewForm>(
    field: K,
    value: ReviewForm[K],
  ) {
    setReview((currentReview) => ({
      ...currentReview,
      [field]: value,
    }));
  }

  async function saveReview(options?: {
    publish?: boolean;
  }) {
    const shouldPublish = options?.publish ?? false;

    if (!review.title.trim()) {
      setError("The review title cannot be empty.");
      return;
    }

    if (!review.slug.trim()) {
      setError("The review slug cannot be empty.");
      return;
    }

    const parsedRating =
      review.rating.trim() === ""
        ? null
        : Number(review.rating);

    if (
      parsedRating != null &&
      (
        Number.isNaN(parsedRating) ||
        parsedRating < 0 ||
        parsedRating > 5
      )
    ) {
      setError("Rating must be between 0 and 5.");
      return;
    }

    if (shouldPublish) {
      setPublishing(true);
    } else {
      setSaving(true);
    }

    setError(null);
    setSuccessMessage(null);

    const nextPublished = shouldPublish
      ? true
      : review.published;

    const nextStatus = shouldPublish
      ? "published"
      : review.status;

    const reviewPayload = {
      title: review.title.trim(),
      slug: review.slug.trim(),
      rating: parsedRating,
      summary: review.summary.trim() || null,
      body: review.body.trim() || null,
      pros: review.pros.trim() || null,
      cons: review.cons.trim() || null,
      hero_image_url:
        review.heroImageUrl.trim() || null,
      featured: review.featured,
      published: nextPublished,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };

    const { data, error: updateError } = await supabase
      .from("reviews")
      .update(reviewPayload)
      .eq("id", review.id)
      .select(`
        updated_at,
        published,
        status
      `)
      .single();

    if (updateError) {
      console.error("Updating review failed:", updateError);
      setError(updateError.message);
      setSaving(false);
      setPublishing(false);
      return;
    }

    setReview((currentReview) => ({
      ...currentReview,
      published: Boolean(data.published),
      status: data.status ?? nextStatus,
      updatedAt: data.updated_at ?? new Date().toISOString(),
    }));

    setSuccessMessage(
      shouldPublish
        ? "Review published successfully."
        : "Review saved successfully.",
    );

    setSaving(false);
    setPublishing(false);
  }

  async function handleUnpublish() {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const { data, error: updateError } = await supabase
      .from("reviews")
      .update({
        published: false,
        status: "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", review.id)
      .select(`
        updated_at,
        published,
        status
      `)
      .single();

    if (updateError) {
      console.error("Unpublishing review failed:", updateError);
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setReview((currentReview) => ({
      ...currentReview,
      published: Boolean(data.published),
      status: data.status ?? "draft",
      updatedAt: data.updated_at ?? new Date().toISOString(),
    }));

    setSuccessMessage("Review returned to draft.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">

        <div className="mx-auto max-w-6xl">
          <p className="text-[var(--muted)]">
            Loading review…
          </p>
        </div>
      </main>
    );
  }

  if (error && review.id === 0) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">

        <div className="mx-auto max-w-6xl">
          <Link
            to="/admin/reviews"
            className="text-sm font-medium text-[var(--accent)]"
          >
            ← Back to admin reviews
          </Link>

          <div className="mt-12 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            <p className="font-semibold">
              Review could not be loaded.
            </p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-12 text-[var(--foreground)] lg:px-8">

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/admin/reviews"
            className="text-sm font-medium text-[var(--accent)]"
          >
            ← Back to admin reviews
          </Link>

          <div className="flex flex-wrap gap-3">
            {review.published && (
              <Link
                to={`/reviews/${review.slug}`}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface)]"
              >
                View public review
              </Link>
            )}

            <button
              type="button"
              onClick={() => void saveReview()}
              disabled={saving || publishing}
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>

            {review.published ? (
              <button
                type="button"
                onClick={() => void handleUnpublish()}
                disabled={saving || publishing}
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Return to draft
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  void saveReview({ publish: true })
                }
                disabled={saving || publishing}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {publishing ? "Publishing…" : "Publish review"}
              </button>
            )}
          </div>
        </div>

        <header className="mt-10">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                review.published
                  ? "bg-green-500/15 text-green-600"
                  : "bg-amber-500/15 text-amber-600"
              }`}
            >
              {review.published ? "Published" : "Draft"}
            </span>

            {review.featured && (
              <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-600">
                Featured
              </span>
            )}
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Edit review
          </h1>

          <p className="mt-4 text-lg text-[var(--muted)]">
            {review.iemName} · {review.reviewerName}
          </p>
        </header>

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-8 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3">
            {successMessage}
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-8">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <h2 className="text-xl font-semibold">
                Review content
              </h2>

              <div className="mt-6">
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold"
                >
                  Title
                </label>

                <input
                  id="title"
                  type="text"
                  value={review.title}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                  className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                />
              </div>

              <div className="mt-6">
                <label
                  htmlFor="summary"
                  className="block text-sm font-semibold"
                >
                  Summary
                </label>

                <textarea
                  id="summary"
                  value={review.summary}
                  onChange={(event) =>
                    updateField("summary", event.target.value)
                  }
                  rows={4}
                  className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                />
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="pros"
                    className="block text-sm font-semibold"
                  >
                    Pros
                  </label>

                  <textarea
                    id="pros"
                    value={review.pros}
                    onChange={(event) =>
                      updateField("pros", event.target.value)
                    }
                    rows={6}
                    className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cons"
                    className="block text-sm font-semibold"
                  >
                    Cons
                  </label>

                  <textarea
                    id="cons"
                    value={review.cons}
                    onChange={(event) =>
                      updateField("cons", event.target.value)
                    }
                    rows={6}
                    className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <label className="block text-sm font-semibold">
                    Review body
                  </label>
              
                  <div className="flex rounded-xl border border-[var(--border)] p-1">
                    <button
                      type="button"
                      onClick={() => setBodyMode("preview")}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                        bodyMode === "preview"
                          ? "bg-[var(--accent)] text-white"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      Preview
                    </button>
              
                    <button
                      type="button"
                      onClick={() => setBodyMode("html")}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                        bodyMode === "html"
                          ? "bg-[var(--accent)] text-white"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      Edit HTML
                    </button>
                  </div>
                </div>
              
                {bodyMode === "preview" ? (
                  <div
                    className="review-content mt-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-5"
                    dangerouslySetInnerHTML={{ __html: review.body }}
                  />
                ) : (
                  <textarea
                    id="body"
                    value={review.body}
                    onChange={(event) =>
                      updateField("body", event.target.value)
                    }
                    rows={28}
                    spellCheck={false}
                    className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-sm leading-7 outline-none transition focus:border-[var(--accent)]"
                  />
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-8">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-lg font-semibold">
                Publishing
              </h2>

              <div className="mt-6">
                <label
                  htmlFor="rating"
                  className="block text-sm font-semibold"
                >
                  Rating
                </label>

                <input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={review.rating}
                  onChange={(event) =>
                    updateField("rating", event.target.value)
                  }
                  className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                />
              </div>

              <label className="mt-6 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={review.featured}
                  onChange={(event) =>
                    updateField("featured", event.target.checked)
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-semibold">
                  Featured review
                </span>
              </label>

              <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Status
                </p>
                <p className="mt-1 font-semibold">
                  {review.published ? "Published" : "Draft"}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-lg font-semibold">
                Review details
              </h2>

              <dl className="mt-6 space-y-5 text-sm">
                <div>
                  <dt className="text-[var(--muted)]">
                    IEM
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {review.iemName}
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--muted)]">
                    Reviewer
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {review.reviewerName}
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--muted)]">
                    Slug
                  </dt>
                  <dd className="mt-1 break-all font-mono text-xs">
                    {review.slug}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-lg font-semibold">
                Hero image
              </h2>

              {review.heroImageUrl && (
                <img
                  src={review.heroImageUrl}
                  alt=""
                  className="mt-5 aspect-[4/3] w-full rounded-2xl object-cover"
                />
              )}

              <label
                htmlFor="hero-image"
                className="mt-5 block text-sm font-semibold"
              >
                Image URL
              </label>

              <input
                id="hero-image"
                type="url"
                value={review.heroImageUrl}
                onChange={(event) =>
                  updateField(
                    "heroImageUrl",
                    event.target.value,
                  )
                }
                className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
              />
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-lg font-semibold">
                Source metadata
              </h2>

              <dl className="mt-6 space-y-5 text-sm">
                <div>
                  <dt className="text-[var(--muted)]">
                    Platform
                  </dt>
                  <dd className="mt-1">
                    {review.sourcePlatform || "Unknown"}
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--muted)]">
                    Source review ID
                  </dt>
                  <dd className="mt-1">
                    {review.sourceReviewId || "Unknown"}
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--muted)]">
                    Created
                  </dt>
                  <dd className="mt-1">
                    {formatDate(review.createdAt)}
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--muted)]">
                    Updated
                  </dt>
                  <dd className="mt-1">
                    {formatDate(review.updatedAt)}
                  </dd>
                </div>
              </dl>

              {review.sourceUrl && (
                <a
                  href={review.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-block text-sm font-semibold text-[var(--accent)] underline"
                >
                  Open original review
                </a>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-wrap justify-end gap-3 border-t border-[var(--border)] pt-8">
          <button
            type="button"
            onClick={() => navigate("/admin/reviews")}
            className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold transition hover:bg-[var(--surface)]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void saveReview()}
            disabled={saving || publishing}
            className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold transition hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>

          {!review.published && (
            <button
              type="button"
              onClick={() =>
                void saveReview({ publish: true })
              }
              disabled={saving || publishing}
              className="rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishing ? "Publishing…" : "Publish review"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default AdminEditReviewPage;