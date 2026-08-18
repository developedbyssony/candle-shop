/**
 * 리뷰의 공용 타입과 규칙.
 * 서버 저장소(reviewStore)와 클라이언트 폼이 함께 쓰므로 순수한 값만 둡니다.
 */

export type Review = {
  id: string;
  productId: number;
  /** 구매자가 직접 적는 표시 이름 */
  author: string;
  /** 1~5 정수 */
  rating: number;
  content: string;
  /** ISO 문자열 */
  createdAt: string;
};

export type ReviewSummary = {
  count: number;
  /** 소수점 한 자리로 반올림한 평균. 리뷰가 없으면 0 */
  average: number;
  /** 별점별 개수. [1점, 2점, 3점, 4점, 5점] */
  counts: [number, number, number, number, number];
};

export const EMPTY_SUMMARY: ReviewSummary = {
  count: 0,
  average: 0,
  counts: [0, 0, 0, 0, 0],
};

export const AUTHOR_MAX_LENGTH = 12;
export const CONTENT_MIN_LENGTH = 10;
export const CONTENT_MAX_LENGTH = 500;

export type ReviewFormState =
  | { status: "idle" }
  | {
      status: "error";
      message?: string;
      errors: { author?: string; rating?: string; content?: string };
    }
  | { status: "success" };

export const initialReviewState: ReviewFormState = { status: "idle" };

/**
 * "2026.08.13" 형태. 서버와 브라우저의 시간대가 달라도 결과가 같도록
 * Date로 바꾸지 않고 ISO 문자열 앞부분을 그대로 씁니다.
 */
export function formatReviewDate(createdAt: string) {
  return createdAt.slice(0, 10).replaceAll("-", ".");
}
