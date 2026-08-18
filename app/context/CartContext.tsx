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

/** 완성품 크기(cm). 손으로 굳혀 만들어 조금씩 차이가 납니다. */
export type ProductSize = {
  height: number;
  width: number;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  scent: string;
  image: string;
  description: string;
  size: ProductSize;
  colors?: ProductColor[];
  /** 처음 선택된 색상. 없으면 colors의 첫 번째를 씁니다. */
  defaultColorId?: string;
  /**
   * 상세 페이지 사진 뒤에 깔리는 색. 기본은 베이지지만, 사진 배경이 흰색이라
   * 베이지 액자처럼 보이는 상품은 흰색으로 맞춰줍니다.
   */
  imageBackground?: string;
  /**
   * 심지만 오려낸 투명 배경 이미지. 있으면 색상 필터가 적용된 본품 이미지
   * 위에 필터 없이 그대로 얹어서, 색을 바꿔도 심지는 원래 색으로 보입니다.
   */
  wickImage?: string;
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
  addToCart: (product: Product, color?: ProductColor, quantity?: number) => void;
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

/** 파일명이 바뀐 상품 이미지. 예전 경로 그대로면 장바구니에서 이미지가 깨집니다. */
const RENAMED_IMAGES: Record<string, string> = {
  // 그림자를 지우면서 캐시를 확실히 비우려고 파일명을 바꿨습니다.
  "/products/cheese-candle.png": "/products/cheese-candle-v2.png",
};

/**
 * 색상 필터 id가 상품별로 나뉘기 전에 담긴 항목(url(#candle-color-red) 형태).
 * 당시 색상이 있는 상품은 치즈 캔들뿐이라 cheese로 보냅니다.
 * 새 id(candle-color-cheese-red)는 색상 자리에 하이픈이 있어 걸리지 않습니다.
 */
const LEGACY_FILTER = /^url\(#candle-color-([a-z]+)\)$/;

/**
 * 장바구니에는 담을 당시의 상품 정보가 통째로 저장됩니다.
 * 그래서 이미지 파일명이나 필터 id가 바뀌면 예전 항목이 깨진 값을 들고 있어,
 * 불러올 때 지금 구조에 맞게 고쳐줍니다.
 */
function migrate(item: CartItem): CartItem {
  // 색상 옵션 도입 전에 담아둔 장바구니에는 key가 없어 여기서 채워줍니다.
  const key = item.key ?? cartKey(item.id, item.color?.id);
  const image = RENAMED_IMAGES[item.image] ?? item.image;

  let color = item.color;
  const legacy = color?.filter?.match(LEGACY_FILTER);
  if (color && legacy) {
    color = { ...color, filter: `url(#candle-color-cheese-${legacy[1]})` };
  }

  return { ...item, key, image, color };
}

function restore() {
  if (restored) return;
  restored = true;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved) as CartItem[];
    cartItems = parsed.map(migrate);
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
// 상세 페이지처럼 수량을 먼저 고르는 화면에서는 quantity를 한 번에 넘깁니다.
function addToCart(product: Product, color?: ProductColor, quantity = 1) {
  const key = cartKey(product.id, color?.id);
  const added = Math.max(1, Math.floor(quantity));
  setCart((prev) => {
    const existing = prev.find((item) => item.key === key);
    if (existing) {
      return prev.map((item) =>
        item.key === key ? { ...item, quantity: item.quantity + added } : item
      );
    }
    return [...prev, { ...product, key, color, quantity: added }];
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
