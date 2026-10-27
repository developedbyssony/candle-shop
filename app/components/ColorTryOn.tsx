"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ProductColor } from "@/app/context/CartContext";

/**
 * 홈의 '색 골라 보기'. 흰 무대 위에 3D 유리컵 캔들 하나를 세워 두고, 아래 색 동그라미를 누르면
 * 왁스 색이 바로 바뀝니다. 신발·가구 커스텀 화면처럼 '물건 하나 + 아래 고르기 줄'로 단순하게 둡니다.
 * 캔들은 손으로 끌어 돌려 볼 수 있습니다.
 * three.js(CandleJar3D)는 무거워서 무대가 화면에 다가올 때만 불러오고, 그 전이나 자바스크립트가 없을 때는
 * 유리컵 캔들 사진이 대신 보입니다.
 */

// 3D 장면은 브라우저에서만 그릴 수 있어 서버 렌더링을 끄고, 따로 떨어진 묶음으로 늦게 불러옵니다.
const CandleJar3D = dynamic(() => import("@/app/components/CandleJar3D"), { ssr: false });

// 고르기 판 위 글씨. 판은 다크모드에서도 흰 종이라 글씨도 늘 종이 위 먹색을 씁니다.
const INK = "var(--color-paper-ink)";
/*
  유리컵 캔들 스마트스토어 상품 주소. 네이버 쪽 유입 집계에 잡히도록 받은 주소의 추적 값(NaPm, nl-au, nl-query)까지 그대로 둡니다.
*/
const JAR_STORE_URL =
  "https://smartstore.naver.com/eveningcandle/products/13796437961?NaPm=ct%3Dmvqtxjl4%7Cci%3Db5d0f313d69b22baaf6279c8de3b1478d848b89c%7Ctr%3Dslsl%7Csn%3D8015315%7Chk%3Da53a3571f5f2f07a53d5d1d54b5cbba623321389&nl-au=43037414cd6141729d18794ee21157e7&nl-query=%EC%9D%B4%EB%B8%8C%EB%8B%9D%EC%BA%94%EB%93%A4";

const INK_SOFT ="color-mix(in srgb, var(--color-paper-ink) 58%, transparent)";

export default function ColorTryOn({
  colors,
  initialColorId,
}: {
  /** 고를 수 있는 왁스 색(상품 색상 옵션과 같은 id·이름·색) */
  colors: ProductColor[];
  initialColorId: string;
}) {
  const [colorId, setColorId] = useState(initialColorId);
  const color = colors.find((item) => item.id === colorId) ?? colors[0];
  const stageRef = useRef<HTMLDivElement>(null);
  // near: 무대가 화면 가까이 와서 3D를 불러올 때, ready: 3D 첫 장면이 그려져 보여 줄 때
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    // 한 화면쯤 앞에서 미리 불러와, 스크롤해 내려왔을 때는 이미 3D가 서 있게 합니다.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" }
    );
    io.observe(element);
    return () => io.disconnect();
  }, []);

  return (
    <div>
      <div className="text-center mb-8 md:mb-10">
        <h3 className="headline mb-4" style={{ fontSize: "var(--text-heading)" }}>
          색은 직접 골라 보세요
        </h3>
        <p
          className="text-base leading-[1.8] text-pretty max-w-md mx-auto"
          style={{ color: "var(--color-muted)" }}
        >
          같은 캔들도 색을 바꾸면 전혀 다른 캔들이 돼요. 여기서 고른 색 그대로 손으로 굳혀 보내드려요.
        </p>
      </div>

      {/*
        고르기 판은 배경 위에 얹은 카드가 아니라 화면 전체를 차지하는 흰 무대입니다.
        부모는 가운데 폭(max-w-6xl)이라, 화면 폭(100vw)으로 넓혀 가운데에 맞춥니다(main의 overflow-x-clip이 가로 스크롤을 막음).
        높이도 한 화면(100svh)을 채우고, 캔들 자리가 남는 높이를 다 가져가 고르기 줄은 늘 화면 아래에 붙습니다.
        위아래는 흰 종이 한 장을 찢어 앨범에 붙인 것처럼(.torn-sheet) 합니다. 마스크가 자기 그림자는 잘라 내므로
        그림자는 감싼 부모의 drop-shadow로 줍니다(종이가 앨범에 붙은 높이감만, 번짐 8px 이하).
      */}
      <div className="drop-shadow-[0_1px_3px_rgba(43,33,24,0.14)]">
        <div
          className="torn-sheet relative left-1/2 w-screen -translate-x-1/2 min-h-[100svh] flex flex-col"
          style={{ background: "#ffffff", color: INK }}
        >
          {/*
            ── 무대: 오른쪽 위 보러 가기, 가운데 캔들 ──
            고른 색 이름은 아래 색 동그라미 밑에 이미 뜨므로 무대 위에는 따로 적지 않습니다.
          */}
          <div className="relative flex-1 flex flex-col w-full max-w-6xl mx-auto px-5 pt-12 md:pt-14">
            <div className="flex items-start justify-end">
              {/* 실제 구매는 네이버 스마트스토어에서 받으므로 유리컵 캔들 상품 페이지로 새 탭을 엽니다. */}
              <a
                href={JAR_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="try-go min-h-11 shrink-0 px-4 inline-flex items-center gap-1.5 text-[13px] font-semibold"
              >
                캔들 보러 가기 <span aria-hidden>→</span>
              </a>
            </div>

            <div
              ref={stageRef}
              role="img"
              aria-label={`${color.label} 왁스를 채운 유리컵 캔들`}
              className="relative flex-1 w-full min-h-[320px] max-w-[560px] mx-auto my-4"
            >
              {/*
                3D가 뜨기 전에는 다른 캔들 사진을 대신 두지 않고 흰 무대만 둡니다(모양이 다른 캔들이 잠깐 보였다 바뀌면 헷갈려서).
                첫 장면이 그려지면 살짝 떠오르며 나타납니다.
              */}
              <div className={`try-3d absolute inset-0 ${ready ? "is-ready" : ""}`}>
                {near && <CandleJar3D color={color.swatch} onReady={() => setReady(true)} />}
              </div>
            </div>
            <p className="text-center text-[13px] mb-2" style={{ color: INK_SOFT }}>
              끌어서 이리저리 돌려 보세요
            </p>
          </div>

          {/* ── 고르기 줄: 색 동그라미. 안내 문구 바로 밑이라 구분선 없이 여백으로만 나눕니다. ── */}
          <div className="px-4 pt-6 pb-8 md:pt-7 md:pb-10">
            {/*
              색 동그라미는 한 줄로 늘어놓고, 고른 색 이름은 그 동그라미 바로 밑에만 띄웁니다.
              이름을 절대 위치로 띄워 색을 바꿔도 줄이 들썩이지 않게 하고, 그 자리만큼 아래 여백을 둡니다.
              모바일은 한 줄에 다 안 들어가서 다섯 개씩 두 줄로 고정해 7+3처럼 줄이 짝짝이로 남지 않게 합니다.
            */}
            <div className="grid grid-cols-5 w-fit md:flex md:w-auto justify-center gap-x-3 gap-y-7 mx-auto pb-14">
              {colors.map((item) => {
                const selected = item.id === color.id;
                return (
                  <div key={item.id} className="relative">
                    <button
                      type="button"
                      aria-label={item.label}
                      aria-pressed={selected}
                      onClick={() => setColorId(item.id)}
                      className="try-swatch w-11 h-11 rounded-full flex items-center justify-center"
                    >
                      <span
                        className="block w-7 h-7 rounded-full"
                        style={{ background: item.swatch, border: "1px solid rgba(0,0,0,0.08)" }}
                      />
                    </button>
                    {selected && (
                      <span
                        aria-hidden
                        className="absolute left-1/2 top-full -translate-x-1/2 mt-0.5 whitespace-nowrap text-[13px] font-semibold"
                      >
                        {item.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
