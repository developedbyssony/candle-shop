import Link from "next/link";
import Image from "next/image";
import { products } from "@/app/data/products";
import ProductCard from "@/app/components/ProductCard";
import HeroCollage from "@/app/components/HeroCollage";
import Reveal from "@/app/components/Reveal";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { getReviewSummaries } from "@/app/lib/reviewStore";

const KAKAO_OPEN_CHAT_URL = "https://open.kakao.com/o/srDgHd2h";

const IMG = {
  forestPath: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
  forestLight: "https://images.unsplash.com/photo-1596237295359-2ea7c9b00ebd",
  linen: "https://images.unsplash.com/photo-1772268485810-29dc9d231f26",
  interior: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
  botanical: "https://images.unsplash.com/photo-1512389142860-9c449e58a543",
  chair: "https://images.unsplash.com/photo-1519947486511-46149fa0a254",
};

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

      {/*
        overflow-x-hidden은 세로축을 auto로 만들어 살짝 기울어진 콜라주 조각을
        잘라냅니다. 가로만 자르는 overflow-x-clip을 씁니다.
      */}
      <main className="w-full overflow-x-clip">
        <HeroCollage />

        {/* ── WHO WE ARE ──────────────────────────────────────────── */}
        <section id="story" className="max-w-6xl mx-auto px-5 py-20 md:py-28 scroll-mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <Image
                src={`${IMG.interior}?w=900&h=1200&fit=crop&q=75`}
                alt="린넨 커튼 사이로 햇살이 드는 밝은 실내"
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
                src={`${IMG.forestPath}?w=900&h=1200&fit=crop&q=75`}
                alt="아침 햇살이 스며드는 숲길"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        {/* ── 오브제 콜라주 ──────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 pb-20 md:pb-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* 겹쳐진 이미지 */}
            <div className="relative pb-14 pr-10 md:pb-16 md:pr-12">
              <div className="relative aspect-[4/3] w-[86%] overflow-hidden">
                <Image
                  src={`${IMG.botanical}?w=800&h=600&fit=crop&q=75`}
                  alt="흰 린넨 위에 놓인 나뭇가지와 잎"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 86vw, 43vw"
                />
              </div>
              <div
                className="absolute right-0 bottom-0 w-[48%] aspect-square overflow-hidden"
                style={{
                  background: "var(--color-beige)",
                  outline: "8px solid var(--color-cream)",
                }}
              >
                <Image
                  src={products[0].image}
                  alt={products[0].name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 45vw, 22vw"
                />
              </div>
            </div>

            <div>
              <h2
                className="headline mb-6"
                style={{ fontSize: "clamp(1.7rem, 6.5vw, 2.4rem)" }}
              >
                하나도 같지 않은
                <br />
                손끝의 오브제.
              </h2>
              <p
                className="text-[15px] leading-[1.9] mb-5 text-pretty"
                style={{ color: "var(--color-muted)" }}
              >
                치즈 한 조각, 숲속 부엉이, 말차 컵케이크. 일상에서 마주치는
                반가운 장면을 캔들로 옮겨 담았습니다.
              </p>
              <p
                className="text-[15px] leading-[1.9] text-pretty"
                style={{ color: "var(--color-muted)" }}
              >
                불을 붙이지 않아도 좋은 오브제로, 불을 붙이면 향이 되는
                캔들로. 두 가지 얼굴을 가진 작은 선물입니다.
              </p>
            </div>
          </div>
        </section>

        {/* ── 추천 상품 ──────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 pb-20 md:pb-28">
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

        {/* ── 사용 장면 트립틱 ───────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-center">
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <Image
                src={`${IMG.linen}?w=800&h=1060&fit=crop&q=75`}
                alt="린넨 커튼 위로 드리운 나뭇잎 그림자"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>

            <div className="text-center md:text-left">
              <h2
                className="headline mb-5"
                style={{ fontSize: "clamp(1.6rem, 6vw, 2.1rem)" }}
              >
                저녁은
                <br />
                편안해야 하니까.
              </h2>
              <p
                className="text-[14px] leading-[1.9] text-pretty"
                style={{ color: "var(--color-muted)" }}
              >
                퇴근 후 조명을 낮추고 심지에 불을 붙이는 몇 초. 그 사이에
                하루가 정리됩니다. 은은하고 다정한 향이 오래 머물도록
                낮은 온도에서 천천히 다룹니다.
              </p>
            </div>

            <div>
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={`${IMG.chair}?w=800&h=1060&fit=crop&q=75`}
                  alt="식물 옆에 놓인 흰 의자와 자연광"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <p
                className="text-[13px] leading-relaxed mt-4"
                style={{ color: "var(--color-muted)" }}
              >
                침실, 책상 위, 욕실 선반. 어디에 두어도 어울리는 담백한 형태로
                만듭니다.
              </p>
            </div>
          </div>
        </section>

        {/* ── 상담 CTA ───────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 pb-20 md:pb-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <p
                className="text-[15px] leading-[1.9] mb-7 text-pretty max-w-sm"
                style={{ color: "var(--color-text)" }}
              >
                향과 색상, 선물 포장까지. 어떤 캔들이 어울릴지 함께 골라
                드릴게요.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={KAKAO_OPEN_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                >
                  카카오톡 상담하기
                </Link>
                <Link href="/products" className="btn-solid">
                  컬렉션 보기
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2 relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={`${IMG.forestLight}?w=1000&h=750&fit=crop&q=75`}
                alt="나무 사이로 쏟아지는 아침 햇살"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
