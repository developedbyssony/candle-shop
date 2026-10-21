import { products } from "@/app/data/products";
import ProductCard from "@/app/components/ProductCard";
import Footer from "@/app/components/Footer";
import { getReviewSummaries } from "@/app/lib/reviewStore";

export default function ProductsPage() {
  const summaries = getReviewSummaries(products.map((product) => product.id));

  return (
    <>
      <main className="w-full max-w-6xl mx-auto px-5 py-14 md:py-20">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">Collection</p>
          <h1
            className="font-display"
            style={{ color: "var(--color-ink)", fontSize: "clamp(2.2rem, 9vw, 3.6rem)" }}
          >
            All Candles
          </h1>
          <p
            className="text-[14px] leading-relaxed mt-5 max-w-sm mx-auto text-pretty"
            style={{ color: "var(--color-muted)" }}
          >
            손끝으로 하나씩 빚어 같은 모양이 하나도 없습니다.
            색상은 취향에 맞게 골라보세요.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              summary={summaries.get(product.id)}
            />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
