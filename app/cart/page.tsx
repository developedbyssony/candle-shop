"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useCart } from "@/app/context/CartContext";
import { FREE_SHIPPING_THRESHOLD, getShippingFee } from "@/app/lib/checkout";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const shippingFee = getShippingFee(totalPrice);

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-5 py-12">
        <h1 className="text-xl font-semibold mb-8" style={{ color: "var(--color-text)" }}>
          장바구니
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--color-muted)" }}>
            <p className="text-4xl mb-5">🕯️</p>
            <p className="text-sm mb-6">장바구니가 비어있어요</p>
            <Link
              href="/products"
              className="inline-block text-sm px-7 py-2.5 rounded-full font-medium"
              style={{ background: "var(--color-sage)", color: "#fff" }}
            >
              상품 보러가기
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl p-4"
                  style={{
                    background: "#fff",
                    border: "1px solid var(--color-sand)",
                  }}
                >
                  <div className="relative rounded-xl w-14 h-14 overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
                      {item.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                      {item.price.toLocaleString()}원
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full border text-xs transition-colors"
                      style={{ borderColor: "var(--color-sand)", color: "var(--color-muted)" }}
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm" style={{ color: "var(--color-text)" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full border text-xs transition-colors"
                      style={{ borderColor: "var(--color-sand)", color: "var(--color-muted)" }}
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold text-sm shrink-0" style={{ color: "var(--color-text)" }}>
                    {(item.price * item.quantity).toLocaleString()}원
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs shrink-0 ml-1"
                    style={{ color: "var(--color-sand)" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-5"
              style={{
                background: "#fff",
                border: "1px solid var(--color-sand)",
              }}
            >
              <div className="space-y-2.5 text-sm mb-4">
                <div className="flex justify-between">
                  <span style={{ color: "var(--color-muted)" }}>상품 금액</span>
                  <span style={{ color: "var(--color-text)" }}>
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--color-muted)" }}>배송비</span>
                  <span style={{ color: "var(--color-text)" }}>
                    {shippingFee === 0 ? "무료" : `${shippingFee.toLocaleString()}원`}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-[11px]" style={{ color: "var(--color-sage-dark)" }}>
                    {(FREE_SHIPPING_THRESHOLD - totalPrice).toLocaleString()}원 더 담으면
                    무료배송이에요
                  </p>
                )}
              </div>
              <div
                className="flex justify-between items-center mb-5 pt-4"
                style={{ borderTop: "1px solid var(--color-sand)" }}
              >
                <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                  총 결제 금액
                </span>
                <span className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                  {(totalPrice + shippingFee).toLocaleString()}원
                </span>
              </div>
              <Link
                href="/checkout"
                className="block text-center w-full py-3.5 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
                style={{ background: "var(--color-sage)", color: "#fff" }}
              >
                주문하기
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
