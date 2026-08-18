"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, useCart } from "@/app/context/CartContext";
import StarRating from "@/app/components/StarRating";
import { getInitialColorIndex } from "@/app/lib/productColor";
import { formatSize } from "@/app/lib/productSize";
import type { ReviewSummary } from "@/app/lib/reviews";
import { useState } from "react";

export default function ProductCard({
  product,
  summary,
}: {
  product: Product;
  /** 리뷰는 서버에서 읽어 넘겨줍니다. 없으면 별점을 숨깁니다. */
  summary?: ReviewSummary;
}) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [colorIndex, setColorIndex] = useState(() =>
    getInitialColorIndex(product)
  );

  const selectedColor = product.colors?.[colorIndex];

  const handleAdd = () => {
    addToCart(product, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group flex flex-col h-full">
      {/* 카드 전체를 링크로 감싸면 색상 버튼과 담기 버튼이 링크 안에 들어가므로,
          사진과 상품명만 상세 페이지로 연결합니다. */}
      <Link
        href={`/products/${product.id}`}
        aria-label={`${product.name} 상세보기`}
        className="relative aspect-[4/5] w-full overflow-hidden block"
        style={{ background: "var(--color-beige)" }}
      >
        <Image
          src={product.image}
          alt={
            selectedColor
              ? `${product.name} · ${selectedColor.label}`
              : product.name
          }
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          style={{ filter: selectedColor?.filter }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          // 색상 필터가 채도 낮은 사진(예: 필라 캔들)의 웹P 압축 얼룩을 크게 증폭시켜
          // 기본 화질(75)보다 높여야 재색상화했을 때 매끈하게 보입니다.
          quality={98}
        />
        {product.wickImage && (
          // 심지만 오려낸 이미지를 필터 없이 그대로 얹어, 색을 바꿔도 심지는
          // 원래 색으로 보이게 합니다. 본품 이미지와 같은 크기·배치라 항상 겹쳐집니다.
          <Image
            src={product.wickImage}
            alt=""
            aria-hidden
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={98}
          />
        )}
        <span
          className="absolute top-3 left-3 text-[10px] tracking-[0.18em] uppercase px-2.5 py-1"
          style={{ background: "rgba(250,248,244,0.9)", color: "var(--color-sage-dark)" }}
        >
          {product.scent}
        </span>
      </Link>

      <div className="pt-5 flex flex-col flex-1">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>
            <Link href={`/products/${product.id}`} className="hover:opacity-70 transition-opacity">
              {product.name}
            </Link>
          </h3>
          <span className="font-display text-lg shrink-0" style={{ color: "var(--color-ink)" }}>
            {product.price.toLocaleString()}
            <span className="text-xs ml-0.5">원</span>
          </span>
        </div>

        {summary && summary.count > 0 && (
          <Link
            href={`/products/${product.id}#reviews`}
            className="flex items-center gap-1.5 mb-2.5 transition-opacity hover:opacity-70"
          >
            <StarRating value={summary.average} size={12} />
            <span className="text-[11px]" style={{ color: "var(--color-muted)" }}>
              {summary.average.toFixed(1)} ({summary.count})
            </span>
          </Link>
        )}

        <p className="text-[13px] leading-relaxed mb-2" style={{ color: "var(--color-muted)" }}>
          {product.description}
        </p>

        <p className="text-[12px] mb-5" style={{ color: "var(--color-muted)" }}>
          {formatSize(product.size)}
        </p>

        {product.colors && selectedColor && (
          <div className="mb-5">
            <p className="text-[11px] mb-2.5" style={{ color: "var(--color-muted)" }}>
              색상 · <span style={{ color: "var(--color-text)" }}>{selectedColor.label}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.colors.map((color, index) => {
                const selected = index === colorIndex;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setColorIndex(index)}
                    aria-label={color.label}
                    aria-pressed={selected}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      border: `1px solid ${
                        selected ? "var(--color-ink)" : "transparent"
                      }`,
                    }}
                  >
                    <span
                      className="block w-6 h-6 rounded-full"
                      style={{
                        background: color.swatch,
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={handleAdd}
          className={added ? "btn-solid w-full mt-auto" : "btn-outline w-full mt-auto"}
        >
          {added ? "✓ 담았습니다" : "장바구니 담기"}
        </button>
      </div>
    </div>
  );
}
