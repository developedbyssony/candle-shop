import { ProductColor } from "@/app/context/CartContext";

/**
 * 치즈 캔들 사진에서 샘플링한 본체 대표색(rgb 239,203,117).
 * 이 색을 기준으로 다른 색 캔들 미리보기를 만듭니다.
 */
export const BASE_CANDLE_RGB: [number, number, number] = [239, 203, 117];

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

/**
 * 흰 배경은 그대로 두고 캔들 본체만 목표 색으로 바꾸는 feColorMatrix 값.
 *
 * M = I + (C - Y) ⊗ v,  v = (k, 0, -k),  k = 1 / (Y.r - Y.b)
 * 이면 M·(1,1,1) = (1,1,1) 이라 흰 배경과 심지는 그대로 남고,
 * M·Y = C 라서 본체는 정확히 목표 색이 됩니다.
 * 선형 변환이므로 그림자와 하이라이트의 명암도 자연스럽게 따라옵니다.
 * (hue-rotate로는 노란 캔들에서 파랑·남색·검정을 만들 수 없어 이 방식을 씁니다.)
 */
export function recolorMatrix(hex: string): string {
  const base = BASE_CANDLE_RGB.map((v) => v / 255);
  const target = hexToRgb(hex).map((v) => v / 255);
  const k = 1 / (base[0] - base[2]);

  const rows = [0, 1, 2].map((i) => {
    const d = (target[i] - base[i]) * k;
    const row = [d, 0, -d, 0, 0];
    row[i] += 1;
    return row;
  });

  return [...rows, [0, 0, 0, 1, 0]]
    .flat()
    .map((n) => Number(n.toFixed(4)))
    .join(" ");
}

type ColorSpec = { id: string; label: string; hex: string };

/** 사용자가 고를 수 있는 캔들 색상. 노랑이 원본 사진 색입니다. */
const SPECS: ColorSpec[] = [
  { id: "red", label: "빨강", hex: "#d4453e" },
  { id: "orange", label: "주황", hex: "#e8842f" },
  { id: "yellow", label: "노랑", hex: "#efcb75" },
  { id: "green", label: "초록", hex: "#4f9e57" },
  { id: "blue", label: "파랑", hex: "#3f74c4" },
  { id: "navy", label: "남색", hex: "#2b3f7e" },
  { id: "purple", label: "보라", hex: "#8256b8" },
  { id: "pink", label: "핑크", hex: "#ec8fb0" },
  { id: "black", label: "검정", hex: "#35322e" },
];

export const filterId = (colorId: string) => `candle-color-${colorId}`;

/** 필터 정의(<svg><defs>)를 만들 때 쓰는 목록. 원본 색인 노랑은 필터가 필요 없습니다. */
export const CANDLE_COLOR_FILTERS = SPECS.filter(
  (spec) => spec.id !== "yellow"
).map((spec) => ({ id: filterId(spec.id), matrix: recolorMatrix(spec.hex) }));

export const CANDLE_COLORS: ProductColor[] = SPECS.map((spec) => ({
  id: spec.id,
  label: spec.label,
  swatch: spec.hex,
  filter: spec.id === "yellow" ? undefined : `url(#${filterId(spec.id)})`,
}));
