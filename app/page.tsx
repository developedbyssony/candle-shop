import Link from "next/link";
import Image from "next/image";
import { products } from "@/app/data/products";
import ProductCard from "@/app/components/ProductCard";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const KAKAO_OPEN_CHAT_URL = "https://open.kakao.com/o/srDgHd2h";

const IMG = {
  hero: "https://images.unsplash.com/photo-1640095889747-2090ee12fa7d",
  candleClose: "https://images.unsplash.com/photo-1603006905003-be475563bc59",
  forestPath: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
  forestLight: "https://images.unsplash.com/photo-1596237295359-2ea7c9b00ebd",
  linen: "https://images.unsplash.com/photo-1772268485810-29dc9d231f26",
  interior: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
  botanical: "https://images.unsplash.com/photo-1512389142860-9c449e58a543",
  chair: "https://images.unsplash.com/photo-1519947486511-46149fa0a254",
};

// 히어로 워드마크는 잉크색 원본과 흰색 사본이 정확히 같은 자리에 겹쳐야 합니다.
// 좌측으로 튀어나오는 -translate-x는 xl부터만 적용합니다. md~lg 구간에서는
// 사진 높이가 낮아 워드마크가 위로 올라오는데, 그 상태로 왼쪽까지 나오면
// 좌측 칼럼의 "Our Signature" 문구와 글자가 겹칩니다.
const WORDMARK_CLASS =
  "font-display leading-[0.86] pointer-events-none animate-fade-up";
const WORDMARK_TYPE = {
  fontSize: "clamp(3.4rem, 15vw, 7rem)",
  animationDelay: "240ms",
};

const PROCESS = [
  {
    no: "01",
    title: "숲에서 향을 고릅니다",
    desc: "나무, 이끼, 늦은 오후의 볕. 자연에서 만난 순간을 향으로 옮깁니다.",
  },
  {
    no: "02",
    title: "손끝으로 빚습니다",
    desc: "틀에 붓지 않고 하나씩 조각해, 같은 모양이 하나도 없습니다.",
  },
  {
    no: "03",
    title: "천천히 굳힙니다",
    desc: "낮은 온도에서 며칠에 걸쳐 굳혀 향이 깊고 오래 머뭅니다.",
  },
];

export default function Home() {
  const featured = products.slice(0, 3);
  const signature = products[1];

  return (
    <>
      <Navbar />

      {/*
        overflow-x-hidden은 세로축을 auto로 만들어 헤더 뒤로 올린 히어로를 잘라냅니다.
        가로만 자르는 overflow-x-clip을 씁니다.
      */}
      <main className="w-full overflow-x-clip">
        {/* ── 히어로: 사진 콜라주 + 오버랩 워드마크 ───────────────── */}
        {/*
          모바일에서는 헤더 뒤로 사진이 비치도록 위로 끌어올리고,
          워드마크부터 "컬렉션 보기" 버튼까지가 한 화면(100svh)에 담기도록
          사진이 남는 높이를 flex로 채웁니다.
        */}
        <section className="max-w-6xl mx-auto px-5 -mt-16 md:mt-0 pt-0 md:pt-12">
          <div className="flex flex-col h-[100svh] md:h-auto md:grid md:grid-cols-12 md:gap-6 md:items-start">
            {/*
              중앙 메인 이미지 + 겹쳐지는 워드마크.
              모바일 세로 스택에서는 사진이 맨 위여야 하므로 DOM 순서상 먼저 두고,
              데스크톱 그리드 위치는 col-start / row-start로 직접 지정합니다.
              z-10은 워드마크를 좌측 텍스트 칼럼 위로 올리기 위한 것입니다.
            */}
            <div
              className="flex-1 min-h-0 flex flex-col md:block md:col-start-4 md:col-span-6 md:row-start-1 relative z-10 animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              {/*
                모바일에서는 헤더 뒤부터 남는 높이를 모두 채웁니다.
                z-30은 아래 h1(z-20)보다 위에 두기 위한 것입니다. 모바일 애니메이션의
                clip-path가 이 요소를 별도 쌓임 맥락으로 만들기 때문에, 안에 있는 흰색
                사본이 h1을 덮으려면 래퍼 자체가 h1보다 위여야 합니다.
              */}
              <div className="hero-fill relative z-30 flex-1 min-h-0 md:h-auto aspect-auto md:aspect-[4/5] w-auto -mx-5 md:mx-0 overflow-hidden">
                <Image
                  src={`${IMG.hero}?w=1200&h=1500&fit=crop&q=80`}
                  alt="해질녘 창가에서 은은하게 타오르는 캔들"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* 사진 위 글씨가 읽히도록 상단에만 옅은 그늘 */}
                <div
                  className="absolute inset-0 md:hidden"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(24,20,15,0.62) 0%, rgba(24,20,15,0.42) 30%, rgba(24,20,15,0.12) 52%, rgba(24,20,15,0) 70%)",
                  }}
                />

                {/*
                  아래 h1과 완전히 같은 자리에 놓은 흰색 사본입니다.
                  이 래퍼가 overflow-hidden이라 사진에 걸치는 부분만 흰색으로 보입니다.
                */}
                <span
                  aria-hidden="true"
                  className={`${WORDMARK_CLASS} absolute z-30 left-5 top-full -translate-y-14 md:left-0 md:top-auto md:bottom-0 md:translate-y-[32%] md:translate-x-0 xl:-translate-x-[18%]`}
                  style={{ ...WORDMARK_TYPE, color: "#fff" }}
                >
                  evening
                  <br />
                  candle
                </span>
              </div>

              {/* 모바일에서는 이미지 아래, 데스크톱에서는 이미지 좌측 하단에 겹칩니다. */}
              <h1
                className={`${WORDMARK_CLASS} relative z-20 -mt-14 md:mt-0 md:absolute md:left-0 md:bottom-0 md:translate-y-[32%] md:translate-x-0 xl:-translate-x-[18%]`}
                style={{ ...WORDMARK_TYPE, color: "var(--color-ink)" }}
              >
                evening
                <br />
                candle
              </h1>
            </div>

            {/* 좌측 텍스트 칼럼 — 리드 카피 + Our Signature 소개 */}
            <div
              className="shrink-0 mt-6 pb-8 md:mt-0 md:pb-0 md:col-start-1 md:col-span-3 md:row-start-1 md:pt-24 animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              {/* 리드 카피 — 모바일에서는 숨깁니다 */}
              <div className="hidden md:block mb-10">
                <p className="eyebrow mb-3">Handmade Soy Candle</p>
                <p
                  className="text-[13px] leading-relaxed text-pretty"
                  style={{ color: "var(--color-muted)" }}
                >
                  린넨 위로 스며드는 오후 햇살처럼,
                  하루의 끝에 놓아두는 작은 위안.
                  이브닝캔들은 숲에서 만난 향을 손으로 빚습니다.
                </p>
              </div>

              <p className="eyebrow mb-2.5">Our Signature</p>
              <h2 className="font-display text-[1.35rem] leading-snug mb-5" style={{ color: "var(--color-ink)" }}>
                하루의 끝에 두는
                <br />
                가장 다정한 불빛.
              </h2>
              <Link href="/products" className="btn-outline text-[11px] px-4 py-2.5">
                컬렉션 보기
              </Link>
            </div>

            {/* 모바일에서는 히어로를 한 화면에 담기 위해 두 번째 사진을 숨깁니다. */}
            {/*
              데스크톱에서는 칼럼 밖으로 왼쪽으로 당겨 중앙 메인 이미지 위에 겹칩니다.
              z-20으로 중앙 칼럼(z-10)보다 위에 두고,
              크림색 아웃라인이 사진 위에 얹힌 경계를 만들어 줍니다.
            */}
            <div
              className="hidden md:block md:col-start-10 md:col-span-3 md:row-start-1 md:self-center relative z-20 animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              <div
                className="relative aspect-square w-[calc(100%_+_6rem)] -ml-24 overflow-hidden"
                style={{ outline: "8px solid var(--color-cream)" }}
              >
                <Image
                  src={`${IMG.candleClose}?w=760&h=760&fit=crop&q=75`}
                  alt="따뜻한 빛을 내는 소이 캔들 클로즈업"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 30vw"
                />
              </div>
            </div>
          </div>

        </section>

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
              <h2
                className="font-display mb-6 leading-[1.1]"
                style={{ color: "var(--color-ink)", fontSize: "clamp(2.1rem, 7vw, 3.2rem)" }}
              >
                Forest &amp;
                <br />
                Linen
              </h2>
              <p
                className="text-[15px] leading-[1.9] mb-8 text-pretty max-w-md"
                style={{ color: "var(--color-muted)" }}
              >
                이브닝캔들은 숲과 린넨, 늦은 오후의 햇살에서 영감을 받습니다.
                정제 파라핀 없이 천연 소이 왁스만 사용하고, 틀이 아닌 손끝의
                감각을 따라 하나씩 빚습니다.
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
                {PROCESS.map(({ no, title, desc }, i) => (
                  <div
                    key={no}
                    className="flex items-start gap-5 py-6"
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid var(--color-sand)",
                    }}
                  >
                    <span
                      className="font-display shrink-0 leading-none"
                      style={{ color: "var(--color-sage)", fontSize: "2.6rem" }}
                    >
                      {no}
                    </span>
                    <div className="pt-1.5">
                      <p className="text-sm font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>
                        {title}
                      </p>
                      <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
                        {desc}
                      </p>
                    </div>
                  </div>
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
              <ProductCard key={product.id} product={product} />
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
