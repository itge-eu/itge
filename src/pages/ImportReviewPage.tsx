import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";

type HeadFiImage = {
  url: string;
  alt: string;
};

type HeadFiImport = {
  source: "head-fi";
  sourceUrl: string;
  reviewId: string | null;
  productSlug: string | null;
  author: string | null;
  rating: number | null;
  summary: string | null;
  pros: string | null;
  cons: string | null;
  bodyHtml: string | null;
  bodyText: string | null;
  images: HeadFiImage[];
};

type ExistingReview = {
  id: string;
  slug: string;
};

type ReviewerOption = {
  id: string;
  name: string;
};

type IemOption = {
  id: string;
  model: string;
  slug: string;
  manufacturers: {
    name: string;
  } | null;
};

function isValidImport(value: unknown): value is HeadFiImport {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<HeadFiImport>;

  return (
    candidate.source === "head-fi" &&
    typeof candidate.sourceUrl === "string" &&
    Array.isArray(candidate.images) &&
    candidate.images.every(
      (image) =>
        image &&
        typeof image === "object" &&
        typeof image.url === "string" &&
        typeof image.alt === "string",
    )
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ImportReviewPage() {
  const [rawJson, setRawJson] = useState("");
  const [importData, setImportData] = useState<HeadFiImport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(
    null,
  );
  const [reviewers, setReviewers] = useState<ReviewerOption[]>([]);
  const [iems, setIems] = useState<IemOption[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [selectedIemId, setSelectedIemId] = useState("");

  const formattedRating = useMemo(() => {
    if (importData?.rating == null) {
      return "Not found";
    }

    return `${importData.rating.toFixed(1)} / 5`;
  }, [importData]);

  async function findExistingReview(
    sourcePlatform: string,
    sourceReviewId: string,
  ) {
    const { data, error: queryError } = await supabase
      .from("reviews")
      .select("id, slug")
      .eq("source_platform", sourcePlatform)
      .eq("source_review_id", sourceReviewId)
      .maybeSingle();

    if (queryError) throw queryError;
    return data as ExistingReview | null;
  }

  async function loadReviewers() {
    const { data, error: queryError } = await supabase
      .from("reviewers")
      .select("id, name")
      .order("name");

    if (queryError) throw queryError;
    return (data ?? []) as ReviewerOption[];
  }

  async function loadIems() {
    const { data, error: queryError } = await supabase
      .from("iems")
      .select(
        `
        id,
        model,
        slug,
        manufacturers (
          name
        )
      `,
      )
      .order("model");

    if (queryError) throw queryError;
    return (data ?? []) as unknown as IemOption[];
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setImportData(null);
    setExistingReview(null);
    setSavedSlug(null);
    setSelectedReviewerId("");
    setSelectedIemId("");

    const trimmedJson = rawJson.trim();

    if (!trimmedJson) {
      setError("Paste the JSON copied by the ITGE bookmarklet.");
      return;
    }

    setChecking(true);

    try {
      const parsed: unknown = JSON.parse(trimmedJson);

      if (!isValidImport(parsed)) {
        throw new Error(
          "This does not look like valid data from the ITGE bookmarklet.",
        );
      }

      if (!parsed.reviewId) {
        throw new Error("No Head-Fi review ID was found.");
      }

      const [duplicate, reviewerRows, iemRows] = await Promise.all([
        findExistingReview(parsed.source, parsed.reviewId),
        loadReviewers(),
        loadIems(),
      ]);

      setImportData(parsed);
      setExistingReview(duplicate);
      setReviewers(reviewerRows);
      setIems(iemRows);

      const matchingIem = iemRows.find(
        (iem) => iem.slug === parsed.productSlug,
      );
      if (matchingIem) {
        setSelectedIemId(String(matchingIem.id));
      }
      const matchingReviewer = reviewerRows.find(
        (reviewer) =>
          reviewer.name.toLowerCase() === parsed.author?.toLowerCase(),
      );
      if (matchingReviewer) {
        setSelectedReviewerId(String(matchingReviewer.id));
      }    } catch (parseError) {
      setError(
        parseError instanceof Error
          ? parseError.message
          : "The pasted JSON could not be read.",
      );
    } finally {
      setChecking(false);
    }
  }

async function handleSaveDraft() {
  console.log("Save clicked", {
    importData,
    selectedReviewerId,
    selectedIemId,
  });

  if (!importData) {
    setError("No imported review data is available.");
    return;
  }

  if (existingReview) {
    setError("This Head-Fi review has already been imported.");
    return;
  }

  if (!selectedReviewerId) {
    setError("Select an ITGE reviewer.");
    return;
  }

  if (!selectedIemId) {
    setError("Select an ITGE IEM.");
    return;
  }

  if (!importData.reviewId) {
    setError("The source review ID is missing.");
    return;
  }

  const selectedReviewer = reviewers.find(
    (reviewer) => String(reviewer.id) === selectedReviewerId,
  );
  
  const selectedIem = iems.find(
    (iem) => String(iem.id) === selectedIemId,
  );

  if (!selectedReviewer || !selectedIem) {
    setError("The selected reviewer or IEM could not be found.");
    return;
  }

  const manufacturerName =
    selectedIem.manufacturers?.name?.trim() ?? "";
  
  const fullIemName = [manufacturerName, selectedIem.model]
    .filter(Boolean)
    .join(" ");
  
  const reviewTitle = `${fullIemName} review`;
  
  const reviewSlug = slugify(
    `${fullIemName}-${selectedReviewer.name}`,
  );

  const reviewPayload = {
    reviewer_id: Number(selectedReviewerId),
    iem_id: Number(selectedIemId),
  
    title: reviewTitle,
    slug: reviewSlug,
  
    rating: importData.rating,
    summary: importData.summary,
	pros: importData.pros,
    cons: importData.cons,
    body: importData.bodyHtml,
  
    status: "draft",
    published: false,
    featured: false,
  
    hero_image_url: importData.images[0]?.url ?? null,
  
    source_platform: importData.source,
    source_review_id: importData.reviewId,
    source_url: importData.sourceUrl,
    source_html: importData.bodyHtml,
    import_data: importData,
  };

  setSaving(true);
  setError(null);
  setSavedSlug(null);

  try {
    console.log("About to insert review:", reviewPayload);
  
    const { error: insertError } = await supabase
      .from("reviews")
      .insert(reviewPayload);
  
    console.log("Insert completed:", {
      insertError,
    });
  
    if (insertError) {
      if (insertError.code === "23505") {
        throw new Error(
          "This review has already been imported, or its ITGE slug already exists.",
        );
      }
  
      throw insertError;
    }
  
    setSavedSlug(reviewPayload.slug);
  } catch (saveError) {
    console.error("Saving review failed:", saveError);
  
    setError(
      saveError instanceof Error
        ? saveError.message
        : "The review could not be saved.",
    );
  } finally {
  setSaving(false);
  }
}

  function handleClear() {
    setRawJson("");
    setImportData(null);
    setError(null);
    setExistingReview(null);
    setSavedSlug(null);
    setReviewers([]);
    setIems([]);
    setSelectedReviewerId("");
    setSelectedIemId("");
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] lg:px-8">

      <div className="mx-auto max-w-5xl">
        <Link to="/" className="text-sm font-medium text-[var(--accent)]">
          ← Back to homepage
        </Link>

        <header className="mt-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            ITGE Admin
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Import Head-Fi review
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Open the Head-Fi review page, click the ITGE bookmarklet, then paste
            the copied review data below.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
        >
          <label htmlFor="review-json" className="block text-sm font-semibold">
            Copied review JSON
          </label>

          <textarea
            id="review-json"
            value={rawJson}
            onChange={(event) => setRawJson(event.target.value)}
            rows={14}
            spellCheck={false}
            placeholder='{"source":"head-fi", ...}'
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={checking}
              className="rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checking ? "Checking…" : "Preview review"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold transition hover:bg-[var(--background)]"
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
              {error}
            </div>
          )}
        </form>

        {importData && (
          <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-[var(--accent)]">
                  Import preview
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  {importData.productSlug ?? "Unknown product"}
                </h2>

                <p className="mt-2 text-[var(--muted)]">
                  Review {importData.reviewId ?? "without an ID"} by{" "}
                  {importData.author ?? "unknown reviewer"}
                </p>
              </div>

              <span className="w-fit rounded-full border border-[var(--border)] px-3 py-1 text-sm">
                {formattedRating}
              </span>
            </div>

            {existingReview && (
              <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-4">
                <p className="font-semibold">
                  This review has already been imported.
                </p>
                <Link
                  to={`/reviews/${existingReview.slug}`}
                  className="mt-2 inline-block text-[var(--accent)] underline"
                >
                  Open existing ITGE review
                </Link>
              </div>
            )}

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold">Summary</h3>
                <p className="mt-2 leading-7 text-[var(--muted)]">
                  {importData.summary || "No summary found."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Source</h3>
                <a
                  href={importData.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all text-[var(--accent)] underline"
                >
                  Open original Head-Fi page
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Pros</h3>
                <p className="mt-2 whitespace-pre-line leading-7 text-[var(--muted)]">
                  {importData.pros || "No pros found."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Cons</h3>
                <p className="mt-2 whitespace-pre-line leading-7 text-[var(--muted)]">
                  {importData.cons || "No cons found."}
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="reviewer"
                  className="block text-sm font-semibold"
                >
                  ITGE reviewer
                </label>
                <select
                  id="reviewer"
                  value={selectedReviewerId}
                  onChange={(event) =>
                    setSelectedReviewerId(event.target.value)
                  }
                  className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                >
                  <option value="">Select reviewer</option>
                  {reviewers.map((reviewer) => (
                    <option key={reviewer.id} value={String(reviewer.id)}>
					  {reviewer.name}
					</option>
                  ))}
                </select>
                {importData.author && (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Head-Fi username: {importData.author}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="iem" className="block text-sm font-semibold">
                  ITGE IEM
                </label>
                <select
                  id="iem"
                  value={selectedIemId}
                  onChange={(event) => setSelectedIemId(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                >
                  <option value="">Select IEM</option>
                  {iems.map((iem) => (
                    <option key={iem.id} value={String(iem.id)}>
                      {iem.manufacturers?.name
                        ? `${iem.manufacturers.name} ${iem.model}`
                        : iem.model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold">Images</h3>

                <span className="text-sm text-[var(--muted)]">
                  {importData.images.length} found
                </span>
              </div>

              {importData.images.length > 0 ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {importData.images.map((image, index) => (
                    <figure
                      key={`${image.url}-${index}`}
                      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]"
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `Review image ${index + 1}`}
                        className="aspect-[4/3] w-full object-cover"
                      />

                      <figcaption className="truncate px-3 py-2 text-xs text-[var(--muted)]">
                        {image.alt || `Image ${index + 1}`}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[var(--muted)]">
                  No review images found.
                </p>
              )}
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-semibold">Review preview</h3>

              {importData.bodyHtml ? (
                <div
                  className="review-content mt-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5"
                  dangerouslySetInnerHTML={{ __html: importData.bodyHtml }}
                />
              ) : (
                <p className="mt-3 text-[var(--muted)]">
                  No review body found.
                </p>
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              {error && (
                <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
                  {error}
                </div>
              )}
            
              {savedSlug ? (
                <div className="w-full rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-4">
                  <p className="font-semibold">Draft saved successfully.</p>
            
                  <Link
                    to="/admin/reviews"
                    className="mt-2 inline-block text-[var(--accent)] underline"
                  >
                    Open admin reviews
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={
                    saving ||
                    Boolean(existingReview) ||
                    !selectedReviewerId ||
                    !selectedIemId
                  }
                  className="rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save draft"}
                </button>
              )}

              {!selectedReviewerId && (
                <span className="text-sm text-[var(--muted)]">
                  Select a reviewer before saving.
                </span>
              )}

              {selectedReviewerId && !selectedIemId && (
                <span className="text-sm text-[var(--muted)]">
                  Select an IEM before saving.
                </span>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default ImportReviewPage;
