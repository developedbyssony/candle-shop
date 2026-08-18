import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import ProductPurchase from "@/app/components/ProductPurchase";
import ReviewSection from "@/app/components/ReviewSection";
import { products } from "@/app/data/products";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/app/lib/checkout";
import { formatSize } from "@/app/lib/productSize";
import { getReviewSummaries, getReviewSummary } from "@/app/lib/reviewStore";

const KAKAO_OPEN_CHAT_URL = "https://open.kakao.com/o/srDgHd2h";

/** 상품 수가 정해져 있으니 전부 빌드 때 미리 만들어 둡니다(첫 로딩이 빠릅니다). */
export function generateStaticParams() {
  return products.map((product) => ({ productId: String(product.id) }));
}

function findProduct(productId: string) {
  return products.find((product) => String(product.id) === productId);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const product = findProduct(productId);
  if (!product) return { title: "상품을 찾을 수 없어요 · Evening Candle" };

  return {
    title: `${product.name} · Evening Candle`,
    description: product.description,
  };
}

/** 같은 목록에서 이어지는 상품 3개를 추천으로 보여줍니다. */
function getRelated(productId: number) {
  const index = products.findIndex((product) => product.id === productId);
  return [1, 2, 3].map((step) => products[(index + step) % products.length]);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = findProduct(productId);
  if (!product) notFound();

  const related = getRelated(product.id);
  const colorCount = product.colors?.length ?? 0;
  const summary = getReviewSummary(product.id);
  const relatedSummaries = getReviewSummaries(related.map((item) => item.id));

  return (
    <>
      <Navbar />
      <main className="w-full max-w-5xl mx-auto px-5 py-10 md:py-16">
        <Link
          href="/products"
          className="inline-block text-[12px] mb-8 transition-opacity hover:opacity-70"
          style={{ color: "var(--color-muted)" }}
        >
          ← 전체 상품
        </Link>

        <ProductPurchase product={product} summary={summary} />

        <section className="mt-16 md:mt-24">
          <h2 className="eyebrow mb-5">Product Info</h2>
          <dl
            className="text-[13px]"
            style={{ borderTop: "1px solid var(--color-sand)" }}
          >
            {[
              { label: "향", value: product.scent },
              {
                label: "크기",
                value: `${formatSize(product.size)} (수제 특성상 ±0.5cm 오차)`,
              },
              {
                label: "색상",
                value:
                  colorCount > 0
                    ? `${colorCount}가지 중 선택 (주문 시 선택한 색으로 제작)`
                    : "사진과 동일한 색상 한 가지",
              },
              {
                label: "배송",
                value: `${FREE_SHIPPING_THRESHOLD.toLocaleString()}원 이상 무료배송 · 미달 시 ${SHIPPING_FEE.toLocaleString()}원`,
              },
              {
                label: "제작",
                value: "주문 후 하나씩 손으로 굳혀 보내드립니다",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex gap-5 py-3.5"
                style={{ borderBottom: "1px solid var(--color-sand)" }}
              >
                <dt className="w-16 shrink-0" style={{ color: "var(--color-muted)" }}>
                  {label}
                </dt>
                <dd style={{ color: "var(--color-text)" }}>{value}</dd>
              </div>
            ))}
          </dl>

          <p
            className="text-[12px] leading-relaxed mt-6"
            style={{ color: "var(--color-muted)" }}
          >
            손으로 만들어 색과 모양이 사진과 조금씩 다를 수 있습니다. 사용 전
            심지를 5mm 정도로 잘라주시고, 한 번에 2시간을 넘기지 않게 켜주세요.
            불을 켠 캔들은 아이와 반려동물의 손이 닿지 않는 평평한 곳에 두세요.
          </p>
        </section>

        <ReviewSection productId={product.id} />

        <section
          className="mt-12 p-6 md:p-8 text-center"
          style={{ background: "var(--color-beige)" }}
        >
          <p className="text-[14px] font-medium mb-1.5" style={{ color: "var(--color-text)" }}>
            고민되면 물어보세요
          </p>
          <p className="text-[12px] mb-5" style={{ color: "var(--color-muted)" }}>
            향과 색상, 선물 포장까지 편하게 여쭤보세요.
          </p>
          <Link
            href={KAKAO_OPEN_CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            카카오톡 상담하기
          </Link>
        </section>

        <section className="mt-16 md:mt-24">
          <h2 className="eyebrow mb-8">Other Candles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                summary={relatedSummaries.get(item.id)}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
