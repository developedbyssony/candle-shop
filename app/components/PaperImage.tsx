"use client";

// 종이처럼 아래쪽이 바람에 살랑이는 사진 (Originkit의 Paper Image를 이 사이트에 맞게 고친 것).
// - 부모 상자 크기를 그대로 채웁니다(부모는 position: relative + 비율/크기를 가져야 합니다).
// - 처음에는 next/image 사진을 그대로 보여 주고, three.js를 늦게 불러와 첫 장면이
//   그려진 뒤에만 캔버스로 바꿔 끼웁니다. 그래서 첫 화면 로딩이 느려지지 않고,
//   WebGL이 안 되거나 '동작 줄이기' 설정이면 그냥 사진으로 남습니다.
// - 캔버스 텍스처는 next/image가 이미 받아 둔 주소(currentSrc)를 다시 써서 두 번 받지 않습니다.

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type * as ThreeTypes from "three";

const DEFAULTS = {
  // Lift: 아래쪽 모서리가 살짝 들려 올라가는 종이. Wave: 아래쪽이 물결치는 종이.
  mode: "Lift" as "Wave" | "Lift",
  hoverLift: 100,
  restLift: 60,
  depth: 40,
  sheen: 35,
};

// 물결이 상자 밖으로 넘실대도록 캔버스를 사방으로 40%씩 더 크게 그립니다.
const OVERSCAN = 1.8;
const FOV = 30;

interface PaperImageProps {
  src: string;
  alt: string;
  sizes: string;
  /** 사진 자체(object-fit 등)에 붙일 클래스. 캔버스는 항상 cover로 잘라 씁니다. */
  imageClassName?: string;
  mode?: "Wave" | "Lift";
  /** 마우스를 올렸을 때 흔들림 세기 (0–100) */
  hoverLift?: number;
  /** 가만히 있을 때 흔들림 세기 (0–100) */
  restLift?: number;
  /** 물결 깊이 (0–100) */
  depth?: number;
  /** 접힌 면의 반짝임 (0–100) */
  sheen?: number;
}

export default function PaperImage({
  src,
  alt,
  sizes,
  imageClassName = "object-cover",
  mode = DEFAULTS.mode,
  hoverLift = DEFAULTS.hoverLift,
  restLift = DEFAULTS.restLift,
  depth = DEFAULTS.depth,
  sheen = DEFAULTS.sheen,
}: PaperImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [textureUrl, setTextureUrl] = useState("");
  const [glReady, setGlReady] = useState(false);

  // 그리기 루프가 다시 시작되지 않고도 최신 설정값을 읽도록 ref에 담아 둡니다.
  const liveRef = useRef({ flutter: 0, idle: 0, depth: 0, sheen: 0, lift: false });
  useEffect(() => {
    liveRef.current = {
      flutter: (hoverLift / 100) * 0.75,
      idle: (restLift / 100) * 0.75,
      depth: (depth / 100) * 0.5,
      sheen: sheen / 100,
      lift: mode === "Lift",
    };
  }, [hoverLift, restLift, depth, sheen, mode]);

  // next/image가 고른 최적화 이미지 주소를 받아 텍스처로 씁니다.
  function handleLoad() {
    const img = imgRef.current;
    if (img?.currentSrc) setTextureUrl(img.currentSrc);
  }

  // 하이드레이션 전에 이미 로드가 끝난 경우 onLoad가 안 불리므로 한 번 더 확인합니다.
  useEffect(() => {
    if (imgRef.current?.complete) handleLoad();
  }, []);

  useEffect(() => {
    if (!textureUrl) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: ThreeTypes.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch {
        return; // WebGL을 못 쓰면 사진 그대로 둡니다.
      }
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 100);
      const L0 = liveRef.current;
      const uniforms = {
        uTime: { value: 0 },
        uWind: { value: L0.idle },
        uMouseX: { value: 0.5 },
        uPlaneSize: { value: new THREE.Vector2(0.75, 1) },
        uImageAspect: { value: 0.75 },
        uAmp: { value: L0.depth },
        uMode: { value: L0.lift ? 1 : 0 },
        uSheen: { value: L0.sheen },
        uTex: { value: null as ThreeTypes.Texture | null },
        uHasTex: { value: 0 },
      };
      const geometry = new THREE.PlaneGeometry(1, 1, 96, 96);
      const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
      scene.add(new THREE.Mesh(geometry, material));

      const halfTan = Math.tan((FOV * Math.PI) / 180 / 2);
      camera.position.z = OVERSCAN / (2 * halfTan);

      const mouseX = { target: 0.5 };
      let hovering = false;
      const onMove = (e: PointerEvent) => {
        const r = container.getBoundingClientRect();
        mouseX.target = Math.min(1, Math.max(0, (e.clientX - r.left) / (r.width || 1)));
        hovering = true;
      };
      const onLeave = () => {
        hovering = false;
      };
      container.addEventListener("pointermove", onMove);
      container.addEventListener("pointerleave", onLeave);

      let w = 0;
      let h = 0;
      let raf = 0;
      let running = false;
      let shown = false;
      const start = performance.now();

      function loop() {
        raf = requestAnimationFrame(loop);
        const L = liveRef.current;
        const cw = container!.clientWidth;
        const ch = container!.clientHeight;
        if (cw > 0 && ch > 0 && (cw !== w || ch !== h)) {
          w = cw;
          h = ch;
          renderer.setSize(w * OVERSCAN, h * OVERSCAN, false);
          camera.aspect = w / h;
          uniforms.uPlaneSize.value.set(w / h, 1);
          camera.updateProjectionMatrix();
        }
        if (w === 0 || !uniforms.uHasTex.value) return;

        uniforms.uTime.value = (performance.now() - start) / 1000;
        uniforms.uAmp.value = L.depth;
        uniforms.uSheen.value = L.sheen;
        uniforms.uMode.value = L.lift ? 1 : 0;
        const wind = hovering ? L.flutter : L.idle;
        uniforms.uWind.value += (wind - uniforms.uWind.value) * 0.06;
        uniforms.uMouseX.value += (mouseX.target - uniforms.uMouseX.value) * 0.1;
        renderer.render(scene, camera);

        // 첫 장면이 실제로 그려진 다음에 사진과 캔버스를 바꿔 끼웁니다.
        if (!shown) {
          shown = true;
          setGlReady(true);
        }
      }

      // 화면에 보일 때만 그립니다.
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (running) return;
            running = true;
            loop();
          } else {
            running = false;
            cancelAnimationFrame(raf);
          }
        },
        { threshold: 0.01 },
      );

      new THREE.TextureLoader().load(textureUrl, (tex) => {
        if (disposed) return tex.dispose();
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        uniforms.uTex.value = tex;
        uniforms.uHasTex.value = 1;
        const image = tex.image as HTMLImageElement;
        if (image?.width) uniforms.uImageAspect.value = image.width / image.height;
        io.observe(container);
      }, undefined, () => console.warn("PaperImage: 텍스처를 불러오지 못했습니다:", textureUrl));

      cleanup = () => {
        io.disconnect();
        cancelAnimationFrame(raf);
        container.removeEventListener("pointermove", onMove);
        container.removeEventListener("pointerleave", onLeave);
        uniforms.uTex.value?.dispose();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
      setGlReady(false);
    };
  }, [textureUrl]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        onLoad={handleLoad}
        className={`${imageClassName} transition-opacity duration-300 ${glReady ? "opacity-0" : "opacity-100"}`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`absolute pointer-events-none transition-opacity duration-300 ${glReady ? "opacity-100" : "opacity-0"}`}
        style={{ top: "-40%", left: "-40%", width: "180%", height: "180%" }}
      />
    </div>
  );
}

const VERT = /* glsl */ `
uniform float uTime, uWind, uMouseX, uAmp, uMode;
uniform vec2 uPlaneSize;
varying vec2 vUv; varying vec3 vNormal, vViewPos;

float wave(vec2 uv, float t, float wind) {
    float mask = pow(max(0.0, 1.0 - uv.y), 1.1);
    float w = sin(uv.x * 6.0 + t * 3.0) * 0.5
            + sin(uv.x * 11.0 - t * 2.0 + uv.y * 4.0) * 0.25
            + sin((uv.x + uv.y) * 8.0 + t * 4.0) * 0.15;

    w += sin(uv.x * 9.0 + t * 5.0) * 0.3 * smoothstep(0.35, 0.0, abs(uv.x - uMouseX));
    return w * mask * wind;
}
float disp(vec2 uv, float t, float wind) {
    float ripple = wave(uv, t, wind);
    if (uMode < 0.5) return uAmp * ripple;
    return uAmp * (ripple * 0.6 + pow(max(0.0, 1.0 - uv.y), 2.0) * wind * 3.0);
}
void main() {
    vUv = uv;

    float z = disp(uv, uTime, uWind), e = 0.002;
    float dzdx = (disp(uv + vec2(e,0), uTime, uWind) - disp(uv - vec2(e,0), uTime, uWind)) / (2.0*e) / uPlaneSize.x;
    float dzdy = (disp(uv + vec2(0,e), uTime, uWind) - disp(uv - vec2(0,e), uTime, uWind)) / (2.0*e) / uPlaneSize.y;
    vNormal = normalMatrix * normalize(vec3(-dzdx, -dzdy, 1.0));
    float yLift = uMode < 0.5 ? 0.0 : uAmp * pow(max(0.0, 1.0 - uv.y), 2.0) * uWind * 1.2;
    vec4 mv = modelViewMatrix * vec4(position.x * uPlaneSize.x, position.y + yLift, z, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uTex; uniform float uHasTex, uSheen, uImageAspect; uniform vec2 uPlaneSize;
varying vec2 vUv; varying vec3 vNormal, vViewPos;
void main() {
    float ar = uPlaneSize.x; vec2 st = vUv;
    if (ar > uImageAspect) st.y = (vUv.y - 0.5) * (uImageAspect / ar) + 0.5;
    else st.x = (vUv.x - 0.5) * (ar / uImageAspect) + 0.5;
    vec3 base = uHasTex > 0.5 ? texture2D(uTex, st).rgb : vec3(0.85);
    vec3 N = gl_FrontFacing ? normalize(vNormal) : -normalize(vNormal);
    vec3 L = normalize(vec3(0.35, 0.55, 0.75)), V = normalize(-vViewPos);
    float diff = clamp(dot(N, L), 0.0, 1.0);
    float spec = pow(clamp(dot(N, normalize(L + V)), 0.0, 1.0), 26.0);

    float shade = (0.68 + diff * 0.45) / (0.68 + L.z * 0.45);
    float flatSpec = pow(clamp(normalize(L + V).z, 0.0, 1.0), 26.0);
    gl_FragColor = vec4(base * shade + max(spec - flatSpec, 0.0) * uSheen, 1.0);
    #include <colorspace_fragment>
}
`;
