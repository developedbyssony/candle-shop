import Link from "next/link";
import Image from "next/image";
import { products } from "@/app/data/products";
import ProductCard from "@/app/components/ProductCard";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function Home() {
  const featured = products.slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="w-full">
        {/* Hero — 풀스크린 이미지 + 텍스트 오버레이 */}
        <section className="relative h-[85vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1600&h=900&fit=crop&q=85"
            alt="Evening Candle hero"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.32)" }} />
          <div className="relative z-10 text-center px-5">
            <p className="text-xs tracking-[0.4em] mb-4 font-medium text-white/80">
              HANDMADE SOY CANDLE
            </p>
            <h1 className="text-4xl md:text-6xl font-light mb-4 leading-snug text-white">
              <span className="font-semibold">당신</span>의 <span className="font-semibold">저녁</span>을 밝혀드립니다
            </h1>
            <p className="text-sm md:text-base leading-relaxed mb-8 max-w-xs mx-auto text-white/80">
              린넨 햇살처럼 은은하게,
              <br />
              일상에 스며드는 핸드메이드 캔들
            </p>
            <Link
              href="/products"
              className="inline-block text-sm px-8 py-3 rounded-full font-medium transition-opacity hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.95)", color: "var(--color-text)" }}
            >
              컬렉션 보기
            </Link>
          </div>
        </section>

        {/* 브랜드 특징 */}
        <section className="max-w-5xl mx-auto px-5 py-14">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: "🌿", label: "천연 소이 왁스" },
              { icon: "✋", label: "100% 핸드메이드" },
              { icon: "📦", label: "2-3일 내 발송" },
            ].map(({ icon, label }) => (
              <div key={label} className="py-4">
                <p className="text-2xl mb-2">{icon}</p>
                <p className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-5">
          <hr style={{ borderColor: "var(--color-sand)" }} />
        </div>

        {/* 추천 상품 */}
        <section className="max-w-5xl mx-auto px-5 py-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
              추천 상품
            </h2>
            <Link href="/products" className="text-xs font-medium" style={{ color: "var(--color-sage)" }}>
              전체보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* About 배너 — 이미지 + 텍스트 */}
        <section className="relative overflow-hidden" style={{ minHeight: "320px" }}>
          <Image
            src="https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=1400&h=600&fit=crop&q=80"
            alt="About Evening Candle"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />
          <div className="relative z-10 flex flex-col items-center justify-center h-full py-20 px-5 text-center">
            <p className="text-xs tracking-[0.3em] mb-3 font-medium text-white/70">
              OUR STORY
            </p>
            <h2 className="text-xl md:text-2xl font-semibold mb-3 text-white">
              자연에서 영감을 받아 손으로 만듭니다
            </h2>
            <p className="text-sm leading-relaxed max-w-sm mx-auto text-white/80">
              숲, 나무, 햇살에서 영감을 받아 천연 소이 왁스와 프리미엄 향료로
              하나하나 정성스럽게 제작합니다.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
