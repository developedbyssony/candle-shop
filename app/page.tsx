import Link from "next/link";
import Image from "next/image";
import { products } from "@/app/data/products";
import ProductCard from "@/app/components/ProductCard";
import HeroPhoto from "@/app/components/HeroPhoto";
import Reveal from "@/app/components/Reveal";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { getReviewSummaries } from "@/app/lib/reviewStore";

const KAKAO_OPEN_CHAT_URL = "https://open.kakao.com/o/srDgHd2h";

// 메인 화면 사진은 모두 /public/home에 webp로 둡니다(외부 요청 없이 빨리 뜨도록).
const IMG = {
  morningMatch: "/home/morning-match.webp",
  flame: "/home/flame-close.webp",
  colorCandles: "/home/color-candles.webp",
  candlestick: "/home/candlestick-painting.webp",
};

// 일러스트 바탕색. 색 이야기 띠를 이 색으로 깔아 그림과 띠가 하나로 이어지게 합니다.
const FOREST_GREEN = "#203316";

// size는 /public/brand/step-0*.png 원본 크기입니다(비율 유지용).
const PROCESS = [
  {
    no: "01",
    size: { width: 636, height: 522 },
    title: "숲에서 향을 고릅니다",
    desc: "나무, 이끼, 늦은 오후의 볕. 자연에서 만난 순간을 향으로 옮깁니다.",
  },
  {
    no: "02",
    size: { width: 794, height: 494 },
    title: "손끝으로 빚습니다",
    desc: "틀에 붓지 않고 하나씩 조각해, 같은 모양이 하나도 없습니다.",
  },
  {
    no: "03",
    size: { width: 736, height: 525 },
    title: "천천히 굳힙니다",
    desc: "낮은 온도에서 며칠에 걸쳐 굳혀 향이 깊고 오래 머뭅니다.",
  },
];

export default function Home() {
  const featured = products.slice(0, 3);
  const signature = products[1];
  const summaries = getReviewSummaries(featured.map((product) => product.id));

  return (
    <>
      <Navbar />

      <main className="w-full overflow-x-clip">
        <HeroPhoto />

        {/* ── WHO WE ARE ──────────────────────────────────────────── */}
        <section id="story" className="max-w-6xl mx-auto px-5 py-20 md:py-28 scroll-mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={IMG.morningMatch}
                alt="침대에 누워 캔들에 성냥불을 붙이는 손"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <p className="eyebrow mb-5">Who We Are</p>
              {/*
                직접 쓴 캘리그래피라 폰트 대신 이미지로 넣습니다.
                alt에 문구를 그대로 담아 검색엔진과 스크린리더에도 읽히게 합니다.
              */}
              <h2 className="mb-7">
                <Image
                  src="/brand/story-headline.png"
                  alt="하루의 끝에, 나를 위한 작은 빛"
                  width={1031}
                  height={449}
                  className="w-full max-w-[340px] md:max-w-[420px] h-auto"
                  sizes="(max-width: 767px) 340px, 420px"
                />
              </h2>
              <p
                className="text-[15px] leading-[1.9] mb-8 text-pretty max-w-md"
                style={{ color: "var(--color-muted)" }}
              >
                이브닝 캔들은 바쁜 하루가 천천히 저무는 시간에서 시작됩니다.{" "}
                {/*
                  모바일에서는 첫 문장이 이미 두 줄로 나뉘어 줄바꿈을 넣지 않습니다.
                  줄바꿈이 숨겨졌을 때 두 문장이 붙지 않도록 앞에 공백을 둡니다.
                */}
                <br className="hidden md:inline" />
                늦은 오후의 햇살, 깨끗한 린넨의 포근함, 창문 사이로 스며드는
                조용한 바람처럼 일상 속 작은 순간들을 향으로 담아냅니다.
              </p>
              <Link href="/products" className="btn-solid">
                자세히 보기
              </Link>
            </div>
          </div>
        </section>

        {/* ── 만드는 과정 (넘버링) ────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 pb-20 md:pb-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
            <div className="order-2 md:order-1">
              <h2
                className="headline mb-9"
                style={{ fontSize: "clamp(1.6rem, 6vw, 2.2rem)" }}
              >
                캔들이 만들어지는
                <br />
                세 번의 시간.
              </h2>
              <div>
                {PROCESS.map(({ no, size, title, desc }, i) => (
                  // 스크롤로 화면에 들어올 때 위에서부터 차례로 떠오릅니다.
                  // (세 항목이 한 화면에 같이 들어와도 순서대로 보이도록 시간차를 둡니다.)
                  <Reveal
                    key={no}
                    delay={i * 260}
                    className="flex items-start gap-5 py-6"
                  >
                    {/*
                      직접 쓴 캘리그래피 숫자입니다. 숫자마다 가로 비율이 달라
                      높이를 맞추고, 고정폭 칸 안에서 가운데로 두어 본문 시작선을
                      나란히 맞춥니다.
                    */}
                    <span className="shrink-0 w-14 md:w-16 flex justify-center pt-1">
                      <Image
                        src={`/brand/step-${no}.png`}
                        alt={no}
                        width={size.width}
                        height={size.height}
                        className="h-9 md:h-11 w-auto"
                      />
                    </span>
                    <div className="pt-1.5">
                      <p className="text-sm font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>
                        {title}
                      </p>
                      <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
                        {desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2 relative aspect-[4/5] md:aspect-[3/4] w-full overflow-hidden">
              <Image
                src={IMG.flame}
                alt="녹아내린 캔들 위로 타오르는 불꽃 클로즈업"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        {/* ── 색 이야기 (어두운 숲색 띠) ─────────────────────────── */}
        {/* 모바일에서는 그림을 좌우 끝까지 붙이고, 글만 안쪽 여백을 둡니다. */}
        <section style={{ background: FOREST_GREEN }}>
          <div className="max-w-6xl mx-auto md:px-5 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16 items-center">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={IMG.colorCandles}
                  alt="여러 색의 촛대 위에서 타오르는 알록달록한 캔들 일러스트"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <Reveal className="px-5 pt-10 pb-20 md:p-0">
                <p className="eyebrow mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Pick Your Color
                </p>
                <h2
                  className="headline mb-6"
                  style={{ color: "#fff", fontSize: "clamp(1.7rem, 6.5vw, 2.4rem)" }}
                >
                  오늘의 기분을
                  <br />
                  색으로 고르세요.
                </h2>
                <p
                  className="text-[15px] leading-[1.9] mb-8 text-pretty max-w-md"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  같은 모양이라도 색이 달라지면 방의 분위기가 달라집니다.
                  불을 붙이지 않아도 좋은 오브제로, 불을 붙이면 향이 되는
                  캔들로 곁에 두세요.
                </p>
                <Link href="/products" className="btn-outline-light">
                  색상별로 보기
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── 추천 상품 ──────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">Our Collection</p>
            <h2
              className="font-display"
              style={{ color: "var(--color-ink)", fontSize: "clamp(1.9rem, 7vw, 3rem)" }}
            >
              이달의 캔들
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                summary={summaries.get(product.id)}
              />
            ))}
          </div>
          <div className="flex justify-center mt-14">
            <Link href="/products" className="btn-outline">
              전체 상품 보기
            </Link>
          </div>
        </section>

        {/* ── 시그니처 스펙 패널 ─────────────────────────────────── */}
        <section style={{ background: "var(--color-beige)" }}>
          <div className="max-w-6xl mx-auto px-5 py-20 md:py-24">
            <div className="text-center mb-12">
              <h2
                className="font-display"
                style={{ color: "var(--color-ink)", fontSize: "clamp(1.9rem, 7vw, 2.8rem)" }}
              >
                Signature Candle
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 items-center">
              {/* 좌측 소개 */}
              <div className="order-2 md:order-1">
                <p className="eyebrow mb-4">Best Seller</p>
                <h3 className="headline mb-4" style={{ fontSize: "1.5rem" }}>
                  {signature.name}
                </h3>
                <p
                  className="text-[13px] leading-relaxed mb-6"
                  style={{ color: "var(--color-muted)" }}
                >
                  {signature.description}
                </p>
                <p className="font-display text-2xl mb-7" style={{ color: "var(--color-ink)" }}>
                  {signature.price.toLocaleString()}
                  <span className="text-sm ml-1">원</span>
                </p>
                <Link href="/products" className="btn-outline">
                  주문하기
                </Link>
              </div>

              {/* 중앙 이미지 */}
              <div
                className="order-1 md:order-2 relative aspect-[3/4] w-full overflow-hidden"
                style={{ background: "#fff" }}
              >
                <Image
                  src={signature.image}
                  alt={signature.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              {/* 우측 스펙 */}
              <dl className="order-3 space-y-6">
                {[
                  ["향", signature.scent],
                  ["왁스", "100% 천연 소이 왁스"],
                  ["연소 시간", "약 20시간"],
                  ["제작 기간", "주문 후 1–2주"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt
                      className="text-[11px] tracking-[0.2em] uppercase mb-1.5 font-medium"
                      style={{ color: "var(--color-sage-dark)" }}
                    >
                      {label}
                    </dt>
                    <dd className="text-sm" style={{ color: "var(--color-text)" }}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ── 상담 CTA ───────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <p className="eyebrow mb-4">Talk With Us</p>
              <h2
                className="headline mb-6"
                style={{ fontSize: "clamp(1.6rem, 6vw, 2.2rem)" }}
              >
                나에게 맞는 캔들,
                <br />
                함께 골라 드릴게요.
              </h2>
              <p
                className="text-[15px] leading-[1.9] mb-7 text-pretty max-w-sm"
                style={{ color: "var(--color-muted)" }}
              >
                향과 색상, 선물 포장까지. 카카오톡으로 편하게 물어봐 주세요.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={KAKAO_OPEN_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-solid"
                >
                  카카오톡 상담하기
                </Link>
                <Link href="/products" className="btn-outline">
                  컬렉션 보기
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2 relative aspect-[4/5] w-full max-w-md md:ml-auto overflow-hidden">
              <Image
                src={IMG.candlestick}
                alt="황토빛 종이에 그린 촛대와 촛불 그림"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
