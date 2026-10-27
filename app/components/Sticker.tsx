/**
 * 앨범에 풀로 붙인 종이 스티커 하나. 칼선 여백 없이 색 종이 그대로 붙어 있고,
 * 붙일 때 생긴 구김(.sticker-crease)과 글자 장식(가는 선·둘레 글씨)만 모양마다 다르게 둡니다.
 * - circle: 장식 없는 동그라미
 * - ring:   동그라미 + 가장자리를 도는 작은 글씨와 안쪽 가는 원
 * - square: 장식 없는 둥근 네모
 * - wide:   가로로 긴 둥근 네모 + 글자 밑 가는 선
 * 구김은 노이즈 필터 없이 그라데이션 몇 줄로만 그리고, crease 번호마다 각도·자리를 달리해
 * 스티커끼리 같은 구김이 반복되지 않게 합니다. 크기·기울기는 부르는 쪽 className에서 정합니다.
 */
type Shape = "circle" | "ring" | "square" | "wide";
// 마우스를 올릴 때 움직임. 스티커마다 다른 것을 줍니다(globals.css의 .sticker-motion-*).
type Motion = "lift" | "peel" | "spin" | "press" | "swing";

// 둘레 글씨는 사이트에 이미 적힌 문구만 씁니다(브랜드 이름·HANDMADE SOY CANDLE).
const RING_TEXT = "evening candle · handmade soy candle · evening candle · handmade soy candle · ";

export default function Sticker({
  shape,
  color,
  crease,
  motion,
  children,
  className = "",
}: {
  shape: Shape;
  /** 스티커 종이색(오래된 인쇄물처럼 채도를 살짝 누른 색) */
  color: string;
  /** 구김 모양 번호(0~4). 스티커마다 다른 번호를 줍니다. */
  crease: number;
  /** 마우스를 올릴 때 움직임. spin은 둘레 글씨가 있는 ring에서만 보입니다. */
  motion: Motion;
  children: React.ReactNode;
  className?: string;
}) {
  const round = shape === "circle" || shape === "ring";

  return (
    <span
      className={`sticker sticker-crease-${crease} sticker-motion-${motion} ${round ? "aspect-square rounded-full" : shape === "square" ? "aspect-square rounded-[14%]" : "rounded-[12px] px-5 py-3.5 md:px-7 md:py-4"} ${className}`}
      style={{ background: color }}
    >
      {shape === "ring" && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
          <defs>
            <path id="sticker-ring" d="M50 50m-41 0a41 41 0 1 1 82 0a41 41 0 1 1 -82 0" />
          </defs>
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.7" />
          <text className="sticker-ring-text" fill="currentColor" fillOpacity="0.7">
            <textPath href="#sticker-ring" textLength="257" lengthAdjust="spacing">
              {RING_TEXT}
            </textPath>
          </text>
        </svg>
      )}

      {/* ring은 아래쪽 둘레 글씨가 눈에 더 무겁게 걸려, 가운데 글자를 살짝 올려야 원 한가운데에 앉아 보입니다. */}
      <span className={`relative flex flex-col items-center ${shape === "ring" ? "-translate-y-[0.18em]" : ""}`}>
        <span>{children}</span>
        {shape === "wide" && <span aria-hidden className="block w-full h-px mt-1.5 bg-current opacity-70" />}
      </span>
    </span>
  );
}
