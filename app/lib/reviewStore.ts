import { SEED_REVIEWS } from "@/app/data/reviews";
import { EMPTY_SUMMARY, type Review, type ReviewSummary } from "@/app/lib/reviews";

/**
 * 데모용 인메모리 리뷰 저장소(주문 저장소와 같은 방식).
 * 서버를 재시작하면 새로 쓴 리뷰가 사라지고 예시 리뷰만 남습니다.
 * 실제 운영에서는 DB로 교체하세요.
 */
const globalForReviews = globalThis as unknown as {
  __candleReviews?: Review[];
};
const reviewStore = globalForReviews.__candleReviews ?? [...SEED_REVIEWS];
globalForReviews.__candleReviews = reviewStore;

/** 최신순으로 돌려줍니다. */
export function getReviews(productId: number): Review[] {
  return reviewStore
    .filter((review) => review.productId === productId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getReviewSummary(productId: number): ReviewSummary {
  const ratings = reviewStore
    .filter((review) => review.productId === productId)
    .map((review) => review.rating);

  if (ratings.length === 0) return EMPTY_SUMMARY;

  const counts: ReviewSummary["counts"] = [0, 0, 0, 0, 0];
  let total = 0;
  for (const rating of ratings) {
    counts[rating - 1] += 1;
    total += rating;
  }

  return {
    count: ratings.length,
    average: Math.round((total / ratings.length) * 10) / 10,
    counts,
  };
}

/** 상품 목록에서 카드마다 요약을 붙일 때 씁니다. */
export function getReviewSummaries(productIds: number[]) {
  return new Map(productIds.map((id) => [id, getReviewSummary(id)]));
}

export function addReview(input: {
  productId: number;
  author: string;
  rating: number;
  content: string;
}): Review {
  const review: Review = {
    ...input,
    id: `r${Date.now()}${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };
  reviewStore.push(review);
  return review;
}
