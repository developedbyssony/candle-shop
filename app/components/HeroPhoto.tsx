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
 * 메인 첫 화면.
 * 모바일: 세로 사진을 화면 가득 깔고 아래쪽 어둠 위에 글씨를 올립니다.
 * 데스크톱: 왼쪽 글, 오른쪽 사진으로 나눕니다.
 */
export default function HeroPhoto() {
  return (
    <section className="relative md:max-w-6xl md:mx-auto md:px-5 md:pt-12 md:pb-24">
      <div className="md:grid md:grid-cols-12 md:gap-12 md:items-center">
        {/* ── 사진 ─────────────────────────────────────────── */}
        {/* 모바일에서는 내비게이션(4rem)을 뺀 화면 높이를 꽉 채웁니다. */}
        <div className="relative h-[calc(100svh-4rem)] min-h-[560px] md:h-auto md:min-h-0 md:aspect-[4/5] md:col-span-6 md:col-start-7 overflow-hidden">
          <Image
            src="/home/evening-reading.webp"
            alt="책 옆에서 은은하게 타오르는 캔들과 린넨 이불"
            fill
            priority
            className="object-cover object-[50%_30%] animate-hero-zoom"
            sizes="(max-width: 767px) 100vw, 50vw"
          />
          {/* 글씨가 읽히도록 아래쪽만 어둡게 눌러 줍니다(모바일 전용). */}
          <div
            aria-hidden
            className="absolute inset-0 md:hidden"
            style={{
              background:
                "linear-gradient(to bottom, rgba(20,16,12,0) 35%, rgba(20,16,12,0.55) 68%, rgba(20,16,12,0.82) 100%)",
            }}
          />
        </div>

        {/* ── 인사말 ─────────────────────────────────────────── */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-12 text-white md:static md:col-span-5 md:col-start-1 md:row-start-1 md:p-0 md:text-[color:var(--color-ink)]">
          <p
            className="eyebrow mb-3 animate-fade-up !text-[rgba(255,255,255,0.78)] md:!text-[color:var(--color-muted)]"
            style={{ animationDelay: "40ms" }}
          >
            Handmade Soy Candle
          </p>
          <h1
            className="font-display leading-[0.88] mb-5"
            style={{ fontSize: "clamp(3.1rem, 14vw, 5rem)" }}
          >
            <span className="sr-only">evening candle</span>
            <Word text="evening" start={160} />
            <Word text="candle" start={160 + 7 * 55} />
          </h1>
          <p
            className="text-[14px] md:text-[15px] leading-[1.85] mb-7 text-pretty max-w-sm animate-fade-up text-[rgba(255,255,255,0.86)] md:text-[color:var(--color-muted)]"
            style={{ animationDelay: "820ms" }}
          >
            책장을 넘기는 소리, 이불의 포근함, 작은 불빛 하나.
            <br />
            당신의 저녁이 조금 더 따뜻해지도록.
          </p>
          <div
            className="flex flex-wrap gap-3 animate-fade-up"
            style={{ animationDelay: "940ms" }}
          >
            <Link href="/products" className="btn-solid btn-on-photo">
              컬렉션 보기
            </Link>
            <Link href="#story" className="btn-outline btn-outline-on-photo">
              브랜드 이야기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
