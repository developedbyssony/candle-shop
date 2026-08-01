"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  ReactNode,
} from "react";

const STORAGE_KEY = "candle-shop-cart";

export type Product = {
  id: number;
  name: string;
  price: number;
  scent: string;
  image: string;
  description: string;
};

type CartItem = Product & { quantity: number };

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
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
    if (saved) cartItems = JSON.parse(saved) as CartItem[];
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
function addToCart(product: Product) {
  setCart((prev) => {
    const existing = prev.find((item) => item.id === product.id);
    if (existing) {
      return prev.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    return [...prev, { ...product, quantity: 1 }];
  });
}

function removeFromCart(id: number) {
  setCart((prev) => prev.filter((item) => item.id !== id));
}

function updateQuantity(id: number, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(id);
    return;
  }
  setCart((prev) =>
    prev.map((item) => (item.id === id ? { ...item, quantity } : item))
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
