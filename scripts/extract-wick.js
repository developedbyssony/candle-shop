// 심지만 담은 오버레이 PNG를 만듭니다. 몸통 위에 필터 없이 그대로 얹어서
// 심지는 어떤 색으로 바꿔도 원래 색 그대로 보이게 하기 위한 스크립트입니다.
//
// 방법(모폴로지 opening): 배경이 아닌 픽셀(몸통+심지)에서 반경 R로 침식하면
// 심지처럼 가느다란 부분은 통째로 사라지고 몸통만 남습니다. 그걸 다시 R만큼
// 팽창시켜 원래 몸통 모양으로 되돌리면(=opening), 심지와 몸통을 잇는 얇은
// 연결부까지 함께 사라진 "몸통만" 마스크가 됩니다. 원본 전경에서 이 마스크를
// 빼면 심지(+연결부)만 남습니다.
const sharp = require("sharp");
const path = require("path");

const R = 10; // 심지 굵기(약 15~17px)의 절반보다 크게, 침식 시 심지가 확실히 없어지도록

function erode(mask, w, h, r) {
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  // 가로 최소값
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 1;
      for (let dx = -r; dx <= r; dx++) {
        const xx = x + dx;
        if (xx < 0 || xx >= w || mask[y * w + xx] === 0) { v = 0; break; }
      }
      tmp[y * w + x] = v;
    }
  }
  // 세로 최소값
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 1;
      for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h || tmp[yy * w + x] === 0) { v = 0; break; }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

function dilate(mask, w, h, r) {
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let dx = -r; dx <= r; dx++) {
        const xx = x + dx;
        if (xx >= 0 && xx < w && mask[y * w + xx] === 1) { v = 1; break; }
      }
      tmp[y * w + x] = v;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy;
        if (yy >= 0 && yy < h && tmp[yy * w + x] === 1) { v = 1; break; }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

// minSize보다 작은 조각(잡티)과, maxTopFrac보다 아래에서 시작하는 조각(심지는
// 항상 사진 위쪽에 있으므로, 몸통 아래쪽 물결무늬 테두리가 침식으로 잘못 걸리는
// 것을 막기 위함)을 지웁니다.
function removeSmallComponents(mask, w, h, minSize, maxTopFrac) {
  const labels = new Int32Array(w * h).fill(-1);
  const sizes = [];
  const minY = [];
  const minX = [];
  const maxX = [];
  const maxY = [];
  const stack = [];
  let label = 0;
  for (let start = 0; start < w * h; start++) {
    if (mask[start] === 0 || labels[start] !== -1) continue;
    let size = 0;
    let cMinY = h, cMaxY = 0, cMinX = w, cMaxX = 0;
    stack.push(start);
    labels[start] = label;
    while (stack.length) {
      const idx = stack.pop();
      size++;
      const x = idx % w, y = (idx / w) | 0;
      if (y < cMinY) cMinY = y;
      if (y > cMaxY) cMaxY = y;
      if (x < cMinX) cMinX = x;
      if (x > cMaxX) cMaxX = x;
      // 8방향으로 연결을 봐서 대각선으로 이어진 꼬임무늬 조각도 한 덩어리로 잡습니다.
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const nIdx = ny * w + nx;
          if (mask[nIdx] === 1 && labels[nIdx] === -1) {
            labels[nIdx] = label;
            stack.push(nIdx);
          }
        }
      }
    }
    sizes[label] = size;
    minY[label] = cMinY;
    minX[label] = cMinX;
    maxX[label] = cMaxX;
    maxY[label] = cMaxY;
    if (process.env.DEBUG_WICK && size > 5) {
      console.log(
        `  component ${label}: size=${size} bbox=(${cMinX},${cMinY})-(${cMaxX},${cMaxY}) w=${cMaxX - cMinX} h=${cMaxY - cMinY}`
      );
    }
    label++;
  }
  const out = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const l = labels[i];
    if (l === -1) { out[i] = 0; continue; }
    const bw = maxX[l] - minX[l];
    const bh = maxY[l] - minY[l];
    // 심지 조각은 늘 (혹은 대체로) 가로보다 세로가 깁니다. 몸통 위·아래 테두리를
    // 따라 생기는 하이라이트/그림자 얇은 띠는 반대로 세로보다 가로가 훨씬 길어서
    // 이 기준으로 걸러집니다.
    const looksLikeRimStreak = bw > bh * 1.3 && sizes[l] < 600;
    out[i] =
      sizes[l] >= minSize && minY[l] / h <= maxTopFrac && !looksLikeRimStreak
        ? 1
        : 0;
  }
  return out;
}

/**
 * 마스크가 1인 곳만 원본 색으로 남기고 나머지는 완전 투명하게 저장합니다.
 *
 * 투명한 부분의 RGB까지 0으로 눌러 둡니다. 눈에 보이지 않는 값이지만 그대로
 * 남기면 PNG 압축이 사진 전체를 그대로 안고 가서 파일이 900KB 가까이 됩니다.
 * 0으로 채우면 같은 그림이 17KB로 줄어듭니다.
 */
async function writeWick(file, data, info, mask) {
  const { width, height, channels } = info;
  const n = width * height;
  const out = Buffer.alloc(n * 4);
  let wickPixelCount = 0;
  for (let i = 0; i < n; i++) {
    const o = i * channels;
    const oo = i * 4;
    if (mask[i]) {
      out[oo] = data[o];
      out[oo + 1] = data[o + 1];
      out[oo + 2] = data[o + 2];
      out[oo + 3] = 255;
      wickPixelCount++;
    }
  }

  const outName = file.replace(".png", "-wick.png");
  const outPath = path.join(__dirname, "..", "public", "products", outName);
  await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(outPath);
  console.log(file, "-> ", outName, "wick px:", wickPixelCount);
}

async function run(file) {
  const srcPath = path.join(__dirname, "..", "public", "products", file);
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const n = width * height;

  const fg = new Uint8Array(n); // 전경(배경 아님) = 몸통+심지
  for (let i = 0; i < n; i++) {
    const o = i * channels;
    const r = data[o], g = data[o + 1], b = data[o + 2];
    fg[i] = r > 245 && g > 245 && b > 245 ? 0 : 1;
  }

  const eroded = erode(fg, width, height, R);
  const opened = dilate(eroded, width, height, R); // = 몸통만(심지 없음)

  // 심지 마스크를 팽창시켜(가장자리 안티앨리어싱까지 포함, 꼬인 심지 끝이 스스로
  // 맞닿는 지점의 1~2px짜리 안티앨리어싱 틈도 이어붙임) 경계가 또렷하고 끊기지
  // 않게 합니다.
  const wickRaw = new Uint8Array(n);
  for (let i = 0; i < n; i++) wickRaw[i] = fg[i] === 1 && opened[i] === 0 ? 1 : 0;
  let wickMask = dilate(wickRaw, width, height, 1);

  // 몸통 테두리 안티앨리어싱에서 생기는 1px짜리 점 잡티만 지웁니다. 심지 끝
  // 갈라진 가닥처럼 진짜 심지인데 작은 조각은 남겨야 하므로 기준을 낮게 둡니다.
  wickMask = removeSmallComponents(wickMask, width, height, 40, 0.6);

  await writeWick(file, data, info, wickMask);
}

// 나머지 상품은 심지가 흰 면 끈이라 거의 무채색입니다. 재색상화 행렬은
// M·(t,t,t) = (t,t,t)라서 무채색을 그대로 두므로 오려낼 필요가 없습니다.
(async () => {
  for (const f of ["twist-candle.png", "ribbed-candle.png", "plain-candle.png"]) {
    await run(f);
  }
})();
