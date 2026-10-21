import Image from "next/image";
import Link from "next/link";
import RecordAlbum from "@/app/components/RecordAlbum";
import ThemeToggle from "@/app/components/ThemeToggle";

/**
 * 워드마크를 글자 단위로 쪼개 시간차를 두고 등장시킵니다.
 * 스크린리더에는 h1 안의 sr-only 텍스트만 읽히도록 이쪽은 숨깁니다.
 * 'i'는 점 없는 ı로 바꾸고 그 자리에 불꽃을 얹습니다(모션 로고).
 */
function Word({ text, start, igniteAt }: { text: string; start: number; igniteAt?: number }) {
  return (
    <span aria-hidden className="block">
      {[...text].map((letter, index) => (
        <span
          key={index}
          className={`animate-letter ${letter === "i" && igniteAt ? "relative" : ""}`}
          style={{ animationDelay: `calc(var(--intro-delay, 0ms) + ${start + index * 55}ms)` }}
        >
          {letter === "i" && igniteAt ? (
            <>
              ı
              <Flame delay={igniteAt} />
            </>
          ) : (
            letter
          )}
        </span>
      ))}
    </span>
  );
}

/**
 * i 점 자리의 심지와 작은 불꽃. 불꽃은 다크 모드에서만 켜지고(라이트 모드는 심지만 남은 꺼진 촛불),
 * 글자가 다 떠오르면 한 번 '톡' 켜진 뒤(flame-ignite) 가만히 있습니다.
 * 원래 i 점보다 조금 큰 크기이고, 윗부분이 오른쪽으로 살짝 휘어 올라간 비대칭 모양입니다.
 * 끝을 둥글게 다듬어 뾰족해 보이지 않게 했습니다. 크기·위치는 글자 크기(em)를 따라갑니다.
 */
function Flame({ delay }: { delay: number }) {
  return (
    <>
      {/* 심지: 늘 보입니다. 라이트 모드(불 켜진 방)에서는 불꽃 없이 심지만 남아 꺼진 촛불이 됩니다. */}
      <span
        aria-hidden
        className="absolute rounded-full bg-current"
        style={{ left: "50%", bottom: "0.53em", width: "0.03em", height: "0.1em", transform: "translateX(-50%)" }}
      />
      <span
        className="flame-ignite absolute left-1/2 bottom-[0.6em] w-[0.15em] h-[0.22em]"
        style={{ animationDelay: `calc(var(--intro-delay, 0ms) + ${delay}ms)` }}
      >
        {/* 불꽃은 다크 모드에서만 켜집니다(globals.css의 .flame-light). */}
        <svg viewBox="0 0 20 30" className="flame-light block w-full h-full overflow-visible">
          <path
            d="M14.2 1C15.6 1 14 5.6 16.2 9.6C17.6 12.2 18.2 15 18.2 19.6A8.2 8.2 0 0 1 1.8 19.6C1.8 13 6.6 10 10.4 6.2C12.2 4.4 13 1 14.2 1Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </>
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

/** 로고 캔들 심볼 */
function CandleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c.8 2.2 2 3.1 2 4.6a2 2 0 0 1-4 0C10 5.1 11.2 4.2 12 2z" />
      <path d="M11.6 8.3h.8v1.5h-.8z" />
      <path d="M10.4 9.6h3.2a1.2 1.2 0 0 1 1.2 1.2v9.9a1.2 1.2 0 0 1-1.2 1.2h-3.2a1.2 1.2 0 0 1-1.2-1.2v-9.9a1.2 1.2 0 0 1 1.2-1.2z" />
    </svg>
  );
}

/** 메모를 집어 둔 은색 클립 */
function PaperClip({ className }: { className?: string }) {
  const d = "M8 20V50a5 5 0 0 0 10 0V12a8 8 0 0 0-16 0v40a10 10 0 0 0 20 0V22";
  return (
    <svg viewBox="-1 -1 26 66" fill="none" className={className} aria-hidden>
      <path d={d} stroke="#8f948f" strokeWidth="2.4" strokeLinecap="round" />
      <path d={d} stroke="#eef0ec" strokeWidth="0.8" strokeLinecap="round" transform="translate(-0.5 -0.5)" />
    </svg>
  );
}

/**
 * 오래된 인화지처럼 가장자리를 잘게 들쭉날쭉 자르는 clip-path.
 * 서버와 브라우저에서 같은 모양이 나오도록 고정된 씨앗값으로 만듭니다.
 */
function deckleEdge(seed: number, step = 2.5, depth = 1.2) {
  let x = seed;
  const rand = () => (((x = (x * 9301 + 49297) % 233280) / 233280) * depth).toFixed(2);
  const pts: string[] = [];
  for (let t = 0; t < 100; t += step) pts.push(`${t}% ${rand()}%`);
  for (let t = 0; t < 100; t += step) pts.push(`${100 - +rand()}% ${t}%`);
  for (let t = 100; t > 0; t -= step) pts.push(`${t}% ${100 - +rand()}%`);
  for (let t = 100; t > 0; t -= step) pts.push(`${rand()}% ${t}%`);
  return `polygon(${pts.join(", ")})`;
}

const DECKLE_PRINT = deckleEdge(7);
const DECKLE_NOTE = deckleEdge(3, 4, 1.6);

// 오른쪽·아래 가장자리를 들쭉날쭉하게 잘라 손으로 찢은 사진처럼 보이게 합니다.
const TORN_EDGE =
  "polygon(0 0, 100% 0, 98% 6%, 100% 12%, 97% 19%, 99.5% 27%, 96.5% 35%, 99% 44%, 97% 52%, 100% 61%, 97.5% 70%, 99% 79%, 96.5% 88%, 99% 94%, 95% 97%, 90% 99.5%, 82% 97.5%, 73% 100%, 64% 97.5%, 55% 99.5%, 46% 97%, 37% 100%, 28% 97.5%, 19% 99.5%, 10% 97%, 0 100%)";

// 워드마크 13글자가 다 떠오른 뒤(160ms + 13×55ms) 0.7초 쉬고 불꽃과 뒤의 빛이 켜집니다.
const IGNITE_AT = 160 + 13 * 55 + 700;

/**
 * 메인 첫 화면. 보내주신 사진 다섯 장을 스크랩북처럼 흩어 붙인 콜라주입니다.
 * 모바일: 인사말 아래에 콜라주. 데스크톱: 왼쪽 인사말, 오른쪽 콜라주.
 * 첫 화면 높이를 꽉 채우고(100svh: 모바일 주소창이 나타났다 사라져도 높이가 튀지 않는 100vh) 내용은 세로 가운데에 둡니다.
 */
export default function HeroCollage() {
  return (
    <section className="relative isolate max-w-6xl mx-auto px-5 py-10 min-h-[100svh] flex flex-col justify-center">
      {/* 다크모드 토글: 히어로 섹션 구석에 붙어 있어 스크롤해 섹션을 벗어나면 함께 사라집니다. */}
      <ThemeToggle />
      <div className="hero-stack w-full md:grid md:grid-cols-12 md:gap-10 md:items-center">
        {/* ── 인사말 ─────────────────────────────────────────── */}
        <div className="hero-intro @container mb-10 md:mb-0 md:col-span-6">
          <h1
            className="relative isolate font-display !font-semibold !tracking-[0.06em] leading-[0.88] mb-7 md:mb-10 text-[color:var(--color-ink)]"
            // "evening"이 글자 크기의 약 4배 너비라(자간 포함), 칸의 21%로 두면 칸 너비의 약 84%를 차지합니다.
            style={{ fontSize: "var(--hero-title-size, 21cqi)" }}
          >
            <span className="sr-only">evening candle</span>
            {/* 불꽃(i 점) 자리를 중심으로 글자 뒤에 번지는 둥근 빛 */}
            <span
              aria-hidden
              className="wordmark-glow absolute -z-10 rounded-full"
              // 불꽃 중심(2.54em, 0.17em)에서 반지름(1.3em)만큼 뺀 자리에 놓아, 상자 가운데 = 불꽃 중심이 되게 합니다.
              // 그래서 켜지고 꺼질 때 크기가 바뀌어도 불꽃 자리에서 그대로 커지고 작아집니다.
              style={{
                left: "calc(2.54em - 1.3em)",
                top: "calc(0.17em - 1.3em)",
                width: "2.6em",
                height: "2.6em",
                animationDelay: `calc(var(--intro-delay, 0ms) + ${IGNITE_AT}ms)`,
              }}
            />
            <Word text="evening" start={160} igniteAt={IGNITE_AT} />
            <Word text="candle" start={160 + 7 * 55} />
          </h1>
          {/* 로고 아래 부제. 글자 칸 너비에 맞춰 커집니다(모바일 14px ~ 데스크톱 약 18px). */}
          <p
            className="eyebrow hero-subtitle mb-10 md:mb-16 animate-fade-up"
            style={{
              fontSize: "var(--hero-subtitle-size, clamp(0.875rem, 3.4cqi, 1.25rem))",
              animationDelay: "calc(var(--intro-delay, 0ms) + 700ms)",
            }}
          >
            Handmade Soy Candle
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: "calc(var(--intro-delay, 0ms) + 900ms)" }}>
            <Link href="/products" className="btn-solid">
              컬렉션 보기
            </Link>
            <Link href="#story" className="btn-outline">
              브랜드 이야기
            </Link>
          </div>
        </div>

        {/* ── 콜라주 ─────────────────────────────────────────── */}
        <div className="md:col-span-6">
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

            {/* 책 읽는 저녁 — 가운데 큰 빈티지 인화 사진(바랜 테두리 + 마스킹 테이프) */}
            <Piece className="left-[31%] top-[3%] w-[38%] z-10" rotate={-2.5} delay={120}>
              <div className="relative drop-shadow-[0_16px_22px_rgba(30,27,23,0.22)]">
                <div className="aged-paper p-[5%] pb-[9%]" style={{ clipPath: DECKLE_PRINT }}>
                  <div className="vintage-photo relative aspect-[9/13] overflow-hidden">
                    <Image
                      src="/home/evening-reading.webp"
                      alt="책 옆에서 은은하게 타오르는 캔들과 린넨 이불"
                      fill
                      priority
                      className="object-cover object-[50%_25%]"
                      sizes="(max-width: 767px) 40vw, 220px"
                    />
                  </div>
                </div>
                <span aria-hidden className="masking-tape -top-2.5 left-[29%] w-[42%] rotate-[3deg]" />
              </div>
            </Piece>

            {/* 브랜드 앱 아이콘 */}
            <Piece className="left-[15%] top-[12%] w-[13%] z-20" rotate={-9} delay={260}>
              <div className="aspect-square rounded-[24%] bg-[color:var(--color-deep)] grid place-items-center shadow-[0_10px_20px_rgba(30,27,23,0.25)]">
                <CandleMark className="w-[52%] h-[52%] text-[#f3e7cf]" />
              </div>
            </Piece>

            {/* 불꽃 클로즈업 — 오른쪽 위 타원 액자 */}
            <Piece className="right-[2%] top-[3%] w-[23%] z-10" rotate={4} delay={340}>
              <OvalPhoto src="/home/flame-close.webp" alt="가까이서 본 캔들 불꽃" />
            </Piece>

            {/* 촛대 그림 — 왼쪽 타원 액자 */}
            <Piece className="left-[2%] top-[25%] w-[23%] z-20" rotate={-3} delay={420}>
              <OvalPhoto src="/home/candlestick-painting.webp" alt="노란 물감으로 그린 촛대 그림" />
            </Piece>

            {/* 성냥으로 불을 붙이는 손 — 찢은 빈티지 사진 + 노란 동그라미 낙서 */}
            <Piece className="left-[3%] top-[54%] w-[42%] z-30" rotate={-4} delay={500}>
              <div className="relative drop-shadow-[0_14px_22px_rgba(30,27,23,0.2)]">
                <div className="vintage-photo relative aspect-[4/5]" style={{ clipPath: TORN_EDGE }}>
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
                <span aria-hidden className="masking-tape -top-1.5 -left-3 w-[36%] rotate-[-28deg]" />
              </div>
            </Piece>

            {/* 색색 캔들 일러스트 — 레코드 판이 삐져나온 앨범 재킷 */}
            <Piece className="left-[49%] top-[44%] w-[36%] z-20" rotate={3} delay={580}>
              <RecordAlbum />
            </Piece>

            {/* 클립으로 집어 둔 줄 노트 메모 */}
            <Piece className="left-[50%] top-[73%] w-[40%] z-30" rotate={-3} delay={700}>
              <div className="relative drop-shadow-[0_8px_14px_rgba(30,27,23,0.14)]">
                <div className="ruled-paper pl-[18%] pr-[8%] py-[9%]" style={{ clipPath: DECKLE_NOTE }}>
                  {/* 직접 쓴 캘리그래피라 이미지로 넣습니다(배경 투명, 20KB). */}
                  <Image
                    src="/brand/note-calligraphy.png"
                    alt="오늘 저녁엔 불을 하나 켜 두세요."
                    width={640}
                    height={499}
                    className="w-full h-auto"
                    sizes="(max-width: 767px) 30vw, 180px"
                  />
                </div>
                <PaperClip className="absolute -top-6 right-5 w-5 md:w-6 h-auto rotate-[6deg] drop-shadow-[0_2px_1px_rgba(30,27,23,0.25)]" />
              </div>
            </Piece>
          </div>
        </div>
      </div>
    </section>
  );
}
