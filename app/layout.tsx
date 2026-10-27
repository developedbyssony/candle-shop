import type { Metadata } from "next";
import { Playfair_Display, Special_Elite } from "next/font/google";
import { Providers } from "@/app/providers";
import CandleColorFilters from "@/app/components/CandleColorFilters";
import "./globals.css";

// 라틴 문자·숫자용 디스플레이 세리프만 셀프 호스팅합니다(한글은 Pretendard).
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

// 영문 말머리(.eyebrow)용 타자기체. 앨범에 타자로 쳐 붙인 라벨 느낌을 냅니다. 굵기는 400 하나뿐입니다.
const specialElite = Special_Elite({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-typewriter",
});
export const metadata: Metadata = {
  title: "Evening Candle",
  description: "자연에서 온 핸드메이드 소이 캔들",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-scroll-behavior: globals.css의 scroll-behavior:smooth를 라우트 이동에도
    // 그대로 쓰겠다는 표시입니다. 목록 ↔ 상세를 오갈 때 스크롤 위치가 튀지 않게 합니다.
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`h-full ${playfair.variable} ${specialElite.variable}`}
      // head의 스크립트가 그리기 전에 data-theme을 붙일 수 있어 그 차이는 경고하지 않게 합니다.
      suppressHydrationWarning
    >
      <head>
        {/* 지난번에 불을 꺼 뒀으면(다크모드) 화면을 그리기 전에 먼저 복원해 밝은 화면이 번쩍이지 않게 합니다. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`,
          }}
        />
        {/* Pretendard는 외부 CDN이라 연결을 미리 열어 첫 렌더를 앞당깁니다. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      {/* 바탕(앨범 종이 색과 얼룩)은 globals.css의 body가 맡습니다. */}
      <body className="min-h-full flex flex-col">
        <CandleColorFilters />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
