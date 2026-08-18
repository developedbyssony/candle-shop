"use server";

import { revalidatePath } from "next/cache";
import { products } from "@/app/data/products";
import { addReview } from "@/app/lib/reviewStore";
import {
  AUTHOR_MAX_LENGTH,
  CONTENT_MAX_LENGTH,
  CONTENT_MIN_LENGTH,
  type ReviewFormState,
} from "@/app/lib/reviews";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * 리뷰 등록.
 * 로그인 없이 누구나 호출할 수 있는 액션이라, 값은 모두 서버에서 다시 확인합니다.
 */
export async function createReview(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const productId = Number(text(formData, "productId"));
  const author = text(formData, "author");
  const rating = Number(text(formData, "rating"));
  const content = text(formData, "content");

  const product = products.find((item) => item.id === productId);
  if (!product) {
    return { status: "error", message: "상품을 찾을 수 없어요", errors: {} };
  }

  const errors: { author?: string; rating?: string; content?: string } = {};

  if (author.length < 1) errors.author = "이름을 입력해주세요";
  else if (author.length > AUTHOR_MAX_LENGTH)
    errors.author = `이름은 ${AUTHOR_MAX_LENGTH}자까지 쓸 수 있어요`;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    errors.rating = "별점을 선택해주세요";

  if (content.length < CONTENT_MIN_LENGTH)
    errors.content = `후기를 ${CONTENT_MIN_LENGTH}자 이상 남겨주세요`;
  else if (content.length > CONTENT_MAX_LENGTH)
    errors.content = `후기는 ${CONTENT_MAX_LENGTH}자까지 쓸 수 있어요`;

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "입력하신 내용을 다시 확인해주세요",
      errors,
    };
  }

  addReview({ productId, author, rating, content });

  // 상세 페이지의 리뷰 목록과, 카드에 붙는 별점 요약을 함께 갱신합니다.
  revalidatePath("/products/[productId]", "page");
  revalidatePath("/products");
  revalidatePath("/");

  return { status: "success" };
}
