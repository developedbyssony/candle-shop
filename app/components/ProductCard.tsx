"use client";

import Image from "next/image";
import { Product, useCart } from "@/app/context/CartContext";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [colorIndex, setColorIndex] = useState(() => {
    const index =
      product.colors?.findIndex((c) => c.id === product.defaultColorId) ?? -1;
    return index < 0 ? 0 : index;
  });

  const selectedColor = product.colors?.[colorIndex];

  const handleAdd = () => {
    addToCart(product, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group flex flex-col h-full">
      <div
        className="relative aspect-[4/5] w-full overflow-hidden"
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
        />
        <span
          className="absolute top-3 left-3 text-[10px] tracking-[0.18em] uppercase px-2.5 py-1"
          style={{ background: "rgba(250,248,244,0.9)", color: "var(--color-sage-dark)" }}
        >
          {product.scent}
        </span>
      </div>

      <div className="pt-5 flex flex-col flex-1">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>
            {product.name}
          </h3>
          <span className="font-display text-lg shrink-0" style={{ color: "var(--color-ink)" }}>
            {product.price.toLocaleString()}
            <span className="text-xs ml-0.5">원</span>
          </span>
        </div>

        <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--color-muted)" }}>
          {product.description}
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
