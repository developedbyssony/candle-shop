"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 화면 안으로 들어오면 한 번 떠오르는 래퍼입니다.
 * 실제 등장 효과는 globals.css의 .reveal이 맡고, 여기서는 보이기 시작한 시점에
 * is-visible만 붙입니다. (자바스크립트가 없거나 애니메이션을 줄인 환경에서는
 * CSS 쪽에서 바로 보이도록 처리합니다.)
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        // 한 번 나타나면 다시 숨기지 않습니다.
        observer.disconnect();
      },
      // 아래에서 올라올 때 화면 하단에 살짝 걸친 상태에서 시작합니다.
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
