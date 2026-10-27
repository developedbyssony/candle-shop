import Image from "next/image";
import Link from "next/link";
import RecordAlbum from "@/app/components/RecordAlbum";
import ThemeToggle from "@/app/components/ThemeToggle";

/**
 * 워드마크를 글자 단위로 쪼개 시간차를 두고 등장시킵니다.
 * 스크린리더에는 h1 안의 sr-only 텍스트만 읽히도록 이쪽은 숨깁니다.
 * 'i'는 점 없는 ı로 바꾸고 그 자리에 불꽃을 얹습니다(모션 로고).
 */
/*
 * 글자마다 따로 떠오르게 하려고 한 글자씩 inline-block 상자로 쪼개면, 글꼴에 든 커닝(글자 짝마다 간격 보정)이
 * 상자 경계에서 끊겨 간격이 들쭉날쭉해집니다. 그래서 Playfair Display 600의 커닝값을 브라우저에서 재 두고
 * (짝 너비 - 두 글자 너비, em 단위) 앞 글자 오른쪽 여백으로 되돌려 줍니다. 로고 글꼴·굵기를 바꾸면 다시 재야 합니다.
 */
const KERNING: Record<string, number> = {
  ev: -0.008,
  ve: -0.013,
  en: -0.004,
  ng: -0.008,
  le: -0.01,
};

/*
 * 촛불이 비추듯 드러나는 워드마크: i 자리 불꽃이 먼저 켜지고, 불꽃에서 가까운 글자부터 차례로 밝아집니다.
 * 글자마다 불꽃과의 거리(글자 칸 단위)를 재서 지연을 정합니다. 둘째 줄(candle)은 줄 간격만큼 더 멀게 칩니다.
 * 왼쪽→오른쪽 순서가 아니라 빛이 번지는 모양이라, 불꽃이 글자를 비추는 이야기로 읽힙니다.
 */
const FLAME_COL = 4; // "evening"의 i
const ROW_GAP = 1.6; // 한 줄 아래 글자는 글자 1.6칸만큼 떨어진 것으로 칩니다(행간 0.88em ÷ 글자 폭 약 0.55em).
const IGNITE_AT = 120; // 인사말 지연(350ms) 뒤 곧바로 불꽃이 켜집니다.
const LIGHT_START = IGNITE_AT + 160; // 불꽃이 자리를 잡을 즈음 빛이 번지기 시작합니다.
const LIGHT_STEP = 110; // 한 칸 멀어질 때마다 늦어지는 시간

function lightDelay(row: number, col: number) {
  // 불꽃이 얹힌 i는 불꽃과 함께 나타나야 불꽃이 홀로 떠 보이지 않습니다.
  if (row === 0 && col === FLAME_COL) return IGNITE_AT;
  return Math.round(LIGHT_START + Math.hypot(col - FLAME_COL, row * ROW_GAP) * LIGHT_STEP);
}

function Word({ text, row, flame }: { text: string; row: number; flame?: boolean }) {
  return (
    <span aria-hidden className="block">
      {[...text].map((letter, index) => (
        <span
          key={index}
          className={`animate-letter ${letter === "i" && flame ? "relative" : ""}`}
          style={{
            animationDelay: `calc(var(--intro-delay, 0ms) + ${lightDelay(row, index)}ms)`,
            // 점 없는 ı로 바꿔 그리므로 짝도 ı 기준이지만, Playfair에서 i·ı 짝은 커닝이 0이라 같은 표를 씁니다.
            marginRight: KERNING[letter + (text[index + 1] ?? "")] ? `${KERNING[letter + text[index + 1]]}em` : undefined,
          }}
        >
          {letter === "i" && flame ? (
            <>
              ı
              <Flame delay={IGNITE_AT} />
            </>
          ) : (
            letter
          )}
        </span>
      ))}
    </span>
  );
}

/*
 * 부제는 타자기로 한 글자씩 쳐 나갑니다(Special Elite 타자기체와 맞춤). 받은 Originkit Typewriter의
 * 박자(한 글자 70ms, 깜박이는 '_' 커서)를 따르되, framer-motion과 자바스크립트 없이 CSS로만 만듭니다.
 * - 첫 화면이라 하이드레이션을 기다리지 않고 바로 시작하고, 자바스크립트가 없어도 글자가 다 찍힙니다.
 * - 글자는 처음부터 자리를 차지한 채 visibility만 켜져, 타이핑하는 동안 줄 길이·높이가 들썩이지 않습니다.
 * 로고 글자가 거의 다 밝아질 즈음(인사말 지연 + 900ms) 치기 시작합니다.
 */
const TYPE_START = 900;
const TYPE_STEP = 70;

function Typewriter({ text, start }: { text: string; start: number }) {
  const chars = [...text];
  return (
    <>
      {/* 스크린리더에는 한 번에 온전한 문구로 읽히게 합니다. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {chars.map((char, index) => (
          <span
            key={index}
            className={`type-char ${index === chars.length - 1 ? "is-last" : ""}`}
            style={{ "--type-at": `calc(var(--intro-delay, 0ms) + ${start + index * TYPE_STEP}ms)` } as React.CSSProperties}
          >
            {char}
          </span>
        ))}
      </span>
    </>
  );
}

/**
 * i 점 자리의 심지와 작은 불꽃. 불꽃은 다크 모드에서만 켜지고(라이트 모드는 심지만 남은 꺼진 촛불),
 * 워드마크에서 가장 먼저 한 번 '톡' 켜진 뒤(flame-ignite) 가만히 있고, 그 빛을 따라 글자들이 드러납니다.
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

const DECKLE_NOTE = deckleEdge(3, 4, 1.6);

/**
 * 메인 첫 화면. 보내주신 사진 다섯 장을 스크랩북처럼 흩어 붙인 콜라주입니다.
 * 모바일: 인사말 아래에 콜라주. 데스크톱: 왼쪽 인사말, 오른쪽 콜라주.
 * 첫 화면 높이를 꽉 채우고(100svh: 모바일 주소창이 나타났다 사라져도 높이가 튀지 않는 100vh) 내용은 세로 가운데에 둡니다.
 */
/*
 * 손으로 비정형하게 찢은 크라프트지 한 장. 실사 느낌(얼룩진 결, 섬유 점, 겉면이 벗겨진 밝은 단면)은
 * scripts/make-kraft-paper.js로 미리 구워 둔 투명 webp가 맡고, 여기서는 자리와 그림자만 정합니다.
 * 사진이라 테마 색을 따라오지 않으므로 다크모드 톤은 globals.css의 .kraft-photo가 눌러 줍니다.
 */
function TornKraftPaper() {
  return (
    <div
      aria-hidden
      className="kraft-photo absolute left-1/2 top-1/2 w-[112%] aspect-square -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-[0_1px_2px_rgba(30,27,23,0.18)]"
    >
      {/* 첫 화면 바탕이라 늦게 뜨면 콜라주가 빈 종이 위에 떴다가 바탕이 따라 붙어 보입니다. 바로 불러옵니다. */}
      <Image src="/home/kraft-paper.webp" alt="" fill priority sizes="(min-width: 768px) 620px, 112vw" className="object-contain" />
    </div>
  );
}

export default function HeroCollage() {
  return (
    <section className="relative isolate max-w-6xl mx-auto px-5 py-10 min-h-[100svh] flex flex-col justify-center">
      {/* 다크모드 토글: 히어로 섹션 구석에 붙어 있어 스크롤해 섹션을 벗어나면 함께 사라집니다. */}
      <ThemeToggle />
      <div className="hero-stack w-full md:grid md:grid-cols-12 md:gap-10 md:items-center">
        {/* ── 인사말 ─────────────────────────────────────────── */}
        <div className="hero-intro @container mb-10 md:mb-0 md:col-span-6">
          <h1
            className="relative isolate font-display !font-semibold leading-[0.88] mb-7 md:mb-10 text-[color:var(--color-ink)]"
            // 자간을 글꼴 기본(-0.015em)으로 좁히고 나니 "evening"이 글자 크기의 약 3.44배 너비라,
            // 칸의 24%로 두면 예전처럼 칸 너비의 약 83%를 차지합니다.
            style={{ fontSize: "var(--hero-title-size, 24cqi)" }}
          >
            <span className="sr-only">evening candle</span>
            {/* 불꽃(i 점) 자리를 중심으로 글자 뒤에 번지는 둥근 빛 */}
            <span
              aria-hidden
              className="wordmark-glow absolute -z-10 rounded-full"
              // 불꽃 중심(2.19em, 0.17em)에서 반지름(1.3em)만큼 뺀 자리에 놓아, 상자 가운데 = 불꽃 중심이 되게 합니다.
              // 그래서 켜지고 꺼질 때 크기가 바뀌어도 불꽃 자리에서 그대로 커지고 작아집니다.
              // 2.19em은 Playfair Display 600 + 자간 -0.015em + 커닝 기준으로 잰 값이라 글꼴·자간을 바꾸면 다시 재야 합니다.
              style={{
                left: "calc(2.19em - 1.3em)",
                top: "calc(0.17em - 1.3em)",
                width: "2.6em",
                height: "2.6em",
                animationDelay: `calc(var(--intro-delay, 0ms) + ${IGNITE_AT}ms)`,
              }}
            />
            <Word text="evening" row={0} flame />
            <Word text="candle" row={1} />
          </h1>
          {/* 로고 아래 부제. 글자 칸 너비에 맞춰 커집니다(모바일 13px ~ 데스크톱 18px, 글자 크기 단계 안에서). */}
          <p
            className="eyebrow hero-subtitle mb-10 md:mb-16"
            style={{ fontSize: "var(--hero-subtitle-size, clamp(var(--text-small), 3.4cqi, var(--text-lead)))" }}
          >
            <Typewriter text="Handmade Soy Candle" start={TYPE_START} />
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: "calc(var(--intro-delay, 0ms) + 900ms)" }}>
            {/* 상품 목록은 네이버 스마트스토어 베스트 페이지로 대신합니다. 다른 사이트라 새 탭으로 엽니다. */}
            <a
              href="https://smartstore.naver.com/eveningcandle/best?cp=1"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-solid min-h-11"
            >
              컬렉션 보기
            </a>
            <Link href="#story" className="btn-outline min-h-11">
              브랜드 이야기
            </Link>
          </div>
        </div>

        {/* ── 콜라주 ─────────────────────────────────────────── */}
        <div className="md:col-span-6">
          <div className="relative w-full max-w-[560px] mx-auto aspect-[1/1.2]">
            {/*
              콜라주 뒤에 손으로 아무렇게나 찢은 크라프트지 한 장을 붙입니다. 조각들보다 먼저 그려 맨 아래에 둡니다.
            */}
            <TornKraftPaper />

            {/*
              조각은 네 개만 둡니다. 일곱 개일 때는 눈 둘 곳이 없어 로고가 묻혔습니다.
              앱 아이콘(로고와 겹침), 두 번째 타원 액자(같은 소품 반복), 성냥 사진(다른 브랜드 라벨이 보임)을 뺐습니다.
            */}
            {/* 책 읽는 저녁 — 왼쪽 위 큰 사진(주인공). 오래 들고 다닌 인화지(.worn-print: 그을린 테두리, 떨어져 나간 모서리) + 마스킹 테이프 */}
            <Piece className="left-[5%] top-[5%] w-[46%] z-10" rotate={-1.5} delay={120}>
              <div className="relative drop-shadow-[0_6px_7px_rgba(30,27,23,0.32)]">
                <div className="worn-print">
                  <div className="worn-print-photo aspect-[9/13]">
                    <Image
                      src="/home/evening-reading.webp"
                      alt="책 옆에서 은은하게 타오르는 캔들과 린넨 이불"
                      fill
                      priority
                      className="object-cover object-[50%_25%]"
                      sizes="(max-width: 767px) 46vw, 260px"
                    />
                  </div>
                </div>
                <span aria-hidden className="masking-tape -top-2.5 left-[29%] w-[42%] rotate-[3deg]" />
              </div>
            </Piece>

            {/* 불꽃 클로즈업 — 오른쪽 위 타원 액자. 큰 사진과 높이를 어긋나게 둬 줄 맞춘 느낌을 피합니다. */}
            <Piece className="right-[5%] top-[9%] w-[27%] z-20" rotate={2.5} delay={260}>
              <OvalPhoto src="/home/flame-close.webp" alt="가까이서 본 캔들 불꽃" />
            </Piece>

            {/* 색색 캔들 일러스트 — 레코드 판이 삐져나온 앨범 재킷 */}
            <Piece className="left-[46%] top-[37%] w-[42%] z-20" rotate={1.5} delay={400}>
              <RecordAlbum />
            </Piece>

            {/* 클립으로 집어 둔 줄 노트 메모 */}
            <Piece className="left-[12%] top-[67%] w-[40%] z-30" rotate={-1} delay={540}>
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
