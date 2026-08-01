import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
