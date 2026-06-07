"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { totalCount } = useCart();
  const pathname = usePathname();

  const links = [
    { href: "/", label: "홈" },
    { href: "/products", label: "상품" },
    { href: "/cart", label: "장바구니" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-sm border-b"
      style={{
        background: "rgba(250,248,244,0.92)",
        borderColor: "var(--color-sand)",
      }}
    >
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-semibold tracking-[0.2em]"
          style={{ color: "var(--color-brown)" }}
        >
          Evening Candle
        </Link>
        <div className="flex items-center gap-6">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;
            const isCart = href === "/cart";
            return (
              <Link
                key={href}
                href={href}
                className="relative text-sm transition-colors"
                style={{
                  color: isActive ? "var(--color-sage)" : "var(--color-muted)",
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
      </div>
    </nav>
  );
}
