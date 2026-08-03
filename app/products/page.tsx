import { products } from "@/app/data/products";
import ProductCard from "@/app/components/ProductCard";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main className="w-full max-w-5xl mx-auto px-5 py-12">
        <div className="text-center mb-10">
          <p
            className="text-xs tracking-[0.3em] mb-2 font-medium"
            style={{ color: "var(--color-sage)" }}
          >
            COLLECTION
          </p>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--color-text)" }}>
            전체 상품
          </h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
