"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * '색 골라 보기' 무대의 3D 유리컵 캔들(three.js).
 * 투명한 유리컵 안에 왁스를 채우고, 길게 뽑은 꼰 면 심지와 앞면의 둥근 종이 라벨을 붙였습니다.
 * 라벨은 큰 세리프 글자를 원 밖으로 잘려 나가게 채운 모양입니다(참고 이미지의 기법만 빌려 문구는 브랜드 한 줄로).
 *
 * - 고른 색(color)이 바뀌면 왁스 색만 0.45초에 걸쳐 바뀝니다(움직임 줄이기면 바로 바뀜).
 * - 바닥 그림자 위 공중에 떠서 천천히 오르내리며 살짝 흔들립니다. 오를수록 그림자는 작고 옅어집니다.
 * - 천천히 혼자 돌고, 끌면 손으로 돌려 볼 수 있습니다(놓으면 관성으로 멈춤). 움직임 줄이기면 혼자 돌지 않습니다.
 * - 화면 밖이거나 탭이 숨겨지면 그리기를 멈춰 배터리를 아낍니다.
 * three.js가 무거워 이 파일은 ColorTryOn에서 화면에 다가올 때만 따로 불러옵니다(next/dynamic, ssr 없음).
 */

// 유리컵 치수(장면 단위). 아래가 살짝 좁은 텀블러 모양입니다.
const GLASS_H = 2.4;
const R_BOTTOM = 0.86;
const R_TOP = 1.0;
const WALL = 0.05;
const BASE = 0.22; // 두꺼운 유리 바닥
const WAX_TOP = 1.96;
const WICK_TOP = 3.35;
// 바닥에서 띄워 두는 높이. 컵이 그림자 위 공중에 떠서 천천히 오르내립니다(움직임 줄이기면 떠 있기만).
const LIFT = 0.42;
const BOB = 0.09;

// 바깥 반지름(높이 y에서). 라벨을 유리 겉면에 딱 맞춰 붙일 때 씁니다.
const outerR = (y: number) => R_BOTTOM + (R_TOP - R_BOTTOM) * (y / GLASS_H);
const innerR = (y: number) => outerR(y) - WALL;

// 라벨 문구: 사이트 한 줄 소개("하루의 끝에, 나를 위한 작은 빛")를 영문으로 풀어 원 안에 크게 채웁니다.
const LABEL_LINES = ["end of the", "day, a little", "evening", "light for", "yourself"];

function makeLabelTexture(fontFamily: string) {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  // 둥근 종이 라벨
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
  ctx.fillStyle = "#fbfaf7";
  ctx.fill();
  ctx.clip();
  // 글자는 원보다 크게 써서 가장자리에서 잘려 나가게 합니다(참고 이미지의 잘린 타이포 느낌).
  ctx.fillStyle = "#141210";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const lineH = 200;
  const startY = size / 2 - lineH * 2 + 70;
  LABEL_LINES.forEach((line, i) => {
    // 가운데 줄(evening)만 살짝 크게, 위아래 줄은 원 밖으로 더 넘치게 넓혀 씁니다.
    const px = i === 2 ? 236 : 222;
    ctx.font = `400 ${px}px ${fontFamily}`;
    const y = startY + i * lineH;
    // 글자 폭을 원 지름보다 넓게 맞춰, 양끝 글자가 원에 걸려 잘리게 합니다.
    const w = ctx.measureText(line).width;
    const target = i === 2 ? size * 0.9 : size * 0.97;
    ctx.save();
    ctx.translate(size / 2, y);
    ctx.scale(target / w, 1);
    ctx.fillText(line, 0, 0);
    ctx.restore();
  });
  ctx.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

// 꼰 면 심지: 사선 줄무늬를 반복해 꼬인 결을 냅니다.
function makeWickTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#e2c9a4";
  ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = "#b8956a";
  ctx.lineWidth = 7;
  for (let i = -64; i < 128; i += 22) {
    ctx.beginPath();
    ctx.moveTo(i, 64);
    ctx.lineTo(i + 40, 0);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 2;
  for (let i = -64; i < 128; i += 22) {
    ctx.beginPath();
    ctx.moveTo(i + 8, 64);
    ctx.lineTo(i + 48, 0);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 9);
  return texture;
}

export default function CandleJar3D({
  color,
  onReady,
}: {
  /** 왁스 색(#rrggbb) */
  color: string;
  /** 첫 장면을 그린 뒤 한 번 부릅니다(대신 보이던 사진을 걷어 낼 때). */
  onReady?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  // 색 바꾸기는 장면을 다시 만들지 않고, 만들어 둔 장면의 왁스 색만 바꿉니다.
  const setColorRef = useRef<(hex: string) => void>(() => {});
  const firstColor = useRef(color);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // WebGL을 못 쓰는 기기면 대신 보이던 사진을 그대로 둡니다.
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // ACES는 채도를 많이 빼서 고른 색보다 바래 보입니다. 색을 고르는 자리라 색을 덜 건드리는 Neutral을 씁니다.
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    // 위아래로 끌어 아랫면까지 돌려 보게 해서, 캔들 위에서는 손가락 끌기를 페이지 스크롤 대신 돌리기에 씁니다.
    // (무대 위아래 글자·색 줄 자리에서는 그대로 스크롤됩니다.)
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.userSelect = "none";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // 유리 반사용 실내 조명 환경. 외부 HDR 파일 없이 코드로 만들어 추가 요청이 없습니다.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;

    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);

    const key = new THREE.DirectionalLight(0xfff4e6, 1.4);
    key.position.set(-3, 5, 4);
    scene.add(key);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    // 세 겹으로 나눠 돌립니다. float: 공중에 뜬 자리·위아래 기울기(세상 기준이라 어느 쪽으로 돌아 있어도
    // 위로 끌면 늘 아랫면이 보임) → spin: 컵 자체 축으로 도는 회전 → jar: 컵 가운데가 회전 중심이 되게 내려 둔 몸체
    const PIVOT = 1.5;
    const float = new THREE.Group();
    const spin = new THREE.Group();
    const jar = new THREE.Group();
    jar.position.y = -PIVOT;
    spin.add(jar);
    float.add(spin);
    scene.add(float);

    // ── 유리컵: 바깥 벽 → 입구 둥근 테 → 안쪽 벽 → 두꺼운 바닥을 한 줄 윤곽으로 돌려 만듭니다.
    const glassProfile = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(R_BOTTOM - 0.03, 0),
      new THREE.Vector2(R_BOTTOM, 0.03),
      new THREE.Vector2(R_TOP, GLASS_H - 0.015),
      new THREE.Vector2(R_TOP - WALL * 0.5, GLASS_H),
      new THREE.Vector2(R_TOP - WALL, GLASS_H - 0.015),
      new THREE.Vector2(innerR(BASE) + 0.01, BASE + 0.02),
      new THREE.Vector2(innerR(BASE) - 0.04, BASE),
      new THREE.Vector2(0, BASE),
    ];
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.04,
      transmission: 1,
      thickness: 0.18,
      ior: 1.5,
      envMapIntensity: 1.2,
      specularIntensity: 1,
      transparent: true,
    });
    const glass = new THREE.Mesh(new THREE.LatheGeometry(glassProfile, 96), glassMat);
    jar.add(glass);

    // ── 왁스: 안쪽 벽보다 아주 조금 작게 채우고, 윗면 가장자리는 벽에 붙어 살짝 올라간 모양(메니스커스)
    const waxProfile = [
      new THREE.Vector2(0, BASE + 0.005),
      new THREE.Vector2(innerR(BASE) - 0.045, BASE + 0.005),
      new THREE.Vector2(innerR(WAX_TOP) - 0.008, WAX_TOP + 0.03),
      new THREE.Vector2(innerR(WAX_TOP) - 0.06, WAX_TOP),
      new THREE.Vector2(0, WAX_TOP - 0.01),
    ];
    const waxMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(firstColor.current),
      roughness: 0.62,
      metalness: 0,
      sheen: 0.15,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color(0xffffff),
      envMapIntensity: 0.6,
    });
    const wax = new THREE.Mesh(new THREE.LatheGeometry(waxProfile, 96), waxMat);
    jar.add(wax);

    // ── 심지: 왁스 위로 길게 뽑은 꼰 면 심지
    const wickTex = makeWickTexture();
    const wickMat = new THREE.MeshStandardMaterial({ map: wickTex, roughness: 0.9 });
    const wickLen = WICK_TOP - WAX_TOP + 0.3;
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, wickLen, 16), wickMat);
    wick.position.y = WAX_TOP - 0.3 + wickLen / 2;
    jar.add(wick);
    // 심지 끝은 살짝 그을린 색
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0x3a2c22, roughness: 1 })
    );
    tip.position.y = WICK_TOP + 0.01;
    tip.scale.y = 0.6;
    jar.add(tip);

    // ── 라벨: 유리 겉면(위로 갈수록 넓어지는 원뿔)에 맞춘 원통 조각에 둥근 라벨 그림을 붙입니다.
    // 원통 조각의 호 길이를 높이와 같게 해 동그라미가 찌그러지지 않게 합니다.
    const LABEL_H = 1.62;
    const LABEL_Y = 1.12;
    const rMid = outerR(LABEL_Y) + 0.006;
    const theta = LABEL_H / rMid;
    const labelGeo = new THREE.CylinderGeometry(
      outerR(LABEL_Y + LABEL_H / 2) + 0.006,
      outerR(LABEL_Y - LABEL_H / 2) + 0.006,
      LABEL_H,
      64,
      8,
      true,
      -theta / 2,
      theta
    );
    const labelBack = new THREE.MeshStandardMaterial({
      color: 0xf4f1ea,
      roughness: 0.9,
      side: THREE.BackSide,
      transparent: true,
      alphaTest: 0.5,
    });
    const labelFront = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      side: THREE.FrontSide,
      transparent: true,
      alphaTest: 0.5,
    });
    const labelGroup = new THREE.Group();
    labelGroup.position.y = LABEL_Y;
    const front = new THREE.Mesh(labelGeo, labelFront);
    const back = new THREE.Mesh(labelGeo, labelBack);
    labelGroup.add(back, front);
    jar.add(labelGroup);

    // 라벨 글꼴은 로고와 같은 Playfair Display. 글꼴이 다 내려온 뒤에 그려야 기본 글꼴로 찍히지 않습니다.
    const fontFamily =
      getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() || "Georgia, serif";
    let labelTex: THREE.CanvasTexture | null = null;
    document.fonts
      .load(`400 200px ${fontFamily}`)
      .catch(() => undefined)
      .then(() => {
        if (disposed) return;
        labelTex = makeLabelTexture(fontFamily);
        labelFront.map = labelTex;
        labelBack.alphaMap = labelTex;
        labelFront.needsUpdate = labelBack.needsUpdate = true;
        requestFrame();
      });

    // 라벨이 거의 정면을 보는 데서 시작해, 혼자 돌며 옆모습으로 넘어갑니다.
    spin.rotation.y = -0.12;
    float.position.y = LIFT + PIVOT;

    // ── 크기 맞추기: 캔들 전체(심지 끝까지)가 칸 안에 들어오도록 카메라 거리를 정합니다.
    const fit = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
      // 칸을 꽉 채우면 답답해서, 캔들이 칸의 약 3분의 2만 차지하도록 여유(SCALE_ROOM)를 둡니다.
      const SCALE_ROOM = 1.45;
      const needH = (WICK_TOP + LIFT + BOB + 0.5) * SCALE_ROOM;
      const needW = (R_TOP * 2 + 0.6) * SCALE_ROOM;
      const dist = Math.max(needH / 2 / Math.tan(halfFov), needW / 2 / (Math.tan(halfFov) * camera.aspect));
      const midY = (WICK_TOP + LIFT) / 2;
      camera.position.set(0, midY + dist * 0.16, dist);
      camera.lookAt(0, midY - 0.05, 0);
      camera.updateProjectionMatrix();
      // 바닥 그림자는 3D가 아니라 캔버스 뒤 CSS 그라데이션으로 둡니다(투명 그림자 판을 장면에 두면
      // 유리 투과 계산에 판의 네모 테두리가 회색 상자로 비쳐 보였습니다). 컵 바닥이 화면에 놓이는 자리에 맞춥니다.
      const shadowEl = shadowRef.current;
      if (shadowEl) {
        const base = new THREE.Vector3(0, 0, 0).project(camera);
        const edge = new THREE.Vector3(R_BOTTOM, 0, 0).project(camera);
        const y = ((1 - base.y) / 2) * h;
        const half = Math.abs(edge.x - base.x) * w * 0.5;
        shadowEl.style.top = `${y}px`;
        shadowEl.style.width = `${half * 3}px`;
        shadowEl.style.height = `${half * 0.55}px`;
      }
      requestFrame();
    };

    // ── 돌리기: 혼자 천천히 돌다가, 끌면 손 따라 돌고 놓으면 관성으로 원래 속도로 돌아옵니다.
    const AUTO_SPEED = reduceMotion ? 0 : 0.0045;
    let velocity = AUTO_SPEED;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastMove = 0;
    // 위아래 기울기. 끄는 동안만 바뀌고, 놓으면 천천히 바로 선 자세로 돌아옵니다.
    let tilt = 0;
    const MAX_TILT = 1.45; // 약 83°: 아랫면이 거의 정면으로 보이는 데까지
    const onDown = (e: PointerEvent) => {
      // 끄는 동안 주변 글자가 파랗게 선택되지 않게 기본 동작(글자 선택 시작)을 막습니다.
      e.preventDefault();
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
      renderer.domElement.style.cursor = "grabbing";
      requestFrame();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      lastMove = dx * 0.01;
      spin.rotation.y += lastMove;
      // 위로 끌면 위쪽이 뒤로 넘어가 아랫면이 보입니다.
      tilt = THREE.MathUtils.clamp(tilt + dy * 0.01, -MAX_TILT, MAX_TILT);
      requestFrame();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      velocity = lastMove;
      renderer.domElement.style.cursor = "grab";
      requestFrame();
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointercancel", onUp);

    // ── 색 바꾸기: 지금 색에서 새 색으로 부드럽게
    const fromColor = new THREE.Color();
    const toColor = new THREE.Color(firstColor.current);
    let colorStart = -1;
    setColorRef.current = (hex: string) => {
      toColor.set(hex);
      if (reduceMotion) {
        waxMat.color.copy(toColor);
        colorStart = -1;
      } else {
        fromColor.copy(waxMat.color);
        colorStart = performance.now();
      }
      requestFrame();
    };

    // ── 그리기: 보일 때만, 움직일 게 있을 때만 다음 프레임을 예약합니다.
    let visible = true;
    let raf = 0;
    let disposed = false;
    let announced = false;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
    const tick = (now: number) => {
      raf = 0;
      if (disposed) return;
      let moving = false;
      if (!dragging) {
        // 관성은 서서히 줄어 혼자 도는 속도로 돌아옵니다.
        velocity += (AUTO_SPEED - velocity) * 0.04;
        spin.rotation.y += velocity;
        moving = Math.abs(velocity) > 0.00005;
        if (Math.abs(tilt) > 0.0005) {
          tilt *= 0.95;
          moving = true;
        } else tilt = 0;
      }
      // 움직임 줄이기여도 손으로 기울인 만큼은 따라옵니다.
      float.rotation.x = tilt;
      if (!reduceMotion) {
        // 공중에 뜬 채 숨 쉬듯 오르내리고, 앞뒤·좌우로 아주 조금씩 기웁니다(주기를 서로 달리해 반복이 덜 보이게).
        const t = now / 1000;
        const rise = Math.sin(t * 1.3);
        float.position.y = LIFT + PIVOT + rise * BOB;
        float.rotation.z = Math.sin(t * 0.8) * 0.035;
        float.rotation.x = tilt + Math.sin(t * 1.05 + 1.2) * 0.03;
        const shadowEl = shadowRef.current;
        if (shadowEl) {
          // 높이 오를수록 그림자는 작고 옅게
          shadowEl.style.scale = String(1 - rise * 0.08);
          shadowEl.style.opacity = String(0.85 - rise * 0.15);
        }
        moving = true;
      }
      if (colorStart >= 0) {
        const t = Math.min(1, (now - colorStart) / 450);
        waxMat.color.copy(fromColor).lerp(toColor, easeOut(t));
        if (t >= 1) colorStart = -1;
        else moving = true;
      }
      renderer.render(scene, camera);
      if (!announced) {
        announced = true;
        readyRef.current?.();
      }
      if ((moving || dragging) && visible && !document.hidden) requestFrame();
    };
    function requestFrame() {
      if (!raf && !disposed) raf = requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestFrame();
    });
    io.observe(host);
    const onVisibility = () => {
      if (!document.hidden) requestFrame();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    fit();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      [wickTex, envMap, labelTex].forEach((t) => t?.dispose());
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    setColorRef.current(color);
  }, [color]);

  return (
    <div className="absolute inset-0" aria-hidden>
      <div
        ref={shadowRef}
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] pointer-events-none"
        style={{ background: "radial-gradient(closest-side, rgba(30,24,18,0.28), rgba(30,24,18,0.1) 55%, transparent)" }}
      />
      <div ref={hostRef} className="absolute inset-0" />
    </div>
  );
}
