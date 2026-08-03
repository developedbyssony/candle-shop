import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import CandleColorFilters from "@/app/components/CandleColorFilters";
import "./globals.css";

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
    <html lang="ko" className="h-full">
      <head>
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
