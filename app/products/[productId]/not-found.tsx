import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

/** 없는 상품 번호로 들어온 경우. 기본 404 화면 대신 브랜드 톤을 유지합니다. */
export default function ProductNotFound() {
  return (
    <>
      <Navbar />
      <main className="w-full max-w-md mx-auto px-5 py-24 text-center">
        <p className="text-4xl mb-5">🕯️</p>
        <p className="text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
          찾으시는 상품이 없어요
        </p>
        <p className="text-xs mb-6" style={{ color: "var(--color-muted)" }}>
          주소가 바뀌었거나 판매가 끝난 상품일 수 있어요
        </p>
        <Link href="/products" className="btn-outline">
          전체 상품 보기
        </Link>
      </main>
      <Footer />
    </>
  );
}
