// 크라프트지 띠(.torn-band)와 푸터(.torn-top)의 찢긴 가장자리·종이 결을 히어로 크라프트지와 같은 방식으로 굽습니다.
//
// 왜: 예전 가장자리는 clip-path 다각형이라 톱니가 고르고 매끈해서, 히어로의 실사 크라프트지 옆에 두면
// 종이를 찢었다기보다 가위로 지그재그를 낸 것처럼 보였습니다. 그래서 같은 노이즈로
// ① 찢긴 모양 마스크(위·아래) ② 겉면이 벗겨져 밝은 펄프가 드러난 단면 ③ 종이 결 타일을 이미지로 만들어 둡니다.
// 색은 이미지에 굽지 않고 CSS 토큰(beige·deep)이 그대로 칠하므로 다크모드도 따라옵니다.
// - 마스크: 알파만 의미 있음. 가로로 이어 붙여도 이음매가 없게 둘레 노이즈를 가로 길이로 감습니다.
// - 단면: 흰색 + 반투명. 어떤 종이색 위에서도 "안쪽이 더 밝은 섬유"로 보입니다.
// - 결 타일: 회색(128 기준) 얼룩. CSS에서 soft-light로 얹어 바탕색은 그대로 두고 결만 더합니다.
//
// 사용법: node scripts/make-torn-edges.js  (public/home/torn-*.webp, kraft-grain.webp를 만듭니다)
const sharp = require("sharp");

const SCALE = 2; // 레티나에서도 보풀이 뭉개지지 않게 2배로 그리고 CSS에서 절반 크기로 깝니다.
const W = 1200 * SCALE; // 한 장 가로(css 1200px마다 반복)
const H = 48 * SCALE; // 가장자리 띠 높이(css 48px)

function makeRnd(seed) {
  let x = seed;
  return () => (x = (x * 9301 + 49297) % 233280) / 233280;
}

// 1차원 고리 노이즈: 끝과 처음이 이어져 가로로 반복해도 이음매가 없습니다. linear면 꺾인 자리가 날카롭게 남습니다.
function ringNoise(rnd, cells, linear = false) {
  const v = Array.from({ length: cells }, () => rnd() * 2 - 1);
  return (t) => {
    const x = (((t % 1) + 1) % 1) * cells;
    const i = Math.floor(x);
    const f = x - i;
    const s = linear ? f : f * f * (3 - 2 * f);
    return v[i % cells] * (1 - s) + v[(i + 1) % cells] * s;
  };
}

// 2차원 값 노이즈. 주기(periodX·periodY)를 주면 그 크기로 감겨 타일로 이어 붙여도 이음매가 없습니다.
function valueNoise2D(rnd, cell, periodX, periodY) {
  const nx = Math.round(periodX / cell);
  const ny = Math.round(periodY / cell);
  const g = new Float32Array(nx * ny).map(() => rnd() * 2 - 1);
  return (x, y) => {
    const gx = x / cell;
    const gy = y / cell;
    const fx = gx - Math.floor(gx);
    const fy = gy - Math.floor(gy);
    const i = ((Math.floor(gx) % nx) + nx) % nx;
    const j = ((Math.floor(gy) % ny) + ny) % ny;
    const i1 = (i + 1) % nx;
    const j1 = (j + 1) % ny;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = g[j * nx + i];
    const b = g[j * nx + i1];
    const c = g[j1 * nx + i];
    const d = g[j1 * nx + i1];
    return (a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy;
  };
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

// 가장자리 한 장: 위쪽이 찢긴 모양(아래쪽 가장자리는 같은 함수로 그린 뒤 뒤집습니다).
function edgeStrip(seed) {
  const rnd = makeRnd(seed);
  const big = ringNoise(rnd, 6);
  const jog = ringNoise(rnd, 19, true);
  const chunk = ringNoise(rnd, 61, true);
  const mid = ringNoise(rnd, 150);
  const fine = ringNoise(rnd, 700);
  const fwLow = ringNoise(rnd, 9);
  const fwHigh = ringNoise(rnd, 120);
  const fluff = valueNoise2D(rnd, 2.2 * SCALE, W, H);
  const fluffBig = valueNoise2D(rnd, 8 * SCALE, W, H);

  const mask = Buffer.alloc(W * H * 4);
  const fringe = Buffer.alloc(W * H * 4);
  for (let x = 0; x < W; x++) {
    const t = x / W;
    // 찢긴 선이 띠 위쪽에서 얼마나 내려와 있는지(css px). 큰 물결 + 툭 꺾인 자국 + 잔 톱니
    const depth = Math.min(36, Math.max(3, 15 + big(t) * 6 + jog(t) * 7 + chunk(t) * 3 + mid(t) * 1.6 + fine(t) * 0.7));
    // 단면 폭: 비스듬히 찢긴 곳은 넓고, 곧게 끊긴 곳은 거의 없습니다.
    const fw = Math.max(0.8, 5 + fwLow(t) * 4.5 + fwHigh(t) * 1.5);
    for (let y = 0; y < H; y++) {
      const yc = y / SCALE;
      const fuzz = fluff(x, y) * 1.1 + fluffBig(x, y) * 0.9;
      const edge = depth + fuzz;
      // 종이 안쪽(1)과 바깥(0), 경계는 1px 남짓 부드럽게
      let a = smooth(edge - 0.6, edge + 0.6, yc);
      // 찢긴 끝 첫 몇 px는 섬유가 성글어 군데군데 비칩니다.
      const sparse = 1 - smooth(edge, edge + fw * 0.5, yc);
      a *= 1 - sparse * (0.3 + fluff(x * 1.7, y * 1.7) * 0.3);
      // 단면: 찢긴 끝에서 fw만큼 안쪽까지 밝은 펄프, 안쪽 경계도 보풀 때문에 들쭉날쭉
      const inner = edge + fw + fluffBig(x * 1.3, y) * 1.2;
      const pulp = (1 - smooth(inner - 0.8, inner + 0.8, yc)) * a;

      const o = (y * W + x) * 4;
      mask[o] = mask[o + 1] = mask[o + 2] = 0;
      mask[o + 3] = clamp(a * 255);
      fringe[o] = fringe[o + 1] = fringe[o + 2] = 255;
      fringe[o + 3] = clamp(pulp * (0.5 + fluff(x, y) * 0.14) * 255);
    }
  }
  return { mask, fringe };
}

// 종이 결 타일: 큰 얼룩 + 고운 결 + 섬유 점(짙은 것·밝은 것). 회색 128을 기준으로 위아래로만 흔듭니다.
function grainTile(seed) {
  const S = 400 * SCALE;
  const rnd = makeRnd(seed);
  const big = valueNoise2D(rnd, 100 * SCALE, S, S);
  const midN = valueNoise2D(rnd, 25 * SCALE, S, S);
  const g1 = valueNoise2D(rnd, 2 * SCALE, S, S);
  const g2 = valueNoise2D(rnd, 1 * SCALE, S, S);
  const flecks = new Float32Array(S * S);
  for (let k = 0; k < 1500; k++) {
    const x = Math.floor(rnd() * S);
    const y = Math.floor(rnd() * S);
    const amount = (rnd() < 0.7 ? -1 : 1) * (14 + rnd() * 26);
    const len = rnd() < 0.15 ? 2 + Math.floor(rnd() * 6) : 1 + Math.floor(rnd() * 2);
    const ang = rnd() * Math.PI;
    for (let s = 0; s < len; s++) {
      const px = (Math.round(x + Math.cos(ang) * s) + S) % S;
      const py = (Math.round(y + Math.sin(ang) * s) + S) % S;
      flecks[py * S + px] += amount;
    }
  }
  const buf = Buffer.alloc(S * S * 3);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const v = 128 + big(x, y) * 14 + midN(x, y) * 8 + g1(x, y) * 10 + g2(x, y) * 7 + flecks[y * S + x];
      const o = (y * S + x) * 3;
      buf[o] = buf[o + 1] = buf[o + 2] = clamp(v);
    }
  }
  return sharp(buf, { raw: { width: S, height: S, channels: 3 } });
}

function save(buf, file, flip) {
  let img = sharp(buf, { raw: { width: W, height: H, channels: 4 } });
  if (flip) img = img.flip();
  return img
    .webp({ quality: 85, alphaQuality: 90, effort: 6 })
    .toFile(file)
    .then((i) => console.log(file, i.size, "bytes"));
}

(async () => {
  const top = edgeStrip(4021);
  const bottom = edgeStrip(7717);
  await save(top.mask, "public/home/torn-top-mask.webp", false);
  await save(top.fringe, "public/home/torn-top-fringe.webp", false);
  await save(bottom.mask, "public/home/torn-bottom-mask.webp", true);
  await save(bottom.fringe, "public/home/torn-bottom-fringe.webp", true);
  await grainTile(9091)
    .webp({ quality: 78, effort: 6 })
    .toFile("public/home/kraft-grain.webp")
    .then((i) => console.log("public/home/kraft-grain.webp", i.size, "bytes"));
})();
