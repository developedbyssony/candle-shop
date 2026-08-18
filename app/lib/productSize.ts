import type { ProductSize } from "@/app/context/CartContext";

/** "높이 4.5cm · 넓이 7.5cm" 형태로 보여줍니다. */
export function formatSize(size: ProductSize) {
  return `높이 ${size.height}cm · 넓이 ${size.width}cm`;
}
