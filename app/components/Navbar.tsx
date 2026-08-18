"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { usePathname } from "next/navigation";

const KAKAO_OPEN_CHAT_URL = "https://open.kakao.com/o/srDgHd2h";

const links = [
  { href: "/", label: "홈" },
  { href: "/products", label: "상품" },
  { href: "/#story", label: "브랜드" },
  { href: "/cart", label: "장바구니" },
];

/** 로고 앞에 붙는 캔들 심볼. 글자 색을 그대로 따라갑니다. */
function CandleMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* 불꽃 — 위는 뾰족하게, 아래는 반원으로 */}
      <path d="M12 2c.8 2.2 2 3.1 2 4.6a2 2 0 0 1-4 0C10 5.1 11.2 4.2 12 2z" />
      {/* 심지 */}
      <path d="M11.6 8.3h.8v1.5h-.8z" />
      {/* 몸통 — 기둥형 캔들 비율 */}
      <path d="M10.4 9.6h3.2a1.2 1.2 0 0 1 1.2 1.2v9.9a1.2 1.2 0 0 1-1.2 1.2h-3.2a1.2 1.2 0 0 1-1.2-1.2v-9.9a1.2 1.2 0 0 1 1.2-1.2z" />
    </svg>
  );
}

export default function Navbar() {
  const { totalCount } = useCart();
  const pathname = usePathname();
  // 메뉴 안의 링크는 각각 클릭 시 메뉴를 닫습니다.
  const [open, setOpen] = useState(false);

  // 아이보리 반투명 + 블러를 항상 깔고 글씨는 검게 둡니다.
  // 메뉴를 펼쳤을 때만 메뉴 항목이 읽히도록 불투명도를 올립니다.
  const surface = open
    ? "bg-[rgba(250,248,244,0.96)] border-[color:var(--color-sand)] backdrop-blur-md"
    : "bg-[rgba(250,248,244,0.72)] border-[rgba(232,223,208,0.7)] backdrop-blur-md md:bg-[rgba(250,248,244,0.94)] md:border-[color:var(--color-sand)] md:backdrop-blur-sm";
  const markColor = "text-[color:var(--color-ink)]";

  return (
    <nav className={`sticky top-0 z-50 border-b transition-colors duration-300 ${surface}`}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          // 대문자는 소문자보다 커 보여서 크기를 한 단계 낮추고 자간을 살짝 벌립니다.
          className={`font-display uppercase tracking-[0.06em] text-[17px] md:text-xl shrink-0 flex items-center gap-2 ${markColor}`}
        >
          <CandleMark className="w-[18px] h-[18px] md:w-5 md:h-5 shrink-0" />
          evening candle
        </Link>

        {/* 데스크톱 내비게이션 */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;
            const isCart = href === "/cart";
            return (
              <Link
                key={href}
                href={href}
                className="relative text-[13px] transition-colors hover:opacity-70"
                style={{
                  color: isActive ? "var(--color-ink)" : "var(--color-muted)",
                }}
              >
                {label}
                {isCart && totalCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-3.5 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium"
                    style={{ background: "var(--color-sage)" }}
                  >
                    {totalCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* 모바일 장바구니 + 메뉴 */}
        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/cart"
            aria-label="장바구니"
            className={`relative p-1 ${markColor}`}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 7h12l-1 12H7L6 7z" strokeLinejoin="round" />
              <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
            </svg>
            {totalCount > 0 && (
              <span
                className="absolute -top-0.5 -right-1 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium"
                style={{ background: "var(--color-sage)" }}
              >
                {totalCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            className={`p-1 ${markColor}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 8h16" />
                  <path d="M4 16h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 */}
      {open && (
        <div
          className="md:hidden px-5 pb-5 pt-1"
          style={{ borderTop: "1px solid var(--color-sand)" }}
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm"
              style={{
                color: pathname === href ? "var(--color-ink)" : "var(--color-muted)",
                borderBottom: "1px solid var(--color-sand)",
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            href={KAKAO_OPEN_CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-solid w-full mt-4"
          >
            카카오톡 상담하기
          </Link>
        </div>
      )}
    </nav>
  );
}
