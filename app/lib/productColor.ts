import { Product } from "@/app/context/CartContext";

/**
 * 처음 보여줄 색상의 인덱스. 상품 카드와 상세 페이지가 같은 색으로 시작하도록
 * 한 곳에 둡니다. defaultColorId가 없거나 목록에 없으면 첫 번째 색을 씁니다.
 */
export function getInitialColorIndex(product: Product) {
  const index =
    product.colors?.findIndex((color) => color.id === product.defaultColorId) ??
    -1;
  return index < 0 ? 0 : index;
}
