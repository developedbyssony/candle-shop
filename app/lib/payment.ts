import type { PaymentMethodId } from "@/app/lib/checkout";

export type PaymentRequest = {
  orderId: string;
  amount: number;
  method: PaymentMethodId;
  buyerName: string;
};

export type PaymentResult =
  | { ok: true; paymentKey: string; approvedAt: string }
  | { ok: false; message: string };

/**
 * 결제 승인 요청.
 *
 * ⚠️ 지금은 실제 PG사 연동 없이 승인을 흉내내는 데모 구현입니다.
 * 토스페이먼츠 · 포트원 등 실제 PG를 붙일 때는 이 함수 내부만 교체하면 되고,
 * 호출하는 쪽(app/actions/checkout.ts)은 그대로 두면 됩니다.
 *
 * 실연동 예시:
 *   const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
 *     method: "POST",
 *     headers: {
 *       Authorization: `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64")}`,
 *       "Content-Type": "application/json",
 *     },
 *     body: JSON.stringify({ paymentKey, orderId, amount }),
 *   });
 */
export async function requestPayment({
  orderId,
  amount,
  method,
}: PaymentRequest): Promise<PaymentResult> {
  // PG 결제창 응답 대기 시간을 흉내냅니다.
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!Number.isInteger(amount) || amount <= 0) {
    return { ok: false, message: "결제 금액이 올바르지 않습니다." };
  }

  if (amount > 10_000_000) {
    return {
      ok: false,
      message: "1회 결제 한도(1,000만원)를 초과했습니다. 고객센터로 문의해주세요.",
    };
  }

  return {
    ok: true,
    paymentKey: `demo_${method}_${orderId}_${Math.random().toString(36).slice(2, 10)}`,
    approvedAt: new Date().toISOString(),
  };
}
