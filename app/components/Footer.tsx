import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="py-10 px-5 mt-auto"
      style={{ borderTop: "1px solid var(--color-sand)", background: "var(--color-beige)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* 안전기준확인 로고 */}
        <div className="flex justify-center mb-8">
          <Link
            href="https://thesafelife.org/Safety_Life1/?bmode=view&idx=123915750"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://cdn.imweb.me/upload/S20230509b9760a67d4d2a/a87754417c44c.png"
              alt="안전기준확인 마크"
              width={100}
              height={100}
              className="object-contain"
            />
          </Link>
        </div>

        {/* 사업자 정보 */}
        <div
          className="text-center text-xs leading-6"
          style={{ color: "var(--color-muted)" }}
        >
          <p className="font-medium mb-1" style={{ color: "var(--color-text)" }}>
            이브닝캔들
          </p>
          <p>대표 : 장효진 &nbsp;|&nbsp; 사업자등록번호 : 588-39-01080</p>
          <p>주소 : 서울시 노원구 노원로 30길-32 중앙하이츠빌라 103동 501호</p>
          <p>고객센터 : 0506-503-5123</p>
          <p className="mt-3">© 2025 Evening Candle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
