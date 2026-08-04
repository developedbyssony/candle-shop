import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { Providers } from "@/app/providers";
import CandleColorFilters from "@/app/components/CandleColorFilters";
import "./globals.css";

// 라틴 문자·숫자용 디스플레이 세리프만 셀프 호스팅합니다(한글은 Pretendard).
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
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
    <html lang="ko" className={`h-full ${playfair.variable}`}>
      <head>
        {/* Pretendard는 외부 CDN이라 연결을 미리 열어 첫 렌더를 앞당깁니다. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: "var(--color-cream)" }}>
        <CandleColorFilters />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
