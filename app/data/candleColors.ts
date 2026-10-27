import { ProductColor } from "@/app/context/CartContext";

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
 *
 * baseHex는 상품 사진의 본체 대표색(Y), targetHex는 만들고 싶은 색(C)입니다.
 */
export function recolorMatrix(baseHex: string, targetHex: string): string {
  const base = hexToRgb(baseHex).map((v) => v / 255);
  const target = hexToRgb(targetHex).map((v) => v / 255);
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

/** 초록다움 = G - (R+B)/2. 초록 부엉이 본체를 고릅니다. */
const GREEN_SCORE: [number, number, number] = [-0.5, 1, -0.5];

/** 노랑다움 = (R+G)/2 - B. 노란 치즈 본체를 고릅니다. */
const YELLOW_SCORE: [number, number, number] = [0.5, 0.5, -1];

/**
 * 본체만 1, 나머지는 0이 되는 알파 마스크용 feColorMatrix 값.
 *
 * score로 "본체다움"을 재서 lo~hi 구간을 0~1로 폅니다.
 * lo·hi는 사진마다 픽셀을 실측해 끈과 본체 사이 골짜기에서 잡았습니다.
 * 이렇게 자르면 면 끈·흰 배경·바닥 그림자가 모두 마스크 밖으로 빠지고,
 * 경계 픽셀은 중간값이 나와 그대로 부드럽게 섞입니다.
 */
function bodyMaskMatrix(
  score: [number, number, number],
  lo: number,
  hi: number
): string {
  const s = 1 / (hi - lo);
  const alphaRow = [...score.map((w) => w * s), 0, -lo * s];
  return [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], alphaRow]
    .flat()
    .map((n) => Number(n.toFixed(4)))
    .join(" ");
}

type ColorSpec = { id: string; label: string; hex: string };

/** 사용자가 고를 수 있는 캔들 색상. 상품마다 이 중 하나가 원본 사진 색입니다. */
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
  { id: "ivory", label: "아이보리", hex: "#efe0c3" },
];

export type CandleFilter = {
  id: string;
  matrix: string;
  /** 있으면 이 마스크가 1인 곳(본체)에만 색을 바꿉니다. */
  maskMatrix?: string;
};

export type CandlePalette = {
  colors: ProductColor[];
  filters: CandleFilter[];
};

/**
 * 상품 사진의 본체색(baseHex)을 기준으로 색상 옵션 한 벌을 만듭니다.
 * 변환식이 사진 색에 묶여 있어서 상품마다 별도의 필터가 필요합니다.
 *
 * originalId 색은 사진 그대로라 필터를 걸지 않고,
 * 스와치도 팔레트 기본값 대신 실제 사진 색을 보여줍니다.
 *
 * maskMatrix를 주면 본체 밖(부엉이 캔들의 면 끈처럼)은 원본 색 그대로 둡니다.
 */
function createPalette(
  key: string,
  baseHex: string,
  originalId: string,
  maskMatrix?: string
): CandlePalette {
  const filterId = (colorId: string) => `candle-color-${key}-${colorId}`;

  const colors = SPECS.map((spec) =>
    spec.id === originalId
      ? { id: spec.id, label: spec.label, swatch: baseHex }
      : {
          id: spec.id,
          label: spec.label,
          swatch: spec.hex,
          filter: `url(#${filterId(spec.id)})`,
        }
  );

  const filters = SPECS.filter((spec) => spec.id !== originalId).map(
    (spec) => ({
      id: filterId(spec.id),
      matrix: recolorMatrix(baseHex, spec.hex),
      maskMatrix,
    })
  );

  return { colors, filters };
}

/**
 * 치즈 캔들 사진에서 샘플링한 본체 대표색 rgb(239,203,117).
 * 실측: 흰 면 심지는 노랑다움 최대 0.149, 본체는 최소 0.237.
 */
export const CHEESE_CANDLE = createPalette(
  "cheese",
  "#efcb75",
  "yellow",
  bodyMaskMatrix(YELLOW_SCORE, 0.15, 0.23)
);

/**
 * 부엉이 캔들 사진에서 샘플링한 본체 대표색 rgb(137,163,66).
 * 실측: 크림색 면 끈은 초록다움 최대 0.094, 본체는 하위 1%가 0.153.
 */
export const OWL_CANDLE = createPalette(
  "owl",
  "#89a342",
  "green",
  bodyMaskMatrix(GREEN_SCORE, 0.095, 0.15)
);

/**
 * 컵케이크 캔들 사진에서 샘플링한 본체 대표색 rgb(143,162,66).
 * 실측: 면 끈은 초록다움 최대 0.077, 본체는 하위 1%가 0.141.
 *
 * 심지 밑 금속 원반은 0.086~0.194로 그 사이에 걸쳐 있습니다.
 * 원반까지 확실히 지키려고 경계를 올리면 머핀의 깊은 결이 원래 색으로 남아 얼룩지므로,
 * 본체 쪽을 우선해 0.08에서 자릅니다.
 * 원반은 중앙값이 경계 바로 위라 결과적으로 거의 그대로 남습니다(변화량 중앙값 1/255).
 */
export const CUPCAKE_CANDLE = createPalette(
  "cupcake",
  "#8fa242",
  "green",
  bodyMaskMatrix(GREEN_SCORE, 0.08, 0.14)
);

/**
 * 필라·테디베어 캔들은 원본 사진 자체가 아이보리색이라 originalId를 ivory로 둡니다.
 *
 * 심지가 본체와 톤이 가까워 색상 기준(YELLOW_SCORE류)으로도, 사진 속 좌표
 * 기준(사각 영역)으로도 깨끗이 못 갈랐습니다. 좌표 기준은 상품 카드(4:5)처럼
 * object-fit:cover가 사진을 가로로 잘라내는 화면에서는 필터가 보는 좌표와
 * 실제 화면 좌표가 어긋나 버그가 났습니다. 그래서 이 세 상품은 색상 매트릭스로
 * 사진 전체를 통째로 재색상화하고(심지도 같이 바뀜), 심지 부분만 원본 그대로
 * 오려낸 이미지를 그 위에 필터 없이 얹는 방식(wickImage)으로
 * 심지를 보호합니다. 오려내는 작업은 scripts/extract-wick.js 참고.
 */
export const TWIST_CANDLE = createPalette("twist", "#dcbd8a", "ivory");
export const RIBBED_CANDLE = createPalette("ribbed", "#dbbc8d", "ivory");
export const PLAIN_CANDLE = createPalette("plain", "#dfc8ad", "ivory");
/** 테디베어는 심지가 흰 실이라(거의 무채색) 어떤 색으로 바꿔도 그대로라 오려낼 필요가 없습니다. */
export const TEDDY_BEAR_CANDLE = createPalette("teddy", "#dfb780", "ivory");

/**
 * 아이보리 왁스에 흰 면 끈 심지를 단 상품들. 사진에서 샘플링한 본체 대표색입니다.
 *
 * 네 상품 모두 심지가 흰 면 끈이라 거의 무채색입니다. 재색상화 행렬은
 * M·(t,t,t) = (t,t,t)라서 무채색은 그대로 남으므로(실측 추종률 5~8%) 심지를
 * 따로 오려내지 않습니다.
 */
export const EGG_CANDLE = createPalette("egg", "#ebd6b0", "ivory");
export const BALL_CANDLE = createPalette("ball", "#eed8b3", "ivory");
export const SHELL_CANDLE = createPalette("shell", "#f1dbbc", "ivory");
export const GUMMY_BEAR_CANDLE = createPalette("gummy", "#edd4ac", "ivory");

/**
 * 마카롱은 사진 자체가 진한 분홍(#e7506c)이라 originalId를 pink로 둡니다.
 * 분홍 스와치는 팔레트 기본 분홍 대신 사진 그대로의 색을 보여줍니다.
 *
 * 사이의 크림 필링은 옅은 분홍이라 색 변화의 20% 정도를 따라갑니다.
 * 면적이 작고 그만큼 몸통보다 훨씬 연하게 남아서 그대로 뒀습니다.
 */
export const MACARON_CANDLE = createPalette("macaron", "#e7506c", "pink");

/** 필터 정의(<svg><defs>)를 만들 때 쓰는 전체 목록. */
export const CANDLE_COLOR_FILTERS = [
  ...CHEESE_CANDLE.filters,
  ...OWL_CANDLE.filters,
  ...CUPCAKE_CANDLE.filters,
  ...TWIST_CANDLE.filters,
  ...RIBBED_CANDLE.filters,
  ...PLAIN_CANDLE.filters,
  ...TEDDY_BEAR_CANDLE.filters,
  ...EGG_CANDLE.filters,
  ...BALL_CANDLE.filters,
  ...SHELL_CANDLE.filters,
  ...GUMMY_BEAR_CANDLE.filters,
  ...MACARON_CANDLE.filters,
];
