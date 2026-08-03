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
        {CANDLE_COLOR_FILTERS.map(({ id, matrix, maskMatrix }) => (
          <filter key={id} id={id} colorInterpolationFilters="sRGB">
            {maskMatrix ? (
              <>
                {/* 본체만 알파 1인 마스크를 만들어, 색을 바꾼 결과를 그 안에만 남기고
                    원본 위에 얹습니다. 마스크 밖(끈·배경·그림자)은 원본 그대로입니다. */}
                <feColorMatrix
                  in="SourceGraphic"
                  type="matrix"
                  values={maskMatrix}
                  result="bodyMask"
                />
                <feColorMatrix
                  in="SourceGraphic"
                  type="matrix"
                  values={matrix}
                  result="recolored"
                />
                <feComposite
                  in="recolored"
                  in2="bodyMask"
                  operator="in"
                  result="bodyOnly"
                />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="bodyOnly" />
                </feMerge>
              </>
            ) : (
              <feColorMatrix type="matrix" values={matrix} />
            )}
          </filter>
        ))}
      </defs>
    </svg>
  );
}
