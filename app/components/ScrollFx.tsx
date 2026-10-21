"use client";

import { useEffect } from "react";

/**
 * GSAP ScrollTrigger로 붙이는 스크롤 효과. 화면에는 아무것도 그리지 않습니다.
 *
 * - data-stagger: 이 상자의 자식들이 화면에 들어올 때 차례로 떠오릅니다.
 *
 * GSAP(약 45KB)는 첫 화면이 그려진 뒤에 불러와 로딩 속도에 영향을 주지 않고,
 * '동작 줄이기' 설정이면 아무 효과도 걸지 않습니다.
 */
export default function ScrollFx() {
  useEffect(() => {
    let revert = () => {};
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ── 섹션 순차 등장 ──
        gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
          const items = Array.from(group.children) as HTMLElement[];
          gsap.set(items, { autoAlpha: 0, y: 48 });
          ScrollTrigger.batch(items, {
            start: "top 88%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: 1.1,
                ease: "power3.out",
                stagger: 0.12,
                overwrite: true,
              }),
          });
        });
      });

      revert = () => mm.revert();
    })();

    return () => {
      cancelled = true;
      revert();
    };
  }, []);

  return null;
}
