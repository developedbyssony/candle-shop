import { CANDLE_COLOR_FILTERS } from "@/app/data/candleColors";

/**
 * 캔들 색상 미리보기용 SVG 필터 정의.
 * 상품 이미지가 나오는 모든 페이지에서 참조하므로 루트 레이아웃에 한 번만 둡니다.
 */
export default function CandleColorFilters() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <defs>
        {CANDLE_COLOR_FILTERS.map(({ id, matrix }) => (
          <filter key={id} id={id} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={matrix} />
          </filter>
        ))}
      </defs>
    </svg>
  );
}
