import Image from "next/image";
import Link from "next/link";
import { products } from "@/app/data/products";

const IMG = {
  window: "https://images.unsplash.com/photo-1640095889747-2090ee12fa7d",
  candleClose: "https://images.unsplash.com/photo-1603006905003-be475563bc59",
  forestPath: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
  linen: "https://images.unsplash.com/photo-1772268485810-29dc9d231f26",
  botanical: "https://images.unsplash.com/photo-1512389142860-9c449e58a543",
};

/** 사진마다 흰 여백 + 옅은 그림자를 둘러 스크랩북에 붙인 것처럼 보이게 합니다. */
const FRAME = "bg-white p-2 md:p-2.5 shadow-[0_14px_30px_rgba(30,27,23,0.12)]";

/**
 * 콜라주 조각 한 개.
 * 바깥 div는 등장 애니메이션(translateY)을, 안쪽 div는 기울기(rotate)를 맡습니다.
 * 한 요소에 두 transform을 같이 주면 애니메이션이 끝나면서 기울기가 사라집니다.
 */
function Piece({
  className,
  rotate,
  delay,
  children,
}: {
  className: string;
  rotate: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute animate-fade-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={rotate}>{children}</div>
    </div>
  );
}

/** 손으로 그린 듯한 화살표 */
function Arrow({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 88 46"
      fill="none"
      className={className}
      style={{ color: "var(--color-sage-dark)" }}
      aria-hidden
    >
      <path
        d="M3 42C10 16 34 3 62 8c9 1.6 16 6 21 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M72 17.5 84 20.5 79 31"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 종이에 찍은 듯한 작은 별표 */
function Asterisk({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ color: "var(--color-sage)" }}
      aria-hidden
    >
      {[0, 60, 120].map((angle) => (
        <line
          key={angle}
          x1="12"
          y1="2.5"
          x2="12"
          y2="21.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  );
}

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

export default function HeroCollage() {
  const signature = products[0];

  return (
    <section className="max-w-6xl mx-auto px-5 pt-6 md:pt-14 pb-16 md:pb-24">
      <div className="md:grid md:grid-cols-12 md:gap-8 md:items-center">
        {/* ── 인사말 ─────────────────────────────────────────── */}
        {/* 워드마크가 글자별로 등장하므로, 나머지 요소는 각자 시간차를 둡니다. */}
        <div className="md:col-span-4 md:pr-2">
          <p
            className="eyebrow mb-3 animate-fade-up"
            style={{ animationDelay: "40ms" }}
          >
            Handmade Soy Candle
          </p>
          <h1
            className="font-display leading-[0.88] mb-5"
            style={{ color: "var(--color-ink)", fontSize: "clamp(2.9rem, 12vw, 4.4rem)" }}
          >
            <span className="sr-only">evening candle</span>
            <Word text="evening" start={160} />
            <Word text="candle" start={160 + 7 * 55} />
          </h1>
          <p
            className="text-[14px] leading-[1.85] mb-7 text-pretty max-w-sm animate-fade-up"
            style={{ color: "var(--color-muted)", animationDelay: "820ms" }}
          >
            당신의 저녁이 조금 더 따뜻하고,
            <br />
            조금 더 아름다워질 수 있도록.
          </p>
          <div
            className="flex flex-wrap gap-3 animate-fade-up"
            style={{ animationDelay: "940ms" }}
          >
            <Link href="/products" className="btn-solid">
              컬렉션 보기
            </Link>
            <Link href="#story" className="btn-outline">
              브랜드 이야기
            </Link>
          </div>
        </div>

        {/* ── 사진 콜라주 ────────────────────────────────────── */}
        {/*
          조각들은 모두 stage 안에서 %로 자리를 잡습니다.
          가로폭이 달라져도 배치가 그대로 줄었다 늘었다 합니다.
        */}
        <div className="md:col-span-8 mt-12 md:mt-0">
          {/*
            조각의 위치도 md부터 바뀌므로, 화면 비율도 같은 지점에서 바꿔야
            중간 크기 화면에서 사진이 겹치지 않습니다.
          */}
          {/* 태블릿 폭에서 사진만 지나치게 커지지 않도록 세로 배치일 때는 폭을 묶습니다. */}
          <div className="relative w-full max-w-[520px] mx-auto md:max-w-none aspect-[3/4] md:aspect-[4/3]">
            {/* 창가의 캔들 — 가장 큰 사진 */}
            <Piece
              className="left-[1%] top-[2%] w-[54%] md:left-[2%] md:top-[6%] md:w-[34%]"
              rotate="rotate-[-4deg]"
              delay={120}
            >
              <div className={FRAME}>
                <div className="relative aspect-[4/5]">
                  <Image
                    src={`${IMG.window}?w=760&h=950&fit=crop&q=75`}
                    alt="해질녘 창가에서 은은하게 타오르는 캔들"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 767px) 55vw, 30vw"
                  />
                </div>
                <p
                  className="font-display italic text-[11px] md:text-[12px] pt-2 pb-0.5 text-center"
                  style={{ color: "var(--color-muted)" }}
                >
                  evening, 7 p.m.
                </p>
              </div>
            </Piece>

            {/* 린넨 위 나뭇잎 그림자 */}
            <Piece
              className="left-[60%] top-[2%] w-[36%] md:left-[40%] md:top-[0%] md:w-[22%]"
              rotate="rotate-[5deg]"
              delay={220}
            >
              <div className={FRAME}>
                <div className="relative aspect-square">
                  <Image
                    src={`${IMG.linen}?w=520&h=520&fit=crop&q=75`}
                    alt="린넨 커튼 위로 드리운 나뭇잎 그림자"
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 38vw, 20vw"
                  />
                </div>
              </div>
            </Piece>

            {/* 숲길 — 타원 액자 */}
            <Piece
              className="left-[62%] top-[33%] w-[32%] md:left-[79%] md:top-[10%] md:w-[19%]"
              rotate="rotate-[-3deg]"
              delay={320}
            >
              <div
                className="bg-white p-1.5 shadow-[0_14px_30px_rgba(30,27,23,0.12)]"
                style={{ borderRadius: "50%" }}
              >
                <div
                  className="relative aspect-[3/4] overflow-hidden"
                  style={{ borderRadius: "50%" }}
                >
                  <Image
                    src={`${IMG.forestPath}?w=420&h=560&fit=crop&q=75`}
                    alt="아침 햇살이 스며드는 숲길"
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 34vw, 16vw"
                  />
                </div>
              </div>
              <p
                className="font-display italic text-[11px] md:text-[12px] mt-2 text-center"
                style={{ color: "var(--color-muted)" }}
              >
                Find Your Moment
              </p>
            </Piece>

            {/* 대표 상품 사진 */}
            <Piece
              className="left-[3%] top-[62%] w-[42%] md:left-[38%] md:top-[36%] md:w-[24%]"
              rotate="rotate-[6deg]"
              delay={420}
            >
              <div className={FRAME}>
                {/* 사진 배경이 흰색이라, 액자 여백까지 흰색으로 이어지게 둡니다. */}
                <div className="relative aspect-square" style={{ background: "#fff" }}>
                  <Image
                    src={signature.image}
                    alt={signature.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 767px) 42vw, 22vw"
                    quality={98}
                  />
                </div>
                <p
                  className="text-[11px] md:text-[12px] pt-2 pb-0.5 text-center"
                  style={{ color: "var(--color-text)" }}
                >
                  {signature.name}
                </p>
              </div>
            </Piece>

            {/* 캔들 클로즈업 */}
            <Piece
              className="left-[52%] top-[74%] w-[38%] md:left-[66%] md:top-[58%] md:w-[24%]"
              rotate="rotate-[-7deg]"
              delay={520}
            >
              <div className={FRAME}>
                <div className="relative aspect-[4/3]">
                  <Image
                    src={`${IMG.candleClose}?w=560&h=420&fit=crop&q=75`}
                    alt="따뜻한 빛을 내는 소이 캔들 클로즈업"
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 40vw, 20vw"
                  />
                </div>
              </div>
            </Piece>

            {/* 식물 — 데스크톱에서만 한 장 더 */}
            <Piece
              className="hidden md:block md:left-[8%] md:top-[74%] md:w-[20%]"
              rotate="rotate-[8deg]"
              delay={620}
            >
              <div className={FRAME}>
                <div className="relative aspect-[4/3]">
                  <Image
                    src={`${IMG.botanical}?w=480&h=360&fit=crop&q=75`}
                    alt="흰 린넨 위에 놓인 나뭇가지와 잎"
                    fill
                    className="object-cover"
                    sizes="18vw"
                  />
                </div>
              </div>
            </Piece>

            {/* 동그란 스티커 */}
            <Piece
              className="left-[44%] top-[42%] w-[18%] md:left-[30%] md:top-[14%] md:w-[11%]"
              rotate="rotate-[-12deg]"
              delay={720}
            >
              <div
                className="rounded-full aspect-square flex flex-col items-center justify-center text-center shadow-[0_8px_18px_rgba(30,27,23,0.10)]"
                style={{ background: "var(--color-sage)", color: "#fff" }}
              >
                <span className="font-display text-[13px] md:text-[15px] leading-none">
                  2019
                </span>
                <span className="text-[8px] md:text-[9px] tracking-[0.14em] mt-1">
                  SINCE
                </span>
              </div>
            </Piece>

            {/* 손그림 장식 */}
            <Arrow className="absolute left-[34%] top-[58%] w-[16%] md:left-[64%] md:top-[34%] md:w-[11%] rotate-[100deg] md:rotate-[8deg]" />
            <Asterisk className="absolute left-[92%] top-[70%] w-[6%] md:left-[62%] md:top-[86%] md:w-[4%]" />
            <Asterisk className="absolute left-[2%] top-[58%] w-[5%] md:left-[34%] md:top-[80%] md:w-[3.5%]" />
          </div>
        </div>
      </div>
    </section>
  );
}
