import type { Review } from "@/app/lib/reviews";

/**
 * 서버가 시작될 때 미리 들어가 있는 리뷰입니다.
 * 지금은 비어 있어서 상품마다 "아직 등록된 후기가 없어요"가 보이고,
 * 사이트에서 등록한 후기만 쌓입니다.
 * 실제 후기를 미리 넣어두려면 이 배열에 추가하세요.
 */
export const SEED_REVIEWS: Review[] = [];
