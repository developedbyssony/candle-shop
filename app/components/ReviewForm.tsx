"use client";

import { useActionState, useState } from "react";
import { createReview } from "@/app/actions/review";
import {
  AUTHOR_MAX_LENGTH,
  CONTENT_MAX_LENGTH,
  initialReviewState,
  type ReviewFormState,
} from "@/app/lib/reviews";

const RATING_LABELS = ["별로예요", "그저 그래요", "괜찮아요", "좋아요", "최고예요"];

const inputClass =
  "w-full text-sm px-3.5 py-3 outline-none transition-colors focus:border-[var(--color-ink)]";
const inputStyle = {
  background: "var(--color-cream)",
  border: "1px solid var(--color-sand)",
  color: "var(--color-text)",
};

const STAR_PATH =
  "M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z";

export default function ReviewForm({ productId }: { productId: number }) {
  const [rating, setRating] = useState(5);
  const [open, setOpen] = useState(false);

  // 등록에 성공하면 폼을 접습니다. 폼이 사라지면서 입력값도 함께 비워지고,
  // 그 자리에 갱신된 리뷰 목록이 보입니다.
  const submit = async (prevState: ReviewFormState, formData: FormData) => {
    const result = await createReview(prevState, formData);
    if (result.status === "success") {
      setRating(5);
      setOpen(false);
    }
    return result;
  };

  const [state, formAction, pending] = useActionState(submit, initialReviewState);

  const errors = state.status === "error" ? state.errors : undefined;

  if (!open) {
    return (
      <div className="mb-10">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-outline w-full sm:w-auto"
        >
          후기 쓰기
        </button>
        {state.status === "success" && (
          <p
            className="text-[12px] mt-3 px-4 py-3"
            style={{ background: "var(--color-beige)", color: "var(--color-sage-dark)" }}
            role="status"
          >
            ✓ 후기가 등록되었어요. 감사합니다!
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mb-10 p-5 space-y-5"
      style={{ background: "#fff", border: "1px solid var(--color-sand)" }}
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--color-muted)" }}>
          별점
        </p>
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setRating(score)}
                aria-label={`${score}점`}
                aria-pressed={rating === score}
                className="p-1 -m-0.5 transition-opacity hover:opacity-70"
              >
                <svg
                  width={26}
                  height={26}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{
                    color:
                      score <= rating
                        ? "var(--color-sage-dark)"
                        : "var(--color-sand)",
                  }}
                >
                  <path d={STAR_PATH} />
                </svg>
              </button>
            ))}
          </div>
          <span className="text-[12px] ml-1.5" style={{ color: "var(--color-text)" }}>
            {RATING_LABELS[rating - 1]}
          </span>
        </div>
        {errors?.rating && (
          <p className="text-[11px] mt-1.5" style={{ color: "#c2705f" }}>
            {errors.rating}
          </p>
        )}
      </div>

      <label className="block">
        <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
          이름
        </span>
        <input
          name="author"
          required
          maxLength={AUTHOR_MAX_LENGTH}
          placeholder="화면에 표시될 이름"
          className={`${inputClass} mt-1.5`}
          style={inputStyle}
        />
        {errors?.author && (
          <p className="text-[11px] mt-1" style={{ color: "#c2705f" }}>
            {errors.author}
          </p>
        )}
      </label>

      <label className="block">
        <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
          후기
        </span>
        <textarea
          name="content"
          required
          rows={4}
          maxLength={CONTENT_MAX_LENGTH}
          placeholder="향, 색상, 크기 등 사용해보신 느낌을 남겨주세요."
          className={`${inputClass} mt-1.5 resize-none`}
          style={inputStyle}
        />
        {errors?.content && (
          <p className="text-[11px] mt-1" style={{ color: "#c2705f" }}>
            {errors.content}
          </p>
        )}
      </label>

      {state.status === "error" && state.message && (
        <p
          className="text-xs px-4 py-3"
          style={{ background: "#f7ece9", color: "#c2705f" }}
        >
          {state.message}
        </p>
      )}

      <div className="flex gap-2.5">
        <button
          type="submit"
          disabled={pending}
          className="btn-solid flex-1 disabled:opacity-60"
        >
          {pending ? "등록 중…" : "등록하기"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-outline shrink-0"
        >
          취소
        </button>
      </div>
    </form>
  );
}
