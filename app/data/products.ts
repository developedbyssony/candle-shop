import { Product } from "@/app/context/CartContext";
import {
  CHEESE_CANDLE,
  CUPCAKE_CANDLE,
  OWL_CANDLE,
} from "@/app/data/candleColors";

export const products: Product[] = [
  {
    id: 1,
    name: "치즈 한 조각",
    price: 21000,
    scent: "밀크",
    image: "/products/cheese-candle-v2.png",
    description: "포근한 밀크 향이 감도는, 치즈 한 조각을 닮은 핸드메이드 오브제 캔들",
    colors: CHEESE_CANDLE.colors,
    // 상품 사진 그대로인 노랑을 기본으로 보여줍니다.
    defaultColorId: "yellow",
  },
  {
    id: 2,
    name: "숲속 부엉이",
    price: 23000,
    scent: "포레스트",
    image: "/products/owl-candle.png",
    description:
      "숲을 지키는 부엉이를 닮은 오브제 캔들.",
    colors: OWL_CANDLE.colors,
    defaultColorId: "black",
  },
  {
    id: 3,
    name: "말차 컵케이크",
    price: 22000,
    scent: "말차",
    image: "/products/cupcake-candle.png",
    description:
      "말차 크림을 듬뿍 올린 컵케이크를 닮은 오브제 캔들.",
    colors: CUPCAKE_CANDLE.colors,
    defaultColorId: "green",
  },
];
