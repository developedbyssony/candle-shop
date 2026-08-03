"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useCart } from "@/app/context/CartContext";
import { createOrder } from "@/app/actions/checkout";
import {
  DELIVERY_MEMOS,
  FREE_SHIPPING_THRESHOLD,
  PAYMENT_METHODS,
  getShippingFee,
  initialCheckoutState,
} from "@/app/lib/checkout";

const cardStyle = {
  background: "#fff",
  border: "1px solid var(--color-sand)",
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p className="text-[11px] mt-1" style={{ color: "#c2705f" }}>
          {error}
        </p>
      )}
    </label>
  );
}

const inputClass =
  "w-full text-sm rounded-xl px-3.5 py-3 outline-none transition-colors focus:border-[var(--color-sage)]";
const inputStyle = {
  background: "var(--color-cream)",
  border: "1px solid var(--color-sand)",
  color: "var(--color-text)",
};

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createOrder,
    initialCheckoutState
  );
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);

  const shippingFee = getShippingFee(totalPrice);
  const total = totalPrice + shippingFee;
  const errors = state.status === "error" ? state.errors : undefined;
  const done = state.status === "success";

  // 결제가 끝나면 장바구니를 비우고 주문 완료 페이지로 이동합니다.
  useEffect(() => {
    if (state.status !== "success" || !state.orderId) return;
    clearCart();
    router.replace(`/orders/${state.orderId}`);
  }, [state, clearCart, router]);

  if (done) {
    return (
      <>
        <Navbar />
        <main className="w-full max-w-md mx-auto px-5 py-24 text-center">
          <p className="text-4xl mb-4">🕯️</p>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            결제가 완료되었어요. 주문서로 이동 중입니다…
          </p>
        </main>
        <Footer />
      </>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <main className="w-full max-w-md mx-auto px-5 py-24 text-center">
          <p className="text-4xl mb-5">🕯️</p>
          <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
            주문할 상품이 없어요
          </p>
          <Link
            href="/products"
            className="inline-block text-sm px-7 py-2.5 rounded-full font-medium"
            style={{ background: "var(--color-sage)", color: "#fff" }}
          >
            상품 보러가기
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="w-full max-w-2xl mx-auto px-5 py-10 pb-32">
        <h1
          className="text-xl font-semibold mb-8"
          style={{ color: "var(--color-text)" }}
        >
          주문 · 결제
        </h1>

        <form action={formAction} className="space-y-5">
          {/* 서버에서 가격을 다시 계산하므로 상품 번호·색상·수량만 보냅니다 */}
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(
              cart.map((item) => ({
                id: item.id,
                colorId: item.color?.id,
                quantity: item.quantity,
              }))
            )}
          />

          {/* 주문 상품 */}
          <section className="rounded-2xl p-5" style={cardStyle}>
            <h2
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--color-text)" }}
            >
              주문 상품 {cart.length}개
            </h2>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <div className="relative rounded-xl w-12 h-12 overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      style={{ filter: item.color?.filter }}
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--color-text)" }}
                    >
                      {item.name}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {item.color && `${item.color.label} · `}
                      {item.price.toLocaleString()}원 · {item.quantity}개
                    </p>
                  </div>
                  <p
                    className="text-sm font-semibold shrink-0"
                    style={{ color: "var(--color-text)" }}
                  >
                    {(item.price * item.quantity).toLocaleString()}원
                  </p>
                </div>
              ))}
            </div>
            {errors?.items && (
              <p className="text-[11px] mt-3" style={{ color: "#c2705f" }}>
                {errors.items}
              </p>
            )}
          </section>

          {/* 주문자 정보 */}
          <section className="rounded-2xl p-5 space-y-4" style={cardStyle}>
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              주문자 정보
            </h2>
            <Field label="이름" error={errors?.name}>
              <input
                name="name"
                required
                autoComplete="name"
                placeholder="홍길동"
                className={inputClass}
                style={inputStyle}
              />
            </Field>
            <Field label="휴대폰 번호" error={errors?.phone}>
              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                required
                autoComplete="tel"
                placeholder="010-1234-5678"
                className={inputClass}
                style={inputStyle}
              />
            </Field>
            <Field label="이메일 (선택)" error={errors?.email}>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="주문 내역을 받아보실 이메일"
                className={inputClass}
                style={inputStyle}
              />
            </Field>
          </section>

          {/* 배송지 */}
          <section className="rounded-2xl p-5 space-y-4" style={cardStyle}>
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              배송지
            </h2>
            <Field label="우편번호" error={errors?.zipcode}>
              <input
                name="zipcode"
                inputMode="numeric"
                maxLength={5}
                required
                autoComplete="postal-code"
                placeholder="01234"
                className={`${inputClass} max-w-[140px]`}
                style={inputStyle}
              />
            </Field>
            <Field label="주소" error={errors?.address}>
              <input
                name="address"
                required
                autoComplete="street-address"
                placeholder="서울시 노원구 노원로 30길"
                className={inputClass}
                style={inputStyle}
              />
            </Field>
            <Field label="상세주소" error={errors?.addressDetail}>
              <input
                name="addressDetail"
                required
                placeholder="103동 501호"
                className={inputClass}
                style={inputStyle}
              />
            </Field>
            <Field label="배송 메모 (선택)">
              <select
                name="memo"
                defaultValue=""
                className={inputClass}
                style={inputStyle}
              >
                <option value="">선택 안 함</option>
                {DELIVERY_MEMOS.map((memo) => (
                  <option key={memo} value={memo}>
                    {memo}
                  </option>
                ))}
              </select>
            </Field>
          </section>

          {/* 결제수단 */}
          <section className="rounded-2xl p-5" style={cardStyle}>
            <h2
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--color-text)" }}
            >
              결제수단
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {PAYMENT_METHODS.map((option) => {
                const selected = method === option.id;
                return (
                  <label
                    key={option.id}
                    className="rounded-xl px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      background: selected ? "var(--color-beige)" : "var(--color-cream)",
                      border: `1px solid ${
                        selected ? "var(--color-sage)" : "var(--color-sand)"
                      }`,
                    }}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={option.id}
                      checked={selected}
                      onChange={() => setMethod(option.id)}
                      className="sr-only"
                    />
                    <span
                      className="block text-sm font-medium"
                      style={{
                        color: selected
                          ? "var(--color-sage-dark)"
                          : "var(--color-text)",
                      }}
                    >
                      {option.label}
                    </span>
                    <span
                      className="block text-[11px] mt-0.5"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {option.hint}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors?.method && (
              <p className="text-[11px] mt-3" style={{ color: "#c2705f" }}>
                {errors.method}
              </p>
            )}
          </section>

          {/* 결제 금액 */}
          <section className="rounded-2xl p-5" style={cardStyle}>
            <h2
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--color-text)" }}
            >
              결제 금액
            </h2>
            <div className="space-y-2.5 text-sm">
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
                  {(FREE_SHIPPING_THRESHOLD - totalPrice).toLocaleString()}원 더
                  담으면 무료배송이에요
                </p>
              )}
              <div
                className="flex justify-between pt-3"
                style={{ borderTop: "1px solid var(--color-sand)" }}
              >
                <span className="font-medium" style={{ color: "var(--color-text)" }}>
                  총 결제 금액
                </span>
                <span
                  className="text-lg font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  {total.toLocaleString()}원
                </span>
              </div>
            </div>
          </section>

          {/* 동의 */}
          <label className="flex items-start gap-2.5 px-1">
            <input
              type="checkbox"
              name="agree"
              className="mt-0.5 w-4 h-4 shrink-0"
              style={{ accentColor: "var(--color-sage)" }}
            />
            <span className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
              주문 내용을 확인했으며, 결제 진행 및 개인정보 수집·이용에
              동의합니다.
            </span>
          </label>
          {errors?.agree && (
            <p className="text-[11px] px-1" style={{ color: "#c2705f" }}>
              {errors.agree}
            </p>
          )}

          {state.status === "error" && state.message && (
            <p
              className="text-xs rounded-xl px-4 py-3"
              style={{ background: "#f7ece9", color: "#c2705f" }}
            >
              {state.message}
            </p>
          )}

          {/* 모바일에서 항상 보이는 결제 버튼 */}
          <div
            className="fixed bottom-0 left-0 right-0 px-5 py-3.5 backdrop-blur-sm"
            style={{
              background: "rgba(250,248,244,0.94)",
              borderTop: "1px solid var(--color-sand)",
            }}
          >
            <button
              type="submit"
              disabled={pending}
              className="block max-w-2xl mx-auto w-full py-3.5 rounded-full text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-60"
              style={{ background: "var(--color-sage)", color: "#fff" }}
            >
              {pending
                ? "결제 진행 중…"
                : `${total.toLocaleString()}원 결제하기`}
            </button>
          </div>
        </form>
      </main>

      {pending && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
          style={{ background: "rgba(250,248,244,0.9)" }}
        >
          <p className="text-4xl mb-4 animate-pulse">🕯️</p>
          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            결제를 진행하고 있어요
          </p>
          <p className="text-xs mt-1.5" style={{ color: "var(--color-muted)" }}>
            창을 닫지 말고 잠시만 기다려주세요
          </p>
        </div>
      )}

      <Footer />
      {/* 하단 고정 결제 버튼에 가려지지 않도록 여백을 둡니다 */}
      <div className="h-20" aria-hidden />
    </>
  );
}
