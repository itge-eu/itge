const REVIEWER_AVATAR_BASE_URL =
  "https://ajiayhdjzwdklgajrjrs.supabase.co/storage/v1/object/public/reviewer-avatars/avatars"

export function getReviewerAvatarUrl(
  reviewerSlug: string,
): string {
  return `${REVIEWER_AVATAR_BASE_URL}/${encodeURIComponent(
    reviewerSlug,
  )}.jpg`
}