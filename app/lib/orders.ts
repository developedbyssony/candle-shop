import { products } from "@/app/data/products";
import { getShippingFee, type PaymentMethodId } from "@/app/lib/checkout";

export type OrderItem = {
  /** 같은 상품이라도 색상이 다르면 다른 항목이므로 상품번호 대신 이 값을 씁니다. */
  key: string;
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: { id: string; label: string; swatch: string; filter?: string };
};

export type Orderer = {
  name: string;
  phone: string;
  email: string;
  zipcode: string;
  address: string;
  addressDetail: string;
  memo: string;
};

export type Order = {
  id: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  method: PaymentMethodId;
  orderer: Orderer;
  paymentKey: string;
  paidAt: string;
  status: "paid";
};

/** 장바구니에서 넘어온 항목 (수량만 신뢰하고 가격·색상은 서버에서 다시 조회) */
export type CartRef = { id: number; colorId?: string; quantity: number };

/**
 * 데모용 인메모리 주문 저장소.
 * 서버를 재시작하면 주문 내역이 사라집니다. 실제 운영에서는 DB로 교체하세요.
 * (개발 중 HMR로 모듈이 다시 평가돼도 유지되도록 globalThis에 보관합니다.)
 */
const globalForOrders = globalThis as unknown as {
  __candleOrders?: Map<string, Order>;
};
const orderStore = globalForOrders.__candleOrders ?? new Map<string, Order>();
globalForOrders.__candleOrders = orderStore;

export function createOrderId() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  let id = "";
  do {
    id = `EC${date}${Math.floor(1000 + Math.random() * 9000)}`;
  } while (orderStore.has(id));

  return id;
}

/**
 * 클라이언트가 보낸 장바구니를 서버의 상품 데이터로 다시 구성합니다.
 * 가격은 절대 클라이언트 값을 쓰지 않습니다.
 */
export function buildOrderItems(refs: CartRef[]): OrderItem[] {
  const items: OrderItem[] = [];

  for (const ref of refs) {
    const product = products.find((item) => item.id === ref.id);
    if (!product) continue;

    const quantity = Math.floor(ref.quantity);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99) continue;

    // 색상은 서버 데이터에서 다시 찾고, 없는 색상이 넘어오면 기본 색상으로 처리합니다.
    const color = product.colors
      ? product.colors.find((option) => option.id === ref.colorId) ??
        product.colors[0]
      : undefined;

    items.push({
      key: color ? `${product.id}:${color.id}` : String(product.id),
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      color,
    });
  }

  return items;
}

export function calculateAmount(items: OrderItem[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = getShippingFee(subtotal);

  return { subtotal, shippingFee, total: subtotal + shippingFee };
}

export function saveOrder(order: Order) {
  orderStore.set(order.id, order);
  return order;
}

export function getOrder(id: string) {
  return orderStore.get(id) ?? null;
}
