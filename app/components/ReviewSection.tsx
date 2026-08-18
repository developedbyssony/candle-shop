import ReviewForm from "@/app/components/ReviewForm";
import StarRating from "@/app/components/StarRating";
import { getReviews, getReviewSummary } from "@/app/lib/reviewStore";
import { formatReviewDate } from "@/app/lib/reviews";

export default function ReviewSection({ productId }: { productId: number }) {
  const reviews = getReviews(productId);
  const summary = getReviewSummary(productId);

  return (
    <section id="reviews" className="mt-16 md:mt-24 scroll-mt-20">
      <h2 className="eyebrow mb-5">Reviews</h2>

      {summary.count > 0 && (
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 p-6 mb-8"
          style={{ background: "var(--color-beige)" }}
        >
          <div className="shrink-0 text-center sm:text-left">
            <p className="font-display text-4xl leading-none mb-2.5" style={{ color: "var(--color-ink)" }}>
              {summary.average.toFixed(1)}
            </p>
            <StarRating value={summary.average} size={15} />
            <p className="text-[12px] mt-2" style={{ color: "var(--color-muted)" }}>
              후기 {summary.count}개
            </p>
          </div>

          {/* 별점 분포 */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((score) => {
              const count = summary.counts[score - 1];
              const percent = Math.round((count / summary.count) * 100);
              return (
                <div key={score} className="flex items-center gap-2.5">
                  <span
                    className="text-[11px] w-6 shrink-0"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {score}점
                  </span>
                  <span
                    className="h-1.5 flex-1 overflow-hidden"
                    style={{ background: "var(--color-cream)" }}
                  >
                    <span
                      className="block h-full"
                      style={{
                        width: `${percent}%`,
                        background: "var(--color-sage)",
                      }}
                    />
                  </span>
                  <span
                    className="text-[11px] w-6 text-right shrink-0"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ReviewForm productId={productId} />

      {reviews.length === 0 ? (
        <p
          className="text-[13px] py-10 text-center"
          style={{
            color: "var(--color-muted)",
            border: "1px solid var(--color-sand)",
          }}
        >
          아직 등록된 후기가 없어요. 첫 후기를 남겨주세요.
        </p>
      ) : (
        <ul style={{ borderTop: "1px solid var(--color-sand)" }}>
          {reviews.map((review) => (
            <li
              key={review.id}
              className="py-5"
              style={{ borderBottom: "1px solid var(--color-sand)" }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <StarRating value={review.rating} size={13} />
                <span className="text-[13px] font-medium" style={{ color: "var(--color-text)" }}>
                  {review.author}
                </span>
                <span className="text-[11px] ml-auto" style={{ color: "var(--color-muted)" }}>
                  {formatReviewDate(review.createdAt)}
                </span>
              </div>
              <p
                className="text-[13px] leading-relaxed whitespace-pre-line text-pretty"
                style={{ color: "var(--color-muted)" }}
              >
                {review.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
