import Image from "next/image";
import Link from "next/link";

/**
 * 워드마크를 글자 단위로 쪼개 시간차를 두고 등장시킵니다.
 * 스크린리더에는 h1 안의 sr-only 텍스트만 읽히도록 이쪽은 숨깁니다.
 */
function Word({ text, start }: { text: string; start: number }) {
  return (
    <span aria-hidden className="block">
      {[...text].map((letter, index) => (
        <span
          key={index}
          className="animate-letter"
          style={{ animationDelay: `${start + index * 55}ms` }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

/**
 * 콜라주 조각 한 개. 위치·크기는 콜라주 상자 기준 %입니다.
 * 바깥 div는 등장 애니메이션을, 가운데 div는 마우스를 올렸을 때 살짝 뜨는 효과를,
 * 안쪽 div는 기울기를 맡습니다. 한 요소에 transform을 겹쳐 주면 서로 덮어써서 나눴습니다.
 */
function Piece({
  className,
  rotate,
  delay,
  children,
}: {
  className: string;
  rotate: number;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute animate-collage-in ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="transition-transform duration-500 ease-out md:hover:-translate-y-1.5">
        <div style={{ transform: `rotate(${rotate}deg)` }}>{children}</div>
      </div>
    </div>
  );
}

/** 액자처럼 크림색 여백과 얇은 금테를 두른 타원 사진 */
function OvalPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="rounded-[50%] bg-[#fbf7ef] p-[7%] border border-[#d9cbb3] shadow-[0_10px_24px_rgba(30,27,23,0.16)]">
      <div className="relative aspect-[3/4] rounded-[50%] overflow-hidden">
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 767px) 24vw, 140px" />
      </div>
    </div>
  );
}

/** 로고 캔들 심볼(Navbar와 같은 모양) */
function CandleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c.8 2.2 2 3.1 2 4.6a2 2 0 0 1-4 0C10 5.1 11.2 4.2 12 2z" />
      <path d="M11.6 8.3h.8v1.5h-.8z" />
      <path d="M10.4 9.6h3.2a1.2 1.2 0 0 1 1.2 1.2v9.9a1.2 1.2 0 0 1-1.2 1.2h-3.2a1.2 1.2 0 0 1-1.2-1.2v-9.9a1.2 1.2 0 0 1 1.2-1.2z" />
    </svg>
  );
}

/** 종이에 찍은 듯한 여덟 갈래 별 */
function Asterisk({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {[0, 45, 90, 135].map((angle) => (
        <line
          key={angle}
          x1="12"
          y1="2"
          x2="12"
          y2="22"
          stroke="#c8875e"
          strokeWidth="2.6"
          strokeLinecap="round"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  );
}

// 오른쪽·아래 가장자리를 들쭉날쭉하게 잘라 손으로 찢은 사진처럼 보이게 합니다.
const TORN_EDGE =
  "polygon(0 0, 100% 0, 98% 6%, 100% 12%, 97% 19%, 99.5% 27%, 96.5% 35%, 99% 44%, 97% 52%, 100% 61%, 97.5% 70%, 99% 79%, 96.5% 88%, 99% 94%, 95% 97%, 90% 99.5%, 82% 97.5%, 73% 100%, 64% 97.5%, 55% 99.5%, 46% 97%, 37% 100%, 28% 97.5%, 19% 99.5%, 10% 97%, 0 100%)";

/**
 * 콜라주 사이사이에 붙이는 픽셀 이모지.
 * Mona12 Color Emoji 글꼴의 이모지를 원래 픽셀 크기 그대로 PNG로 떠 둔 것입니다(/public/stickers, 장당 300바이트 미만).
 * w·h는 원본 픽셀 수이고, 화면에서는 정수 배(모바일 2배·데스크톱 3배, big은 3·4배)로 키워 픽셀이 또렷하게 보이게 합니다.
 */
const PIXEL_STICKERS = [
  { name: "moon", w: 10, h: 10, className: "left-[25%] top-[1%]", rotate: -10, delay: 900 },
  { name: "sparkles", w: 11, h: 11, className: "left-[66%] top-[1%]", rotate: 8, delay: 980 },
  { name: "dizzy", w: 11, h: 11, className: "right-[3%] top-[40%]", rotate: 6, delay: 1060, big: true },
  { name: "herb", w: 11, h: 11, className: "left-[24%] top-[47%]", rotate: -14, delay: 1140 },
  { name: "letter", w: 11, h: 9, className: "left-[40%] top-[91%]", rotate: -8, delay: 1220 },
  { name: "fire", w: 10, h: 11, className: "right-[1%] top-[75%]", rotate: 10, delay: 1300 },
];

/**
 * 메인 첫 화면.보내주신 사진 다섯 장을 스크랩북처럼 흩어 붙인 콜라주입니다.
 * 모바일: 인사말 아래에 콜라주. 데스크톱: 왼쪽 인사말, 오른쪽 콜라주.
 */
export default function HeroCollage() {
  return (
    <section className="relative max-w-6xl mx-auto px-5 pt-10 pb-16 md:pt-14 md:pb-24">
      <div className="md:grid md:grid-cols-12 md:gap-10 md:items-center">
        {/* ── 인사말 ─────────────────────────────────────────── */}
        <div className="md:col-span-5 mb-10 md:mb-0">
          <p className="eyebrow mb-3 animate-fade-up" style={{ animationDelay: "40ms" }}>
            Handmade Soy Candle
          </p>
          <h1
            className="font-display leading-[0.88] mb-5 text-[color:var(--color-ink)]"
            style={{ fontSize: "clamp(3.1rem, 14vw, 5rem)" }}
          >
            <span className="sr-only">evening candle</span>
            <Word text="evening" start={160} />
            <Word text="candle" start={160 + 7 * 55} />
          </h1>
          <p
            className="text-[14px] md:text-[15px] leading-[1.85] mb-7 text-pretty max-w-sm animate-fade-up text-[color:var(--color-muted)]"
            style={{ animationDelay: "820ms" }}
          >
            책장을 넘기는 소리, 이불의 포근함, 작은 불빛 하나.
            <br />
            당신의 저녁이 조금 더 따뜻해지도록.
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: "940ms" }}>
            <Link href="/products" className="btn-solid">
              컬렉션 보기
            </Link>
            <Link href="#story" className="btn-outline">
              브랜드 이야기
            </Link>
          </div>
        </div>

        {/* ── 콜라주 ─────────────────────────────────────────── */}
        <div className="md:col-span-7">
          <div className="relative w-full max-w-[560px] mx-auto aspect-[1/1.2]">
            {/* 배경에 흘려 그은 가는 곡선 */}
            <svg
              viewBox="0 0 100 120"
              preserveAspectRatio="none"
              fill="none"
              className="absolute inset-0 w-full h-full"
              aria-hidden
            >
              {[
                "M8 6C30 -2 58 8 66 30S54 70 74 82s28 4 24 26",
                "M2 52c10-16 30-18 38-6s-2 30 12 36 34-8 46-2",
                "M60 4c22 2 36 16 34 36",
              ].map((d) => (
                <path
                  key={d}
                  d={d}
                  stroke="var(--color-sand)"
                  strokeWidth="1.3"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {/* 책 읽는 저녁 — 가운데 큰 폴라로이드 */}
            <Piece className="left-[31%] top-[3%] w-[38%] z-10" rotate={-2.5} delay={120}>
              <div className="bg-white p-[4%] pb-[13%] shadow-[0_16px_34px_rgba(30,27,23,0.18)]">
                <div className="relative aspect-[9/13] overflow-hidden">
                  <Image
                    src="/home/evening-reading.webp"
                    alt="책 옆에서 은은하게 타오르는 캔들과 린넨 이불"
                    fill
                    priority
                    className="object-cover object-[50%_25%]"
                    sizes="(max-width: 767px) 40vw, 220px"
                  />
                </div>
                <p className="mt-[6%] text-center text-[10px] md:text-[11px] tracking-[0.08em] text-[color:var(--color-muted)]">
                  어느 저녁, 책 한 권
                </p>
              </div>
            </Piece>

            {/* 브랜드 앱 아이콘 */}
            <Piece className="left-[10%] top-[8%] w-[14%] z-20" rotate={-9} delay={260}>
              <div className="aspect-square rounded-[24%] bg-[color:var(--color-ink)] grid place-items-center shadow-[0_10px_20px_rgba(30,27,23,0.25)]">
                <CandleMark className="w-[52%] h-[52%] text-[#f3e7cf]" />
              </div>
            </Piece>

            {/* 불꽃 클로즈업 — 오른쪽 위 타원 액자 */}
            <Piece className="right-[2%] top-[3%] w-[23%] z-10" rotate={4} delay={340}>
              <OvalPhoto src="/home/flame-close.webp" alt="가까이서 본 캔들 불꽃" />
              <p className="mt-2 text-center text-[10px] md:text-[11px] text-[color:var(--color-brown)]">
                작은 불꽃
              </p>
            </Piece>

            {/* 촛대 그림 — 왼쪽 타원 액자 */}
            <Piece className="left-[2%] top-[25%] w-[23%] z-20" rotate={-3} delay={420}>
              <OvalPhoto src="/home/candlestick-painting.webp" alt="노란 물감으로 그린 촛대 그림" />
              <p className="mt-2 text-center text-[10px] md:text-[11px] text-[color:var(--color-brown)]">
                작업실의 촛대
              </p>
            </Piece>

            {/* 별표 장식 */}
            <div
              className="absolute right-[13%] top-[34%] w-[7%] animate-collage-in"
              style={{ animationDelay: "700ms" }}
            >
              <Asterisk className="w-full h-auto animate-spin-slow" />
            </div>

            {/* 성냥으로 불을 붙이는 손 — 찢은 사진 + 노란 동그라미 낙서 */}
            <Piece className="left-[3%] top-[54%] w-[42%] z-30" rotate={-4} delay={500}>
              <div className="relative drop-shadow-[0_14px_22px_rgba(30,27,23,0.2)]">
                <div className="relative aspect-[4/5]" style={{ clipPath: TORN_EDGE }}>
                  <Image
                    src="/home/morning-match.webp"
                    alt="침대에 누워 캔들에 성냥불을 붙이는 손"
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 44vw, 240px"
                  />
                </div>
                <svg
                  viewBox="0 0 100 70"
                  fill="none"
                  className="absolute left-[37%] top-[13%] w-[32%] overflow-visible"
                  aria-hidden
                >
                  <path
                    d="M58 6C34 2 8 14 6 34s22 32 48 30 42-16 40-34S70 2 44 8"
                    stroke="#f2c230"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    pathLength={1}
                    className="animate-draw"
                    style={{ animationDelay: "1300ms" }}
                  />
                </svg>
              </div>
            </Piece>

            {/* 색색 캔들 일러스트 — 레코드 판이 삐져나온 앨범 재킷 */}
            <Piece className="left-[49%] top-[53%] w-[36%] z-20" rotate={3} delay={580}>
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute top-[6%] left-[36%] w-[88%] aspect-square rounded-full shadow-[0_8px_18px_rgba(30,27,23,0.25)]"
                  style={{
                    background:
                      "radial-gradient(circle, #e8dfd0 0 13%, #1e1b17 13.5% 15%, transparent 15.5%), repeating-radial-gradient(circle, #1e1b17 0 1.5px, #2b2723 1.5px 3px)",
                  }}
                />
                <div className="relative aspect-square border-[3px] border-white shadow-[0_14px_28px_rgba(30,27,23,0.2)]">
                  <Image
                    src="/home/color-candles.webp"
                    alt="초록 바탕에 여러 색 캔들이 켜진 일러스트"
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 38vw, 210px"
                  />
                </div>
              </div>
            </Piece>

            {/* 테이프로 붙인 메모 */}
            {/* 글자 크기가 px로 고정이라 상자도 글 길이에 맞춰 줄어들게(w-max) 둡니다. */}
            <Piece className="left-[52%] top-[81%] w-max z-30" rotate={-3} delay={700}>
              <div className="relative bg-[#fffdf8] px-4 py-4 md:px-6 md:py-5 shadow-[0_8px_18px_rgba(30,27,23,0.12)]">
                <span
                  aria-hidden
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-[46%] h-4 bg-[rgba(138,158,138,0.45)] rotate-[-4deg]"
                />
                {/* 픽셀 글꼴은 정해진 크기(12px의 배수 근처)에서 가장 또렷해서 글자 크기를 px로 고정합니다. */}
                <p className="font-pixel text-[16px] md:text-[24px] leading-[1.45] text-[color:var(--color-ink)]">
                  오늘 저녁엔
                  <br />
                  불을 하나
                  <br />
                  켜 두세요.
                </p>
              </div>
            </Piece>

            {/* 픽셀 이모지 스티커 */}
            {PIXEL_STICKERS.map((sticker) => (
              <span
                key={sticker.name}
                aria-hidden
                className={`absolute z-40 animate-collage-in ${sticker.big ? "[--px:3] md:[--px:4]" : "[--px:2] md:[--px:3]"} ${sticker.className}`}
                style={{ animationDelay: `${sticker.delay}ms` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- 300바이트짜리 픽셀 그림이라 최적화가 필요 없고, 오히려 흐릿해집니다. */}
                <img
                  src={`/stickers/${sticker.name}.png`}
                  alt=""
                  width={sticker.w}
                  height={sticker.h}
                  className="block animate-bob drop-shadow-[0_3px_3px_rgba(30,27,23,0.18)]"
                  style={{
                    width: `calc(${sticker.w}px * var(--px))`,
                    height: `calc(${sticker.h}px * var(--px))`,
                    imageRendering: "pixelated",
                    rotate: `${sticker.rotate}deg`,
                    animationDelay: `${sticker.delay}ms`,
                  }}
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
