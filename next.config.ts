import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 기본 75화질은 무채색에 가까운 상품 사진(예: 베이직 필라)을 색상 필터로
    // 재색상화할 때 웹P 압축 얼룩이 크게 증폭되어 보입니다. 상품 이미지는 94를 씁니다.
    qualities: [75, 98],
    // search를 생략하면 모든 쿼리스트링을 허용합니다.
    // 상품 이미지 URL이 ?w=600&h=700 같은 리사이즈 파라미터를 쓰기 때문에 필요합니다.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.imweb.me",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
