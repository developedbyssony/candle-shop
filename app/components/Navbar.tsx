"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { usePathname } from "next/navigation";

const KAKAO_OPEN_CHAT_URL = "https://open.kakao.com/o/srDgHd2h";

const links = [
  { href: "/", label: "홈" },
  { href: "/products", label: "상품" },
  { href: "/#story", label: "브랜드" },
  { href: "/cart", label: "장바구니" },
];

export default function Navbar() {
  const { totalCount } = useCart();
  const pathname = usePathname();
  // 메뉴 안의 링크는 각각 클릭 시 메뉴를 닫습니다.
  const [open, setOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const isHome = pathname === "/";

  // 홈 최상단에서만 배경을 비웁니다. 스크롤하면 다시 채워 글씨가 묻히지 않게 합니다.
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setAtTop(window.scrollY < 24);
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHome]);

  // 모바일 히어로 사진 위에 겹칠 때만 투명 + 흰 글씨입니다.
  const overHero = isHome && atTop && !open;
  // 스크롤 후에는 모바일에서 아이보리 반투명 + 블러로 은은하게 깔고 글씨는 검게 둡니다.
  // 메뉴를 펼쳤을 때만 메뉴 항목이 읽히도록 불투명도를 올립니다.
  const scrolledSurface = open
    ? "bg-[rgba(250,248,244,0.96)] border-[color:var(--color-sand)] backdrop-blur-md"
    : "bg-[rgba(250,248,244,0.72)] border-[rgba(232,223,208,0.7)] backdrop-blur-md md:bg-[rgba(250,248,244,0.94)] md:border-[color:var(--color-sand)] md:backdrop-blur-sm";
  const surface = overHero
    ? "bg-transparent border-transparent md:bg-[rgba(250,248,244,0.94)] md:border-[color:var(--color-sand)] md:backdrop-blur-sm"
    : scrolledSurface;
  const markColor = overHero
    ? "text-white md:text-[color:var(--color-ink)]"
    : "text-[color:var(--color-ink)]";

  return (
    <nav className={`sticky top-0 z-50 border-b transition-colors duration-300 ${surface}`}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Link href="/" className={`font-display text-xl md:text-2xl shrink-0 ${markColor}`}>
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
