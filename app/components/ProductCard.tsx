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
    <div
      className="rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
      style={{ background: "#fff", border: "1px solid var(--color-sand)" }}
    >
      <div className="relative h-52 w-full">
        <Image
          src={product.image}
          alt={
            selectedColor
              ? `${product.name} · ${selectedColor.label}`
              : product.name
          }
          fill
          className="object-cover"
          style={{ filter: selectedColor?.filter }}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
            {product.name}
          </h3>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full shrink-0"
            style={{ background: "var(--color-beige)", color: "var(--color-sage-dark)" }}
          >
            {product.scent}
          </span>
        </div>
        <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--color-muted)" }}>
          {product.description}
        </p>
        {product.colors && selectedColor && (
          <div className="mb-4">
            <p className="text-[11px] mb-2" style={{ color: "var(--color-muted)" }}>
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
                      border: `1.5px solid ${
                        selected ? "var(--color-sage-dark)" : "transparent"
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
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
            {product.price.toLocaleString()}원
          </span>
          <button
            onClick={handleAdd}
            className="text-xs px-4 py-2 rounded-full transition-all font-medium"
            style={{ background: added ? "#6b9b6b" : "var(--color-sage)", color: "#fff" }}
          >
            {added ? "✓ 담김" : "담기"}
          </button>
        </div>
      </div>
    </div>
  );
}
