// 상품 데이터 타입. 장바구니를 없애면서 장바구니 상태(CartContext)에서 떼어 와 데이터 곁에 둡니다.

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
   * 상품 사진 뒤에 깔리는 색. 기본은 베이지지만, 사진 배경이 흰색이라
   * 베이지 액자처럼 보이는 상품은 흰색으로 맞춰줍니다.
   */
  imageBackground?: string;
  /**
   * 심지만 오려낸 투명 배경 이미지. 있으면 색상 필터가 적용된 본품 이미지
   * 위에 필터 없이 그대로 얹어서, 색을 바꿔도 심지는 원래 색으로 보입니다.
   */
  wickImage?: string;
};
