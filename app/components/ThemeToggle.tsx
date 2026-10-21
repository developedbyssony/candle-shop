"use client";

import { useSyncExternalStore } from "react";

/**
 * 히어로 섹션 구석에 붙은 다크모드 토글 스위치(데스크톱 오른쪽 위, 모바일 오른쪽 아래). 섹션을 벗어나면 안 보입니다.
 * - html에 data-theme="dark"를 붙였다 뗐다 하고, 고른 값은 localStorage에 남깁니다.
 *   (다음 방문 때는 layout.tsx의 스크립트가 화면을 그리기 전에 먼저 복원합니다.)
 * - 켜짐 상태는 html의 data-theme을 그대로 읽어서, 다른 곳에서 바뀌어도 스위치가 따라갑니다.
 * - 모양·위치는 globals.css의 .theme-switch에 있습니다.
 */

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const getSnapshot = () => document.documentElement.dataset.theme === "dark";
// 서버에서는 저장된 값을 모르니 꺼짐으로 그리고, 화면에 붙은 뒤 실제 값으로 맞춥니다.
const getServerSnapshot = () => false;

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const html = document.documentElement;
    const next = !dark;

    // 누른 순간에만 색이 서서히 바뀌도록 잠깐 transition을 겁니다.
    html.classList.add("theme-fading");
    if (next) html.dataset.theme = "dark";
    else delete html.dataset.theme;
    window.setTimeout(() => html.classList.remove("theme-fading"), 700);

    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // 저장이 막힌 브라우저에서도 이번 화면에서는 그대로 동작합니다.
    }
  };

  return (
    <button type="button" role="switch" aria-checked={dark} aria-label="다크모드" onClick={toggle} className="theme-switch">
      <span aria-hidden className="theme-switch-knob" />
    </button>
  );
}
