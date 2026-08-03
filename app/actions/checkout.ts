"use server";

import {
  EMAIL_PATTERN,
  PHONE_PATTERN,
  ZIPCODE_PATTERN,
  isPaymentMethodId,
  type CheckoutState,
} from "@/app/lib/checkout";
import {
  buildOrderItems,
  calculateAmount,
  createOrderId,
  saveOrder,
  type CartRef,
  type Orderer,
} from "@/app/lib/orders";
import { requestPayment } from "@/app/lib/payment";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseCartRefs(raw: string): CartRef[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry) => {
      if (typeof entry !== "object" || entry === null) return [];
      const { id, colorId, quantity } = entry as Record<string, unknown>;
      if (typeof id !== "number" || typeof quantity !== "number") return [];
      return [
        {
          id,
          colorId: typeof colorId === "string" ? colorId : undefined,
          quantity,
        },
      ];
    });
  } catch {
    return [];
  }
}

/**
 * 주문 생성 + 결제 승인.
 * 로그인 없이 누구나 호출할 수 있는 액션이므로, 결제 금액은 클라이언트가 보낸 값을
 * 쓰지 않고 서버의 상품 데이터로 직접 계산합니다.
 */
export async function createOrder(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const orderer: Orderer = {
    name: text(formData, "name"),
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    zipcode: text(formData, "zipcode"),
    address: text(formData, "address"),
    addressDetail: text(formData, "addressDetail"),
    memo: text(formData, "memo"),
  };
  const methodValue = text(formData, "method");
  const method = isPaymentMethodId(methodValue) ? methodValue : null;
  const agreed = formData.get("agree") === "on";
  const items = buildOrderItems(parseCartRefs(text(formData, "items")));

  const errors: CheckoutState["errors"] = {};

  if (orderer.name.length < 2) errors.name = "이름을 2자 이상 입력해주세요";
  if (!PHONE_PATTERN.test(orderer.phone))
    errors.phone = "휴대폰 번호를 정확히 입력해주세요";
  if (orderer.email && !EMAIL_PATTERN.test(orderer.email))
    errors.email = "이메일 형식을 확인해주세요";
  if (!ZIPCODE_PATTERN.test(orderer.zipcode))
    errors.zipcode = "우편번호 5자리를 입력해주세요";
  if (orderer.address.length < 5) errors.address = "주소를 입력해주세요";
  if (!orderer.addressDetail) errors.addressDetail = "상세주소를 입력해주세요";
  if (!method) errors.method = "결제수단을 선택해주세요";
  if (!agreed) errors.agree = "결제 진행에 동의해주세요";
  if (items.length === 0) errors.items = "주문할 상품이 없어요";

  if (Object.keys(errors).length > 0 || !method) {
    return {
      status: "error",
      message: "입력하신 정보를 다시 확인해주세요",
      errors,
    };
  }

  const { subtotal, shippingFee, total } = calculateAmount(items);
  const orderId = createOrderId();

  const payment = await requestPayment({
    orderId,
    amount: total,
    method,
    buyerName: orderer.name,
  });

  if (!payment.ok) {
    return { status: "error", message: payment.message };
  }

  saveOrder({
    id: orderId,
    items,
    subtotal,
    shippingFee,
    total,
    method,
    orderer,
    paymentKey: payment.paymentKey,
    paidAt: payment.approvedAt,
    status: "paid",
  });

  return { status: "success", orderId };
}
