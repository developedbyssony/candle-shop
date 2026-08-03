"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  ReactNode,
} from "react";

const STORAGE_KEY = "candle-shop-cart";

/** 같은 캔들의 색상 옵션. 사진이 한 장이라 미리보기는 CSS 필터로 색을 입힙니다. */
export type ProductColor = {
  id: string;
  label: string;
  swatch: string;
  filter?: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  scent: string;
  image: string;
  description: string;
  colors?: ProductColor[];
  /** 처음 선택된 색상. 없으면 colors의 첫 번째를 씁니다. */
  defaultColorId?: string;
};

/** 같은 상품이라도 색상이 다르면 장바구니에서 별도 항목으로 담깁니다. */
export type CartItem = Product & {
  key: string;
  quantity: number;
  color?: ProductColor;
};

export function cartKey(productId: number, colorId?: string) {
  return colorId ? `${productId}:${colorId}` : String(productId);
}

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, color?: ProductColor) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

/**
 * 장바구니는 localStorage에 저장해 결제 페이지에서 새로고침해도 유지되도록 합니다.
 * 서버 렌더링 시점에는 비어있고, 브라우저에서 구독이 시작될 때 불러옵니다.
 */
const EMPTY: CartItem[] = [];

let cartItems: CartItem[] = EMPTY;
let restored = false;
const listeners = new Set<() => void>();

function restore() {
  if (restored) return;
  restored = true;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved) as CartItem[];
    // 색상 옵션 도입 전에 담아둔 장바구니에는 key가 없어 여기서 채워줍니다.
    cartItems = parsed.map((item) =>
      item.key ? item : { ...item, key: cartKey(item.id, item.color?.id) }
    );
  } catch {
    // 저장된 값이 깨졌으면 빈 장바구니로 시작합니다.
  }
}

function subscribe(listener: () => void) {
  restore();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cartItems;
}

function getServerSnapshot() {
  return EMPTY;
}

function setCart(updater: (prev: CartItem[]) => CartItem[]) {
  cartItems = updater(cartItems);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  } catch {
    // 저장 공간이 없어도 결제 흐름은 계속 진행합니다.
  }
  listeners.forEach((listener) => listener());
}

// 함수 참조가 렌더마다 바뀌지 않도록 컴포넌트 밖에 둡니다.
function addToCart(product: Product, color?: ProductColor) {
  const key = cartKey(product.id, color?.id);
  setCart((prev) => {
    const existing = prev.find((item) => item.key === key);
    if (existing) {
      return prev.map((item) =>
        item.key === key ? { ...item, quantity: item.quantity + 1 } : item
      );
    }
    return [...prev, { ...product, key, color, quantity: 1 }];
  });
}

function removeFromCart(key: string) {
  setCart((prev) => prev.filter((item) => item.key !== key));
}

function updateQuantity(key: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(key);
    return;
  }
  setCart((prev) =>
    prev.map((item) => (item.key === key ? { ...item, quantity } : item))
  );
}

function clearCart() {
  setCart(() => []);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
