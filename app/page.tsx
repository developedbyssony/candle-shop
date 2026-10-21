import Link from "next/link";
import Image from "next/image";
import { products } from "@/app/data/products";
import type { Product } from "@/app/context/CartContext";
import HeroCollage from "@/app/components/HeroCollage";
import Reveal from "@/app/components/Reveal";
import Footer from "@/app/components/Footer";
import TicketStub from "@/app/components/TicketStub";
import ScrollFx from "@/app/components/ScrollFx";

// 메인 화면 사진은 모두 /public/home에 webp로 둡니다(외부 요청 없이 빨리 뜨도록).
const IMG = {
  morningMatch: "/home/morning-match.webp",
};

// '나만의 캔들 고르기' 손글씨(/public/brand/choose-headline.png)의 붓 색.
const CHOOSE_INK = "rgb(97, 60, 42)";

const byId = (id: number) => products.find((product) => product.id === id) as Product;

// 상품 사진은 대부분 베이지 바탕에 어울리고, 흰 배경 사진만 흰색으로 이어 줍니다.
const photoBackground = (product: Product) =>
  product.imageBackground ?? "var(--color-beige)";

// 고르는 방법 세 가지. ids는 각 종류에 속하는 상품 id입니다(개수 표시용).
const KINDS = [
  {
    no: "01",
    title: "오브제 캔들",
    desc: "치즈 한 조각, 숲속 부엉이, 말차 컵케이크. 불을 붙이지 않아도 방 한쪽을 채우는 작은 조각품이에요.",
    cover: 2,
    ids: [1, 2, 3, 5, 11, 12, 13, 14, 15],
  },
  {
    no: "02",
    title: "필라 캔들",
    desc: "트위스트, 코듀로이, 베이직. 식탁에도 선반에도 잘 어울리는 기둥 모양 캔들이에요.",
    cover: 4,
    ids: [4, 6, 7],
  },
  {
    no: "03",
    title: "자 캔들",
    desc: "유리 용기에 담아 오래, 고르게 타요. 다 쓰고 나면 작은 소품 그릇으로 다시 쓸 수 있어요.",
    cover: 16,
    ids: [16, 17],
  },
];

// 이런 날에 어울리는 캔들. 상황마다 어울리는 상품 하나를 붙입니다.
const OCCASIONS = [
  { label: "생일 선물", productId: 3 },
  { label: "집들이", productId: 2 },
  { label: "고마운 마음", productId: 15 },
  { label: "나를 위한 저녁", productId: 1 },
  { label: "기념일", productId: 5 },
  { label: "오래 곁에 둘 선물", productId: 16 },
];

function Arrow() {
  return <span aria-hidden>→</span>;
}

export default function Home() {
  return (
    <>

      <main className="w-full overflow-x-clip">
        <HeroCollage />

        {/* ── 고르는 방법 세 가지 ─────────────────────────────────── */}
        <section>
          <div style={{ background: "var(--color-beige)" }}>
            {/* 제목만 가운데에 둡니다. */}
            <div className="max-w-6xl mx-auto px-5 py-14 md:py-24 text-center">
              <p
                className="choose-ink eyebrow mb-4 md:mb-6 !text-[15px] md:!text-[19px] !tracking-[0.08em] md:!tracking-[0.16em] leading-snug"
                // 아래 손글씨 제목의 붓 색과 같은 글자색입니다.
                style={{ color: CHOOSE_INK }}
              >
                모양도, 향도, 색도 취향대로
              </p>
              {/*
                직접 쓴 캘리그래피라 폰트 대신 이미지로 넣습니다(배경은 투명).
                alt에 문구를 그대로 담아 검색엔진과 스크린리더에도 읽히게 합니다.
                입장권은 첫 줄 '나만의' 오른쪽 빈자리(그림 너비의 55%, 위에서 3%)에 붙입니다.
              */}
              <h2 className="relative w-full max-w-[540px] mx-auto">
                <Image
                  src="/brand/choose-headline.png"
                  alt="나만의 캔들 고르기"
                  width={1096}
                  height={486}
                  className="ink-art w-full h-auto"
                  sizes="(max-width: 767px) 90vw, 540px"
                />
                <TicketStub className="!absolute left-[55%] top-[3%] origin-top-left scale-[0.8] md:scale-100" />
              </h2>
            </div>
          </div>
          {/* 베이지 띠 아래를 크림색으로 부드럽게 풀어 줍니다. */}
          <div
            aria-hidden
            className="h-24 md:h-32"
            style={{
              background: "linear-gradient(to bottom, var(--color-beige), var(--color-cream))",
            }}
          />

          <div data-stagger className="max-w-6xl mx-auto px-5 pt-4 pb-16 md:pt-8 md:pb-24 space-y-16 md:space-y-28">
            {KINDS.map(({ no, title, desc, cover, ids }, i) => {
              const product = byId(cover);
              return (
                <div
                  key={no}
                  className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-16 items-center"
                >
                  {/* PC에서는 사진과 글을 번갈아 좌우에 둡니다. */}
                  <Link
                    href="/products"
                    className={`group relative aspect-[4/5] w-full overflow-hidden block ${
                      i % 2 === 1 ? "md:order-2" : ""
                    }`}
                    style={{ background: photoBackground(product) }}
                    aria-label={`${title} 보러 가기`}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </Link>
                  <div>
                    <p
                      className="font-display text-sm mb-3"
                      style={{ color: "var(--color-sage-dark)" }}
                    >
                      {no}.
                    </p>
                    <h3
                      className="headline mb-5"
                      style={{ fontSize: "clamp(2rem, 8vw, 3.4rem)" }}
                    >
                      {title}
                    </h3>
                    <p
                      className="text-[15px] leading-[1.9] mb-7 text-pretty max-w-md"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {desc}
                    </p>
                    <Link href="/products" className="btn-outline">
                      {ids.length}가지 보러 가기 <Arrow />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 이런 날에 ──────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="text-center mb-10 md:mb-14">
            <p className="eyebrow mb-4">어떤 날이든</p>
            <h2 className="headline" style={{ fontSize: "clamp(1.9rem, 7.5vw, 3.2rem)" }}>
              그날에 어울리는
              <br />
              캔들이 있어요.
            </h2>
          </div>

          <div data-stagger className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {OCCASIONS.map(({ label, productId }) => {
              const product = byId(productId);
              return (
                <Link
                  key={label}
                  href={`/products/${product.id}`}
                  className="group relative aspect-square overflow-hidden block"
                  style={{ background: photoBackground(product) }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  {/* 사진 위 글자가 잘 읽히도록 아래쪽만 살짝 어둡게 깝니다. */}
                  <div
                    className="absolute inset-x-0 bottom-0 p-3 md:p-5 pt-12"
                    style={{
                      background: "linear-gradient(to top, rgba(30,27,23,0.55), transparent)",
                    }}
                  >
                    <p className="text-white text-[15px] md:text-xl font-semibold tracking-tight">
                      {label}
                    </p>
                    <p className="text-white/80 text-[11px] md:text-xs mt-1">
                      {product.name} <Arrow />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── 브랜드 이야기 ──────────────────────────────────────── */}
        {/* 히어로의 '브랜드 이야기' 버튼이 여기로 내려옵니다. */}
        {/* '나만의 캔들 고르기'와 같은 베이지 바탕에 진한 글자를 둡니다. */}
        <section id="story" style={{ background: "var(--color-beige)" }}>
          <div className="max-w-6xl mx-auto px-5 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  fill
                  className="object-cover"
                  src={IMG.morningMatch}
                  alt="침대에 누워 캔들에 성냥불을 붙이는 손"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <Reveal>
                <p className="eyebrow mb-5" style={{ color: "color-mix(in srgb, var(--color-ink) 60%, transparent)" }}>
                  브랜드 이야기
                </p>
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
                    className="ink-art w-full max-w-[340px] md:max-w-[440px] h-auto"
                    sizes="(max-width: 767px) 340px, 440px"
                  />
                </h2>
                <p
                  className="text-[15px] leading-[1.9] text-pretty max-w-md"
                  style={{ color: "color-mix(in srgb, var(--color-ink) 78%, transparent)" }}
                >
                  이브닝 캔들은 바쁜 하루가 천천히 저무는 시간에서 시작됩니다.
                  늦은 오후의 햇살, 깨끗한 린넨의 포근함, 창문 사이로 스며드는
                  조용한 바람처럼 일상 속 작은 순간들을 향으로 담아냅니다.
                </p>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <ScrollFx />

      <Footer />
    </>
  );
}
