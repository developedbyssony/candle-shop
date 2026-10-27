import Image from "next/image";
import { products } from "@/app/data/products";
import type { Product } from "@/app/data/types";
import HeroCollage from "@/app/components/HeroCollage";
import Reveal from "@/app/components/Reveal";
import Footer from "@/app/components/Footer";
import ScrollFx from "@/app/components/ScrollFx";
import Sticker from "@/app/components/Sticker";
import ColorTryOn from "@/app/components/ColorTryOn";

// 메인 화면 사진은 모두 /public/home에 webp로 둡니다(외부 요청 없이 빨리 뜨도록).
const IMG = {
  morningMatch: "/home/morning-match.webp",
};

// '나만의 캔들 고르기' 손글씨(/public/brand/choose-headline-1·2.png)의 붓 색.
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
const OCCASIONS: { label: string; href: string; photo: OccasionPhoto }[] = [
  // 생일 선물은 치즈를 문 햄스터 캔들. 상품 목록에 아직 없어 사진을 따로 둡니다(흰 바탕 정사각형 webp).
  {
    label: "생일 선물",
    href: "https://smartstore.naver.com/eveningcandle/products/13804448253",
    photo: {
      src: "/home/hamster-candle.webp",
      name: "치즈 문 햄스터",
      alt: "치즈 조각을 품에 안은 아이보리색 햄스터 모양 캔들",
      background: "#ffffff",
    },
  },
  // 숲속 부엉이(2)는 바로 위 오브제 캔들 사진과 겹쳐서, 어느 집에나 어울리는 단정한 리본 볼(13)로 둡니다.
  { label: "집들이",
    href: "https://smartstore.naver.com/eveningcandle/products/13726396031", photo: productPhoto(13) },
  // 고마운 마음은 구슬 네 개를 네잎처럼 붙인 버블 캔들(아이보리·핑크 두 개).
  {
    label: "고마운 마음",
    href: "https://smartstore.naver.com/eveningcandle/products/13804474746",
    photo: {
      src: "/home/clover-bubble-candle.webp",
      name: "네잎 버블",
      alt: "구슬 네 개를 네잎 모양으로 붙인 아이보리색과 분홍색 캔들 두 개",
      background: "#ffffff",
    },
  },
  { label: "나를 위한 저녁",
    href: "https://smartstore.naver.com/eveningcandle/products/13722073684", photo: productPhoto(1) },
  { label: "기념일",
    href: "https://smartstore.naver.com/eveningcandle/products/13725043036", photo: productPhoto(5) },
  // 심지가 있는 유령 캔들이라 '불 없이 향기만'은 맞지 않아, 유령이 어울리는 날로 이름을 바꿨습니다.
  {
    label: "할로윈 파티",
    href: "https://smartstore.naver.com/eveningcandle/products/13804391090",
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
  '나만의 캔들 고르기' 띠에 풀로 붙인 종이 스티커 다섯 장.
  한 줄로 늘어놓으면 견본표처럼 보여서, 세 장(spot: "title")은 손글씨 둘레의 빈자리(왼쪽 위, '나만의' 오른쪽,
  '고르기' 꼬리 아래)에, 두 장은 크라프트지의 찢긴 위·아래 테두리(spot: "top" | "bottom")에 반쯤 걸쳐 붙입니다.
  크기·각도·높이를 다 다르게 줘 줄로 읽히지 않게 합니다.
  - 제목 둘레: 자리·크기가 제목 상자 기준 %·cqi라 모바일에서도 같은 자리에 붙고, 손글씨 획은 가리지 않습니다.
  - 테두리: 띠는 찢긴 모양 마스크로 잘려 있어 안에 두면 스티커도 잘리므로, 띠 바깥 겹층에 붙이고 크기는 px로 둡니다.
  색은 원색이 앨범 위에서 혼자 튀고 많이 누르면 흐려 보여서, 같은 색 계열에서 채도를 조금만 눌러 둡니다.
  문구는 사이트에 이미 적힌 사실만 영문으로 씁니다
  (손으로 빚은 캔들, 소이 왁스, 안전기준확인 마크, 카카오 상담의 선물 포장 안내, 저녁 7시 불 켜는 시간).
*/
const STICKERS = [
  { spot: "title", shape: "circle", color: "#e8b44a", crease: 0, text: "Handmade", motion: "lift", place: "-left-[2%] md:-left-[8%] -top-[4%] md:-top-[12%] w-[21%] md:w-[18%] -rotate-[9deg]", size: "text-[3.3cqi] md:text-[2.8cqi]" },
  { spot: "title", shape: "circle", color: "#a4c87b", crease: 3, text: "7 PM", motion: "swing", place: "right-[2%] md:right-[5%] -top-[1%] md:-top-[4%] w-[15%] md:w-[13%] rotate-[7deg]", size: "text-[3.2cqi] md:text-[2.7cqi]" },
  { spot: "title", shape: "ring", color: "#e07240", crease: 4, text: "Safety\nChecked", motion: "spin", place: "left-[62%] md:left-[60%] top-[92%] md:top-[90%] w-[22%] md:w-[19%] -rotate-[3deg]", size: "text-[2.9cqi] md:text-[2.6cqi]" },
  // 위 테두리 오른편: 앨범 종이와 크라프트지 사이에 반쯤 걸쳐 붙입니다.
  { spot: "top", shape: "square", color: "#88a8da", crease: 2, text: "Soy\nWax", motion: "peel", place: "right-[34%] md:right-[17%] -top-[22px] md:-top-[26px] w-[54px] md:w-[68px] rotate-[8deg]", size: "text-[12px] md:text-[15px]" },
  // 아래 테두리 왼편: 찢긴 아래 가장자리에 걸쳐 다음 구간 쪽으로 반쯤 내려옵니다.
  { spot: "bottom", shape: "wide", color: "#e696a3", crease: 1, text: "Gift Wrap on Request", motion: "press", place: "left-[5%] md:left-[13%] -bottom-[18px] md:-bottom-[20px] -rotate-[5deg]", size: "text-[12px] md:text-[15px]" },
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
          {/* 띠와 테두리 스티커를 한 상자에 묶어, 스티커 자리를 띠의 위·아래 끝 기준으로 잡습니다. */}
          <div className="relative">
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
                한 장으로 쓰면 짧은 첫 줄 '나만의'가 왼쪽에 붙어 오른쪽이 비어 보여서, 줄마다 잘라 둔 그림을
                각각 가운데에 맞춰 쌓습니다. 폭(%)은 원본(1096px)에서 각 줄이 차지하던 너비라 두 줄 글씨 크기가 같게 유지됩니다.
                붓 획이 가늘어 띠 위에서 약해 보여서, 두 그림 모두 획을 바깥으로 4px씩 넓혀 살짝 굵게 구웠습니다(그만큼 그림도 8px씩 커짐). 8px은 붓 느낌이 뭉개질 만큼 무거웠습니다.
                h2의 이름은 aria-label로 한 번에 읽히게 하고, 그림 두 장은 장식으로 숨깁니다.
              */}
              {/* 제목과 스티커를 한 상자에 묶어 스티커 자리를 제목 기준으로 잡습니다(@container: 스티커 글씨도 이 폭을 따라 커짐). */}
              <div className="@container relative w-full max-w-[540px] mx-auto mt-6 md:mt-10 mb-16 md:mb-20">
              <h2 aria-label="나만의 캔들 고르기" className="w-full flex flex-col items-center">
                <Image
                  src="/brand/choose-headline-1.png"
                  alt=""
                  width={565}
                  height={202}
                  className="ink-art w-[51.6%] h-auto"
                  sizes="(max-width: 767px) 46vw, 275px"
                />
                <Image
                  src="/brand/choose-headline-2.png"
                  alt=""
                  width={968}
                  height={281}
                  className="ink-art w-[88.3%] h-auto"
                  sizes="(max-width: 767px) 79vw, 473px"
                />
              </h2>
              <ul aria-label="이브닝 캔들의 약속">
                {STICKERS.filter((sticker) => sticker.spot === "title").map(({ shape, color, crease, motion, text, place, size }) => (
                  <li key={text} className={`absolute ${place}`}>
                    {/* 붙임 스티커처럼 글자를 크고 굵게(소품 글씨라 다섯 단계 글자 크기의 예외). */}
                    <Sticker shape={shape} color={color} crease={crease} motion={motion} className={`w-full ${size} whitespace-pre-line`}>
                      {text}
                    </Sticker>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          </div>
          {/*
            찢긴 테두리에 걸친 스티커. 띠 마스크 밖이라 잘리지 않고, 가운데 폭(max-w-6xl) 안에서 자리를 잡습니다.
            바로 아래 구간 글자보다 위에 보이도록 z-10만 줍니다(아래 구간 제목과는 겹치지 않는 높이).
          */}
          <ul aria-label="이브닝 캔들의 약속(테두리)" className="absolute inset-0 max-w-6xl mx-auto z-10 pointer-events-none">
            {STICKERS.filter((sticker) => sticker.spot !== "title").map(({ shape, color, crease, motion, text, place, size }) => (
              <li key={text} className={`absolute pointer-events-auto ${place}`}>
                <Sticker shape={shape} color={color} crease={crease} motion={motion} className={`w-full ${size} whitespace-pre-line`}>
                  {text}
                </Sticker>
              </li>
            ))}
          </ul>
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
                  {/* 갈 곳이 없는 사진이라 링크 없이 붙여만 둡니다(누를 수 있어 보이지 않게 들썩임·확대도 뺐습니다). */}
                  <div className={`block mx-auto ${place.size} ${place.tilt} ${place.nudge} ${flip ? "md:order-2" : ""}`}>
                    <div className="snapshot">
                      <div
                        className="relative aspect-[4/5] w-full overflow-hidden"
                        style={{ background: photoBackground(product) }}
                      >
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 88vw, 460px"
                        />
                      </div>
                      <p className="snapshot-caption text-[13px] font-semibold">{product.name}</p>
                      {place.tape && <span aria-hidden className={`masking-tape ${place.tape}`} />}
                    </div>
                  </div>
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
            {OCCASIONS.map(({ label, href, photo }, i) => {
              const place = OCCASION_PLACEMENT[i];
              return (
                <a
                  key={label}
                  // 그날에 어울리는 캔들의 스마트스토어 상품 페이지. 다른 사이트라 새 탭으로 엽니다.
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
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
                </a>
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
