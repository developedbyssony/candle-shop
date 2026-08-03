import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { getOrder } from "@/app/lib/orders";
import { getPaymentMethodLabel } from "@/app/lib/checkout";

const cardStyle = {
  background: "#fff",
  border: "1px solid var(--color-sand)",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(iso));
}

export default async function OrderCompletePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  // 주문 데이터는 요청 시점에만 존재하므로 미리 렌더링하지 않습니다.
  await connection();

  const { orderId } = await params;
  const order = getOrder(orderId);

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="w-full max-w-md mx-auto px-5 py-24 text-center">
          <p className="text-4xl mb-5">🕯️</p>
          <p
            className="text-sm font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            주문 정보를 찾을 수 없어요
          </p>
          <p className="text-xs mb-6" style={{ color: "var(--color-muted)" }}>
            주문번호를 다시 확인해주세요
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

  const { orderer } = order;

  return (
    <>
      <Navbar />
      <main className="w-full max-w-2xl mx-auto px-5 py-12 space-y-5">
        <div className="text-center mb-2">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
            style={{ background: "var(--color-beige)", color: "var(--color-sage-dark)" }}
          >
            ✓
          </div>
          <h1
            className="text-xl font-semibold mb-1.5"
            style={{ color: "var(--color-text)" }}
          >
            결제가 완료되었어요
          </h1>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            정성껏 포장해서 빠르게 보내드릴게요
          </p>
        </div>

        <section className="rounded-2xl p-5 space-y-2.5 text-sm" style={cardStyle}>
          <div className="flex justify-between">
            <span style={{ color: "var(--color-muted)" }}>주문번호</span>
            <span className="font-medium" style={{ color: "var(--color-text)" }}>
              {order.id}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--color-muted)" }}>결제일시</span>
            <span style={{ color: "var(--color-text)" }}>
              {formatDate(order.paidAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--color-muted)" }}>결제수단</span>
            <span style={{ color: "var(--color-text)" }}>
              {getPaymentMethodLabel(order.method)}
            </span>
          </div>
        </section>

        <section className="rounded-2xl p-5" style={cardStyle}>
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            주문 상품
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
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
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                    {item.color && `${item.color.label} · `}
                    {item.quantity}개
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

          <div
            className="mt-5 pt-4 space-y-2.5 text-sm"
            style={{ borderTop: "1px solid var(--color-sand)" }}
          >
            <div className="flex justify-between">
              <span style={{ color: "var(--color-muted)" }}>상품 금액</span>
              <span style={{ color: "var(--color-text)" }}>
                {order.subtotal.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-muted)" }}>배송비</span>
              <span style={{ color: "var(--color-text)" }}>
                {order.shippingFee === 0
                  ? "무료"
                  : `${order.shippingFee.toLocaleString()}원`}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-medium" style={{ color: "var(--color-text)" }}>
                총 결제 금액
              </span>
              <span
                className="text-lg font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                {order.total.toLocaleString()}원
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl p-5" style={cardStyle}>
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            배송지
          </h2>
          <div className="text-sm space-y-1.5" style={{ color: "var(--color-text)" }}>
            <p className="font-medium">
              {orderer.name}
              <span className="ml-2 font-normal" style={{ color: "var(--color-muted)" }}>
                {orderer.phone}
              </span>
            </p>
            <p style={{ color: "var(--color-muted)" }}>
              ({orderer.zipcode}) {orderer.address} {orderer.addressDetail}
            </p>
            {orderer.memo && (
              <p className="text-xs pt-1" style={{ color: "var(--color-sage-dark)" }}>
                {orderer.memo}
              </p>
            )}
          </div>
        </section>

        <div className="flex gap-2.5 pt-2">
          <Link
            href="/products"
            className="flex-1 text-center text-sm py-3.5 rounded-full font-medium"
            style={{ background: "var(--color-sage)", color: "#fff" }}
          >
            쇼핑 계속하기
          </Link>
          <Link
            href="/"
            className="flex-1 text-center text-sm py-3.5 rounded-full font-medium"
            style={{
              background: "#fff",
              border: "1px solid var(--color-sand)",
              color: "var(--color-text)",
            }}
          >
            홈으로
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
