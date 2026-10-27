// 히어로 콜라주 뒤에 까는 "손으로 비정형하게 찢은 크라프트지" 사진 한 장을 코드로 그려 webp로 굽습니다.
//
// 왜: 실사 느낌이 필요했지만 검색으로 찾은 스톡 사진을 그대로 쓸 수는 없고(참고 이미지는 기법만 빌림),
// 브라우저에서 SVG 노이즈 필터로 종이 질감을 내는 것도 금지라서, 실제 찢은 크라프트지에서 보이는 것을
// 픽셀 단위로 미리 그려 둔 이미지 한 장으로 만듭니다. 화면에서는 이미지 하나만 그리므로 가볍습니다.
//
// 실제 찢은 크라프트지에서 빌려 온 것:
// - 종이 본체: 균일한 갈색이 아니라 얼룩덜룩한 결 + 짙은 섬유 점 + 밝은 섬유 티끌
// - 찢긴 단면: 겉면 갈색이 벗겨지고 안쪽 밝은 펄프가 드러난 띠. 폭이 자리마다 크게 다르고 보풀이 일어남
// - 둘레: 큰 물결(손이 돌아간 자국) 위에 잔 톱니(섬유가 끊긴 자국)
// 고정 시드 난수를 써서 다시 돌려도 같은 그림이 나옵니다.
//
// 사용법: node scripts/make-kraft-paper.js public/home/kraft-paper.webp
const sharp = require("sharp");

const SIZE = 1000;
const C = SIZE / 2;
const R = SIZE * 0.45; // 찢긴 단면(밝은 띠) 바깥 끝까지의 기준 반지름

let seed = 20261027;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

// 1차원 둘레 노이즈: 각도(0~1)를 고리로 이어 붙인 값 노이즈. 끝과 처음이 이어져 이음매가 없습니다.
function ringNoise(cells, linear = false) {
  const v = Array.from({ length: cells }, () => rnd() * 2 - 1);
  return (t) => {
    const x = (((t % 1) + 1) % 1) * cells;
    const i = Math.floor(x);
    const f = x - i;
    // linear: 꺾인 자리가 날카롭게 남아, 찢는 방향이 툭 바뀐 자국처럼 보입니다.
    const s = linear ? f : f * f * (3 - 2 * f);
    return v[i % cells] * (1 - s) + v[(i + 1) % cells] * s;
  };
}

// 2차원 값 노이즈(격자 해시 + 부드러운 보간). 종이 결 얼룩과 보풀에 씁니다.
function valueNoise2D(cell) {
  const n = Math.ceil(SIZE / cell) + 2;
  const g = new Float32Array(n * n).map(() => rnd() * 2 - 1);
  return (x, y) => {
    const gx = x / cell;
    const gy = y / cell;
    // 격자 밖(늘려 읽는 보풀 등)은 감아서 다시 읽어 빈칸이 생기지 않게 합니다.
    const i = ((Math.floor(gx) % (n - 1)) + (n - 1)) % (n - 1);
    const j = ((Math.floor(gy) % (n - 1)) + (n - 1)) % (n - 1);
    const fx = gx - Math.floor(gx);
    const fy = gy - Math.floor(gy);
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = g[j * n + i];
    const b = g[j * n + i + 1];
    const c = g[(j + 1) * n + i];
    const d = g[(j + 1) * n + i + 1];
    return (a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy;
  };
}

// 바깥 둘레: 큰 물결 + 중간 굴곡 + 잔 톱니
const edgeLow = ringNoise(5);
const edgeMid = ringNoise(23);
const edgeHigh = ringNoise(140);
const edgeFine = ringNoise(520);
// 찢긴 단면 폭: 어떤 곳은 거의 없고 어떤 곳은 넓게(실제 찢을 때 비스듬히 찢긴 정도가 달라서)
const fringeLow = ringNoise(7);
const fringeHigh = ringNoise(90);

// 종이 결: 큰 얼룩 + 중간 결 + 고운 결
const mottleBig = valueNoise2D(180);
const mottleMid = valueNoise2D(40);
const grain = valueNoise2D(3);
const grain2 = valueNoise2D(1.4);
// 단면 보풀
const fluff = valueNoise2D(2.2);
const fluffBig = valueNoise2D(9);

// 바탕 모양: 동그라미가 아니라 손으로 대충 찢어 낸 네모에 가까운 덩어리.
// 모서리가 둥근 사각(초타원)을 살짝 돌려 두고, 큰 물결을 세게 줘서 변마다 불룩하거나 패이게 합니다.
const ROT = -0.07;
const SHAPE_N = 4.5;
const SHAPE_A = 0.98; // 가로 반지름 비율(R 기준)
const SHAPE_B = 0.84; // 세로 반지름 비율
function baseR(t) {
  const a = t * Math.PI * 2 - ROT;
  const c = Math.abs(Math.cos(a)) / SHAPE_A;
  const s = Math.abs(Math.sin(a)) / SHAPE_B;
  return R * Math.pow(Math.pow(c, SHAPE_N) + Math.pow(s, SHAPE_N), -1 / SHAPE_N);
}
const edgeBig = ringNoise(4);
const edgeJog = ringNoise(11, true);
const edgeChunk = ringNoise(37, true);
const outerR = (t) =>
  baseR(t) +
  edgeBig(t) * 22 +
  edgeJog(t) * 26 +
  edgeChunk(t) * 11 +
  edgeMid(t) * 6 +
  edgeHigh(t) * 3.6 +
  edgeFine(t) * 1.4;
const fringeW = (t) => Math.max(1.5, 14 + fringeLow(t) * 15 + fringeHigh(t) * 5);

// 섬유 점(짙은 것·밝은 것)은 미리 흩뿌려 두고 픽셀마다 더합니다.
const flecks = new Float32Array(SIZE * SIZE);
for (let k = 0; k < 2600; k++) {
  const x = Math.floor(rnd() * SIZE);
  const y = Math.floor(rnd() * SIZE);
  const dark = rnd() < 0.7;
  const amount = (dark ? -1 : 1) * (10 + rnd() * 22);
  // 대부분 한두 픽셀, 가끔 짧은 섬유 가닥
  const len = rnd() < 0.15 ? 2 + Math.floor(rnd() * 5) : 1;
  const ang = rnd() * Math.PI;
  for (let s = 0; s < len; s++) {
    const px = Math.round(x + Math.cos(ang) * s);
    const py = Math.round(y + Math.sin(ang) * s);
    if (px >= 0 && py >= 0 && px < SIZE && py < SIZE) flecks[py * SIZE + px] += amount;
  }
}

const KRAFT = [203, 176, 134]; // 겉면 갈색(참고 사진의 크라프트지 톤)
const PULP = [232, 221, 199]; // 찢긴 단면에 드러난 안쪽 펄프

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const buf = Buffer.alloc(SIZE * SIZE * 4);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const dx = x - C;
    const dy = y - C;
    const d = Math.hypot(dx, dy);
    const t = (Math.atan2(dy, dx) / (Math.PI * 2) + 1) % 1;
    const ro = outerR(t);
    const fw = fringeW(t);
    // 보풀: 바깥 끝을 2D 노이즈로 들쭉날쭉하게 해 섬유가 삐져나온 듯이
    const fuzz = fluff(x, y) * 3.2 + fluffBig(x, y) * 2.4;
    const outer = ro + fuzz;
    if (d > outer + 1.5) continue;

    const coreR = ro - fw + fluffBig(x, y) * 2.5;
    // 0 = 겉면 갈색, 1 = 단면 펄프
    const pulp = smooth(coreR - 1.2, coreR + 1.8, d);

    const tone =
      mottleBig(x, y) * 5.5 + mottleMid(x, y) * 4 + grain(x, y) * 6 + grain2(x, y) * 4 + flecks[y * SIZE + x] * (1 - pulp * 0.7);
    // 단면은 섬유가 일어나 그 자체가 더 밝고 거칠게
    const pulpTone = fluff(x, y) * 10;
    // 가장자리로 갈수록 살짝 묵어 짙어지는 얼룩(가운데는 빛을 받아 조금 밝게)
    const age = -smooth(0.6, 0.98, d / ro) * 10 + (1 - smooth(0, 0.6, d / ro)) * 4;

    const base = KRAFT.map((c, i) => c + tone + age * (i === 2 ? 1.25 : 1));
    const pul = PULP.map((c) => c + pulpTone + tone * 0.35);
    const col = base.map((c, i) => c * (1 - pulp) + pul[i] * pulp);

    // 바깥 끝: 보풀 노이즈로 투명해지는 경계(계단현상 없이 1.5px 정도 부드럽게)
    let a = 1 - smooth(outer - 1.5, outer + 1.5, d);
    // 단면 바깥쪽 절반은 섬유가 성글어 군데군데 비침
    const sparse = smooth(ro - fw * 0.35, ro + 2, d);
    a *= 1 - sparse * (0.35 + fluff(x * 1.7, y * 1.7) * 0.35);

    const o = (y * SIZE + x) * 4;
    buf[o] = clamp(col[0]);
    buf[o + 1] = clamp(col[1]);
    buf[o + 2] = clamp(col[2]);
    buf[o + 3] = clamp(a * 255);
  }
}

const out = process.argv[2] || "public/home/kraft-paper.webp";
sharp(buf, { raw: { width: SIZE, height: SIZE, channels: 4 } })
  .webp({ quality: 82, alphaQuality: 90, effort: 6 })
  .toFile(out)
  .then((info) => console.log(out, info.size, "bytes"));
