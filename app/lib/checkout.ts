// 결제/주문 공용 상수 (서버 · 클라이언트 양쪽에서 사용)

export type PaymentMethodId = "card" | "transfer" | "kakaopay" | "naverpay";

export const PAYMENT_METHODS: {
  id: PaymentMethodId;
  label: string;
  hint: string;
}[] = [
  { id: "card", label: "신용 · 체크카드", hint: "국내 모든 카드" },
  { id: "transfer", label: "실시간 계좌이체", hint: "은행 계좌" },
  { id: "kakaopay", label: "카카오페이", hint: "간편결제" },
  { id: "naverpay", label: "네이버페이", hint: "간편결제" },
];

export const DELIVERY_MEMOS = [
  "부재 시 문 앞에 놓아주세요",
  "부재 시 경비실에 맡겨주세요",
  "배송 전 연락 부탁드려요",
  "파손 주의해서 배송해주세요",
];

export const SHIPPING_FEE = 3000;
export const FREE_SHIPPING_THRESHOLD = 50000;

/** 5만원 이상 무료배송 */
export function getShippingFee(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function getPaymentMethodLabel(id: PaymentMethodId) {
  return PAYMENT_METHODS.find((method) => method.id === id)?.label ?? id;
}

export function isPaymentMethodId(value: unknown): value is PaymentMethodId {
  return PAYMENT_METHODS.some((method) => method.id === value);
}

/** 결제 폼에서 오류를 표시할 수 있는 항목 */
export type CheckoutField =
  | "name"
  | "phone"
  | "email"
  | "zipcode"
  | "address"
  | "addressDetail"
  | "method"
  | "items"
  | "agree";

export type CheckoutState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Partial<Record<CheckoutField, string>>;
  orderId?: string;
};

export const initialCheckoutState: CheckoutState = { status: "idle" };

export const PHONE_PATTERN = /^01[016789]-?\d{3,4}-?\d{4}$/;
export const ZIPCODE_PATTERN = /^\d{5}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
