"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { products } from "@/app/data/products";

/**
 * 캔들 사진을 옆으로 넘겨 보는 슬라이더.
 * - 브라우저 기본 가로 스크롤 + 스냅이라 손가락으로 밀면 한 장씩 딱딱 멈춥니다(추가 라이브러리 없음).
 * - 화살표 버튼으로도 넘길 수 있고, 아래 막대로 지금 몇 번째인지 보여 줍니다.
 * - 상품 사진이 흰 배경이라 multiply로 섞어 베이지 띠에 녹여 캔들만 떠 보이게 합니다.
 *   스크롤 상자 밖 배경과는 섞이지 않아서, 칸마다 같은 베이지를 깔고 그 위에서 섞습니다.
 */
export default function CandleSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const last = products.length - 1;

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  const go = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative w-full max-w-[400px] md:ml-auto">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="캔들 사진 넘겨 보기"
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            aria-label={`${product.name} 보러 가기`}
            className="relative shrink-0 w-full aspect-square snap-center"
            style={{ background: "var(--color-beige)" }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain mix-blend-multiply"
              sizes="(max-width: 768px) 44vw, 400px"
            />
            {product.wickImage && (
              <Image
                src={product.wickImage}
                alt=""
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 768px) 44vw, 400px"
              />
            )}
          </Link>
        ))}
      </div>

      {[
        { direction: -1 as const, label: "이전 캔들", side: "left-0", mark: "‹", disabled: index === 0 },
        { direction: 1 as const, label: "다음 캔들", side: "right-0", mark: "›", disabled: index === last },
      ].map(({ direction, label, side, mark, disabled }) => (
        <button
          key={label}
          type="button"
          onClick={() => go(direction)}
          disabled={disabled}
          aria-label={label}
          className={`absolute top-1/2 -translate-y-1/2 ${side} w-8 h-8 md:w-10 md:h-10 rounded-full grid place-items-center text-xl md:text-2xl leading-none transition-opacity disabled:opacity-0`}
          style={{ background: "rgba(250,248,244,0.85)", color: "var(--color-ink)" }}
        >
          <span aria-hidden className="-mt-0.5">{mark}</span>
        </button>
      ))}

      {/* 지금 보고 있는 위치 막대 */}
      <div
        className="mx-auto mt-3 h-[2px] w-2/3 max-w-[200px]"
        style={{ background: "rgba(30,27,23,0.12)" }}
        aria-hidden
      >
        <div
          className="h-full transition-[margin] duration-300"
          style={{
            width: `${100 / products.length}%`,
            marginLeft: `${(index * 100) / products.length}%`,
            background: "var(--color-ink)",
          }}
        />
      </div>
    </div>
  );
}
