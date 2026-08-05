import type { FeaturedReview } from "../../lib/reviews"
import ReviewCard from "./ReviewCard"

type ReviewGridProps = {
  reviews: FeaturedReview[]
}

function ReviewGrid({ reviews }: ReviewGridProps) {
  return (
    <div className="grid gap-8">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
        />
      ))}
    </div>
  )
}

export default ReviewGrid