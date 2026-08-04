import Image from "next/image";
import Link from "next/link";

const KAKAO_OPEN_CHAT_URL = "https://open.kakao.com/o/srDgHd2h";

const SHOP_LINKS = [
  { href: "/", label: "홈" },
  { href: "/products", label: "전체 상품" },
  { href: "/cart", label: "장바구니" },
];

export default function Footer() {
  return (
    <footer
      className="mt-auto px-5 pt-16 pb-14"
      style={{ background: "var(--color-ink)", color: "rgba(255,255,255,0.72)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* 상단: 브랜드 + 링크 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12">
          <div className="md:col-span-5">
            <p className="font-display text-2xl text-white mb-4">evening candle</p>
            <p className="text-[13px] leading-relaxed max-w-xs">
              숲과 린넨, 늦은 오후의 햇살에서 영감을 받은 핸드메이드 소이 캔들.
            </p>
          </div>

          <div className="md:col-span-4">
            <p className="text-[11px] tracking-[0.2em] uppercase text-white mb-4">
              상담 문의
            </p>
            <p className="text-[13px] leading-relaxed mb-5">
              향과 색상, 선물 포장까지 편하게 물어보세요.
            </p>
            <Link
              href={KAKAO_OPEN_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[13px] font-medium px-5 py-3"
              style={{ background: "#FEE500", color: "#3C1E1E" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 3C6.48 3 2 6.48 2 10.78c0 2.72 1.83 5.11 4.59 6.49-.2.73-.73 2.66-.84 3.07-.13.5.18.5.38.36.16-.11 2.5-1.68 3.52-2.37.75.11 1.53.17 2.35.17 5.52 0 10-3.48 10-7.72S17.52 3 12 3z" />
              </svg>
              카카오톡 상담하기
            </Link>
          </div>

          <nav className="md:col-span-3">
            <p className="text-[11px] tracking-[0.2em] uppercase text-white mb-4">
              바로가기
            </p>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] transition-opacity hover:opacity-70">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* 하단: 사업자 정보 */}
        <div
          className="pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.14)" }}
        >
          <div className="text-[12px] leading-6">
            <p className="text-white font-medium mb-1">이브닝캔들</p>
            <p>대표 : 장효진 &nbsp;|&nbsp; 사업자등록번호 : 588-39-01080</p>
            <p>주소 : 서울시 노원구 노원로 30길-32 중앙하이츠빌라 103동 501호</p>
            <p>고객센터 : 050-6503-5123</p>
            <p className="mt-3" style={{ color: "rgba(255,255,255,0.5)" }}>
              © 2025 Evening Candle. All rights reserved.
            </p>
          </div>

          <Link
            href="https://thesafelife.org/Safety_Life1/?bmode=view&idx=123915750"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 self-start md:self-auto transition-opacity hover:opacity-70"
          >
            <Image
              src="/safety-mark.svg"
              alt="안전기준확인 마크"
              width={72}
              height={62}
              className="object-contain"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
