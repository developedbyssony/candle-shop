import Link from "next/link";
import Image from "next/image";
import { products } from "@/app/data/products";
import type { Product } from "@/app/context/CartContext";
import HeroCollage from "@/app/components/HeroCollage";
import Reveal from "@/app/components/Reveal";
import Footer from "@/app/components/Footer";
import TicketStub from "@/app/components/TicketStub";
import ScrollFx from "@/app/components/ScrollFx";
import Sticker from "@/app/components/Sticker";
import ColorTryOn from "@/app/components/ColorTryOn";

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

// 고르는 방법 세 가지. cover는 즉석 사진으로 보여 줄 대표 상품 id입니다.
const KINDS = [
  {
    no: "01",
    title: "오브제 캔들",
    desc: "치즈 한 조각, 숲속 부엉이, 말차 컵케이크. 불을 붙이지 않아도 방 한쪽을 채우는 작은 조각품이에요.",
    cover: 2,
  },
  {
    no: "02",
    title: "필라 캔들",
    desc: "트위스트, 코듀로이, 베이직. 식탁에도 선반에도 잘 어울리는 기둥 모양 캔들이에요.",
    cover: 4,
  },
  {
    no: "03",
    title: "자 캔들",
    desc: "유리 용기에 담아 오래, 고르게 타요. 다 쓰고 나면 작은 소품 그릇으로 다시 쓸 수 있어요.",
    cover: 16,
  },
];

type OccasionPhoto = { src: string; name: string; alt: string; background: string };

const productPhoto = (id: number): OccasionPhoto => {
  const product = byId(id);
  return { src: product.image, name: product.name, alt: product.name, background: photoBackground(product) };
};

/*
  이런 날에 어울리는 캔들. 상황마다 어울리는 상품 하나를 붙입니다.
  상품 목록에 아직 없는 캔들은 사진을 따로 둡니다(흰 바탕을 순백으로 맞춰 정사각형으로 만든 webp).
*/
const OCCASIONS: { label: string; photo: OccasionPhoto }[] = [
  // 생일 선물은 치즈를 문 햄스터 캔들. 상품 목록에 아직 없어 사진을 따로 둡니다(흰 바탕 정사각형 webp).
  {
    label: "생일 선물",
    photo: {
      src: "/home/hamster-candle.webp",
      name: "치즈 문 햄스터",
      alt: "치즈 조각을 품에 안은 아이보리색 햄스터 모양 캔들",
      background: "#ffffff",
    },
  },
  // 숲속 부엉이(2)는 바로 위 오브제 캔들 사진과 겹쳐서, 어느 집에나 어울리는 단정한 리본 볼(13)로 둡니다.
  { label: "집들이", photo: productPhoto(13) },
  // 고마운 마음은 구슬 네 개를 네잎처럼 붙인 버블 캔들(아이보리·핑크 두 개).
  {
    label: "고마운 마음",
    photo: {
      src: "/home/clover-bubble-candle.webp",
      name: "네잎 버블",
      alt: "구슬 네 개를 네잎 모양으로 붙인 아이보리색과 분홍색 캔들 두 개",
      background: "#ffffff",
    },
  },
  { label: "나를 위한 저녁", photo: productPhoto(1) },
  { label: "기념일", photo: productPhoto(5) },
  // 심지가 있는 유령 캔들이라 '불 없이 향기만'은 맞지 않아, 유령이 어울리는 날로 이름을 바꿨습니다.
  {
    label: "할로윈 파티",
    photo: {
      src: "/home/ghost-candle.webp",
      name: "꼬마 유령",
      alt: "두 팔을 벌린 아이보리색 꼬마 유령 모양 캔들",
      background: "#ffffff",
    },
  },
];

/*
  '색 골라 보기'에서 고를 수 있는 왁스 색. 3D 유리컵 캔들에 칠하므로 사진 필터 없이 색 값(swatch)만 씁니다.
  모든 상품 팔레트가 같은 색 id·이름을 쓰니 치즈 캔들 팔레트를 그대로 빌려 와 상세 페이지 색 이름과 맞춥니다.
*/
const TRY_COLORS = byId(1).colors ?? [];
const TRY_INITIAL_COLOR = "ivory";

/*
  손으로 붙인 앨범처럼 보이도록 기울기·크기·높이·테이프를 사진마다 따로 정합니다.
  좌우를 번갈아 기울이거나 같은 자리에 테이프를 붙이면 규칙이 보여 오히려 기계적으로 읽혀서,
  값을 일부러 고르지 않게 두었습니다. 테이프는 세 장 중 한 장 꼴로만 붙입니다.
*/
const KIND_PLACEMENT = [
  { tilt: "-rotate-[1.4deg]", size: "w-[86%] md:w-[80%]", nudge: "md:translate-y-4", tape: "-top-3 -right-4 w-[30%] rotate-[38deg]" },
  { tilt: "rotate-[0.5deg]", size: "w-[80%] md:w-[72%]", nudge: "md:-translate-x-6", tape: null },
  { tilt: "rotate-[1.8deg]", size: "w-[84%] md:w-[78%]", nudge: "", tape: null },
];

const OCCASION_PLACEMENT = [
  { tilt: "-rotate-[1.8deg]", nudge: "", tape: null },
  { tilt: "rotate-[0.4deg]", nudge: "mt-5", tape: "-top-2 -left-3 w-[40%] rotate-[-31deg]" },
  { tilt: "rotate-[1.2deg]", nudge: "md:-mt-2", tape: null },
  { tilt: "-rotate-[0.6deg]", nudge: "mt-2 md:mt-7", tape: null },
  { tilt: "rotate-[2deg]", nudge: "md:mt-3", tape: "-top-3 left-[18%] w-[52%] rotate-[2deg]" },
  { tilt: "-rotate-[1.1deg]", nudge: "mt-6 md:mt-0", tape: null },
];

/*
  '나만의 캔들 고르기' 제목 아래 풀로 붙인 종이 스티커 줄(동그라미·둘레 글씨 동그라미·둥근 네모·가로 네모).
  문구는 사이트 다른 곳에 이미 적힌 사실만 영문으로 옮겨 씁니다
  (손으로 빚은 캔들, 소이 왁스, 안전기준확인 마크, 카카오 상담의 선물 포장 안내, 입장권의 저녁 7시).
  색은 오래된 인쇄물처럼 채도를 살짝 눌렀고, 기울기·높이·크기·구김(crease)은 하나씩 따로 줘
  같은 틀로 찍은 듯 보이지 않게 합니다.
*/
const STICKERS = [
  { shape: "circle", color: "#f7b51e", crease: 0, text: "Handmade", motion: "lift", place: "-rotate-[6deg] w-[104px] md:w-[148px]" },
  { shape: "square", color: "#7ea8ec", crease: 2, text: "Soy\nWax", motion: "peel", place: "rotate-[3deg] w-[84px] md:w-[116px] md:translate-y-3" },
  { shape: "ring", color: "#f26b2a", crease: 4, text: "Safety\nChecked", motion: "spin", place: "-rotate-[2deg] w-[100px] md:w-[136px] -translate-y-1" },
  { shape: "wide", color: "#f68ea0", crease: 1, text: "Gift Wrap on Request", motion: "press", place: "rotate-[4deg] md:translate-y-2" },
  { shape: "circle", color: "#9fd06a", crease: 3, text: "7 PM", motion: "swing", place: "-rotate-[4deg] w-[86px] md:w-[112px]" },
] as const;

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
          {/* 크라프트지 띠를 위아래로 찢어 앨범에 붙인 것처럼 보이게 합니다. */}
          <div className="torn-band" style={{ backgroundColor: "var(--color-beige)" }}>
            <div className="max-w-6xl mx-auto px-5 pt-16 pb-14 md:pt-24 md:pb-24 text-center">
              <p
                className="choose-ink mb-4 md:mb-6 text-base md:text-lg font-medium tracking-[0.04em] leading-snug"
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
              {/* 제목 아래 크라프트지 띠 위에 붙인 종이 스티커 줄 */}
              <ul
                aria-label="이브닝 캔들의 약속"
                className="mt-10 md:mt-14 flex flex-wrap items-center justify-center gap-x-3 gap-y-4 md:gap-x-8"
              >
                {STICKERS.map(({ shape, color, crease, motion, text, place }) => (
                  <li key={text}>
                    {/* 참고한 붙임 스티커처럼 글자를 크고 굵게(소품 글씨라 다섯 단계 글자 크기의 예외). */}
                    <Sticker shape={shape} color={color} crease={crease} motion={motion} className={`${place} text-[16px] md:text-[21px] whitespace-pre-line`}>
                      {text}
                    </Sticker>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/*
            이 사이트에서 방문자가 직접 해 보는 단 하나: 모양과 색을 골라 사진으로 바로 확인합니다.
            "나만의 캔들 고르기" 제목 바로 아래에 두어, 고르는 이야기를 꺼내자마자 직접 골라 볼 수 있게 합니다.
          */}
          <div className="max-w-6xl mx-auto px-5 pt-16 md:pt-24">
            <ColorTryOn colors={TRY_COLORS} initialColorId={TRY_INITIAL_COLOR} />
          </div>

          {/* 색 골라 보기 아래 즉석 사진 칸. 바탕은 앨범 종이 그대로 두어 사진이 주인공이 되게 합니다. */}
          <div data-stagger className="max-w-6xl mx-auto px-5 pt-16 pb-16 md:pt-24 md:pb-24 space-y-20 md:space-y-28">
            {KINDS.map(({ no, title, desc, cover }, i) => {
              const product = byId(cover);
              const flip = i % 2 === 1;
              const place = KIND_PLACEMENT[i];
              return (
                <div
                  key={no}
                  className="grid grid-cols-1 md:grid-cols-2 gap-9 md:gap-16 items-center"
                >
                  {/* 이 섹션의 주인공 소품은 즉석 사진 하나입니다. PC에서는 사진과 글을 좌우로 번갈아 둡니다. */}
                  <Link
                    href="/products"
                    className={`group block mx-auto ${place.size} ${place.tilt} ${place.nudge} ${flip ? "md:order-2" : ""}`}
                    aria-label={`${title} 보러 가기`}
                  >
                    <div className="snapshot group-hover:-translate-y-1.5">
                      <div
                        className="relative aspect-[4/5] w-full overflow-hidden"
                        style={{ background: photoBackground(product) }}
                      >
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          sizes="(max-width: 768px) 88vw, 460px"
                        />
                      </div>
                      <p className="snapshot-caption text-[13px] font-semibold">{product.name}</p>
                      {place.tape && <span aria-hidden className={`masking-tape ${place.tape}`} />}
                    </div>
                  </Link>
                  <div>
                    <h3
                      className="headline mb-5"
                      style={{ fontSize: "var(--text-heading)" }}
                    >
                      {title}
                    </h3>
                    <p
                      className="text-base leading-[1.8] text-pretty max-w-md"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 이런 날에: 주인공 소품은 앨범에 붙인 즉석 사진 묶음 ───────── */}
        <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-base font-medium mb-3" style={{ color: "var(--color-muted)" }}>
              어떤 날이든
            </p>
            <h2 className="headline" style={{ fontSize: "var(--text-heading)" }}>
              그날에 어울리는
              <br />
              캔들이 있어요.
            </h2>
          </div>

          <div data-stagger className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-10 md:gap-y-14">
            {OCCASIONS.map(({ label, photo }, i) => {
              const place = OCCASION_PLACEMENT[i];
              return (
                <Link
                  key={label}
                  // 상세 페이지를 없애서, 고른 날에 어울리는 캔들은 전체 상품 목록에서 바로 담습니다.
                  href="/products"
                  className={`group block ${place.tilt} ${place.nudge}`}
                >
                  <div className="snapshot group-hover:-translate-y-1.5">
                    <div
                      className="relative aspect-square overflow-hidden"
                      style={{ background: photo.background }}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                        sizes="(max-width: 768px) 45vw, 340px"
                      />
                    </div>
                    <div className="snapshot-caption">
                      <p className="text-base md:text-lg font-semibold tracking-tight leading-tight">
                        {label}
                      </p>
                      {/* 한글은 글자 사이에서도 줄이 바뀌어 '태블/릿'처럼 끊기므로 낱말 단위로만 바꿉니다(break-keep). */}
                      <p className="text-[13px] mt-1 opacity-70 break-keep">
                        {/* 이름이 두 줄로 넘어가도 화살표만 홀로 남지 않게 앞 낱말과 붙여 둡니다(줄바꿈 없는 공백). */}
                        {photo.name}&nbsp;<Arrow />
                      </p>
                    </div>
                    {place.tape && <span aria-hidden className={`masking-tape ${place.tape}`} />}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── 브랜드 이야기 ──────────────────────────────────────── */}
        {/* 히어로의 '브랜드 이야기' 버튼이 여기로 내려옵니다. 주인공 소품은 크라프트지 띠 위의 빈티지 인화 사진 하나입니다. */}
        <section id="story" className="torn-band" style={{ backgroundColor: "var(--color-beige)" }}>
          <div className="max-w-6xl mx-auto px-5 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* 오래 들고 다닌 인화 사진(.worn-print). 그림자는 잘린 모양을 따라가도록 부모의 drop-shadow로 줍니다. */}
              <div className="relative w-[86%] md:w-[80%] mx-auto rotate-[-1.3deg] md:translate-x-3 drop-shadow-[0_5px_6px_rgba(43,33,24,0.35)]">
                <div className="worn-print">
                  <div className="worn-print-photo aspect-[4/5] w-full">
                    <Image
                      fill
                      className="object-cover"
                      src={IMG.morningMatch}
                      alt="침대에 누워 캔들에 성냥불을 붙이는 손"
                      sizes="(max-width: 768px) 86vw, 440px"
                    />
                  </div>
                </div>
                <span aria-hidden className="masking-tape -top-2.5 left-[41%] w-[33%] rotate-[-3deg]" />
              </div>
              <Reveal>
                <p className="text-base font-medium mb-5" style={{ color: "var(--color-muted)" }}>
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
                  className="text-base leading-[1.8] text-pretty max-w-md"
                  style={{ color: "var(--color-text)" }}
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
