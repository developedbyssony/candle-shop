import { Product } from "@/app/context/CartContext";
import { CANDLE_COLORS } from "@/app/data/candleColors";

export const products: Product[] = [
  {
    id: 1,
    name: "라벤더 릴렉스",
    price: 18000,
    scent: "라벤더",
    image: "https://images.unsplash.com/photo-1506439904482-f72abad7af25?w=600&h=700&fit=crop&crop=entropy&q=85",
    description: "은은한 라벤더 향이 마음을 편안하게 해주는 소이 캔들",
  },
  {
    id: 2,
    name: "바닐라 드림",
    price: 20000,
    scent: "바닐라",
    image: "https://images.unsplash.com/photo-1605093659627-4d468d4c3ec7?w=600&h=700&fit=crop&crop=entropy&q=85",
    description: "달콤한 바닐라 향이 따뜻한 분위기를 만들어주는 캔들",
  },
  {
    id: 3,
    name: "시트러스 모닝",
    price: 17000,
    scent: "시트러스",
    image: "https://images.unsplash.com/photo-1667988152051-c689a7905701?w=600&h=700&fit=crop&crop=entropy&q=85",
    description: "상쾌한 레몬과 오렌지 향이 아침을 활기차게 해주는 캔들",
  },
  {
    id: 4,
    name: "우드 & 머스크",
    price: 22000,
    scent: "우드",
    image: "https://images.unsplash.com/photo-1590190537798-4db559287bba?w=600&h=700&fit=crop&crop=entropy&q=85",
    description: "깊은 우드와 머스크 향이 공간을 고급스럽게 채워주는 캔들",
  },
  {
    id: 5,
    name: "로즈 가든",
    price: 19000,
    scent: "플로럴",
    image: "https://images.unsplash.com/photo-1608977230965-6a1b92233ac6?w=600&h=700&fit=crop&crop=entropy&q=85",
    description: "신선한 장미 향기가 가득한 로맨틱한 분위기의 캔들",
  },
  {
    id: 6,
    name: "민트 브리즈",
    price: 16000,
    scent: "민트",
    image: "https://images.unsplash.com/photo-1733945316613-e603334423dc?w=600&h=700&fit=crop&crop=entropy&q=85",
    description: "시원하고 청량한 민트 향이 집안을 상쾌하게 만들어주는 캔들",
  },
  {
    id: 7,
    name: "치즈 한 조각",
    price: 21000,
    scent: "밀크",
    image: "/products/cheese-candle.png",
    description: "포근한 밀크 향이 감도는, 치즈 한 조각을 닮은 핸드메이드 오브제 캔들",
    colors: CANDLE_COLORS,
    // 상품 사진 그대로인 노랑을 기본으로 보여줍니다.
    defaultColorId: "yellow",
  },
];
