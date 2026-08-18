"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product, useCart } from "@/app/context/CartContext";
import StarRating from "@/app/components/StarRating";
import { getInitialColorIndex } from "@/app/lib/productColor";
import { formatSize } from "@/app/lib/productSize";
import type { ReviewSummary } from "@/app/lib/reviews";

/**
 * 상세 페이지에서 사진과 구매 영역을 함께 담당합니다.
 *
 * 사진에 걸리는 색상 필터가 사용자가 고른 색에 따라 바뀌기 때문에, 사진과
 * 색상 선택은 같은 클라이언트 컴포넌트 안에 있어야 합니다.
 */
export default function ProductPurchase({
  product,
  summary,
}: {
  product: Product;
  /** 리뷰 요약. 서버 컴포넌트인 상세 페이지에서 읽어 넘겨줍니다. */
  summary?: ReviewSummary;
}) {
  const { addToCart } = useCart();
  const [colorIndex, setColorIndex] = useState(() =>
    getInitialColorIndex(product)
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedColor = product.colors?.[colorIndex];

  const handleAdd = () => {
    addToCart(product, selectedColor, quantity);
    setAdded(true);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
      {/* fill 이미지의 부모는 position:relative여야 하므로(next/image 규칙),
          스크롤 고정은 바깥 div가 맡고 사진은 안쪽 relative div에 담습니다. */}
      <div className="md:sticky md:top-24">
        <div
          className="relative aspect-square w-full overflow-hidden"
          style={{ background: product.imageBackground ?? "var(--color-beige)" }}
        >
          <Image
            src={product.image}
            alt={
              selectedColor
                ? `${product.name} · ${selectedColor.label}`
                : product.name
            }
            fill
            className="object-contain"
            style={{ filter: selectedColor?.filter }}
            sizes="(max-width: 767px) 100vw, 50vw"
            // 상세 페이지 첫 화면의 주인공이라 먼저 받아옵니다.
            priority
            // 색상 필터가 압축 얼룩을 증폭시켜 기본 화질(75)보다 높입니다.
            quality={98}
          />
          {product.wickImage && (
            // 심지만 오려낸 이미지를 필터 없이 얹어 색을 바꿔도 심지는 그대로 둡니다.
            <Image
              src={product.wickImage}
              alt=""
              aria-hidden
              fill
              className="object-contain"
              sizes="(max-width: 767px) 100vw, 50vw"
              priority
              quality={98}
            />
          )}
          <span
            className="absolute top-4 left-4 text-[10px] tracking-[0.18em] uppercase px-2.5 py-1"
            style={{ background: "rgba(250,248,244,0.9)", color: "var(--color-sage-dark)" }}
          >
            {product.scent}
          </span>
        </div>
      </div>

      <div>
        <h1
          className="headline text-2xl md:text-3xl mb-3"
          style={{ color: "var(--color-ink)" }}
        >
          {product.name}
        </h1>

        {summary && summary.count > 0 && (
          <a
            href="#reviews"
            className="inline-flex items-center gap-2 mb-3 transition-opacity hover:opacity-70"
          >
            <StarRating value={summary.average} size={14} />
            <span className="text-[12px]" style={{ color: "var(--color-muted)" }}>
              {summary.average.toFixed(1)} · 후기 {summary.count}개
            </span>
          </a>
        )}

        <p className="font-display text-2xl mb-6" style={{ color: "var(--color-ink)" }}>
          {product.price.toLocaleString()}
          <span className="text-sm ml-0.5">원</span>
        </p>
        <p
          className="text-[14px] leading-relaxed mb-2 text-pretty"
          style={{ color: "var(--color-muted)" }}
        >
          {product.description}
        </p>

        <p className="text-[13px] mb-8" style={{ color: "var(--color-muted)" }}>
          {formatSize(product.size)}
        </p>

        {product.colors && selectedColor && (
          <div className="mb-8">
            <p className="text-[11px] mb-3" style={{ color: "var(--color-muted)" }}>
              색상 · <span style={{ color: "var(--color-text)" }}>{selectedColor.label}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color, index) => {
                const selected = index === colorIndex;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => {
                      setColorIndex(index);
                      setAdded(false);
                    }}
                    aria-label={color.label}
                    aria-pressed={selected}
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      border: `1px solid ${selected ? "var(--color-ink)" : "transparent"}`,
                    }}
                  >
                    <span
                      className="block w-7 h-7 rounded-full"
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

        <div className="mb-6">
          <p className="text-[11px] mb-3" style={{ color: "var(--color-muted)" }}>
            수량
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="수량 줄이기"
              className="w-9 h-9 rounded-full border text-sm transition-opacity disabled:opacity-40"
              style={{ borderColor: "var(--color-sand)", color: "var(--color-muted)" }}
            >
              −
            </button>
            <span
              className="w-6 text-center text-sm"
              style={{ color: "var(--color-text)" }}
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="수량 늘리기"
              className="w-9 h-9 rounded-full border text-sm"
              style={{ borderColor: "var(--color-sand)", color: "var(--color-muted)" }}
            >
              +
            </button>
            <span className="ml-auto text-sm" style={{ color: "var(--color-text)" }}>
              합계{" "}
              <strong className="font-semibold">
                {(product.price * quantity).toLocaleString()}원
              </strong>
            </span>
          </div>
        </div>

        <button type="button" onClick={handleAdd} className="btn-solid w-full">
          장바구니 담기
        </button>

        {added && (
          <div
            className="mt-3 flex items-center justify-between gap-3 px-4 py-3 text-[13px]"
            style={{ background: "var(--color-beige)", color: "var(--color-sage-dark)" }}
            role="status"
          >
            <span>✓ 장바구니에 담았습니다</span>
            <Link
              href="/cart"
              className="underline underline-offset-2 shrink-0"
              style={{ color: "var(--color-ink)" }}
            >
              장바구니 보기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
