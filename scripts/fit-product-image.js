// 상품 사진 속 캔들이 차지하는 크기를 상품끼리 맞춥니다.
//
// 사진마다 캔들이 프레임을 채운 비율이 달라서, 그대로 쓰면 상품 목록에서
// 어떤 캔들은 유난히 크고 어떤 건 작아 보입니다. 기준은 리본 테디베어
// (teddy-bear-candle.png)로, 캔들의 긴 변이 캔버스의 0.679를 차지합니다.
//
// 흰 배경에서 캔들 경계(bbox)를 찾아 그 부분만 잘라 목표 크기로 줄이고,
// 1024x1024 흰 바탕 가운데에 다시 올립니다. 이미 목표 비율인 사진에 다시 돌려도
// 같은 결과가 나옵니다.
//
// 정사각형으로 맞추는 이유: 상품 카드가 4:5 비율에 object-cover라서 사진의 좌우가
// 잘립니다. 원본 사진의 가로세로 비가 제각각이면(세로 사진, 가로 사진) 잘리는 양도
// 달라져 어떤 상품은 화면에서 더 크게 보입니다. 정사각형으로 통일하면 잘리는 양이
// 모든 상품에서 같아집니다.
//
// 주의: 사진 좌표가 바뀌므로 이 스크립트를 돌린 뒤에는 extract-wick.js의
// 실측 좌표(runRegion의 box·seed)를 다시 재고 심지 오버레이도 다시 뽑아야 합니다.
const sharp = require("sharp");
const path = require("path");

/** 리본 테디베어에서 실측한 값: 캔들 긴 변 678px / 캔버스 998px. */
const TARGET_LONG_SIDE_RATIO = 0.679;

/** 새로 넣는 상품 사진의 canvas 크기. */
const CANVAS = 1024;

const PRODUCTS_DIR = path.join(__dirname, "..", "public", "products");

/** 흰 배경(모든 채널 245 초과)이 아닌 픽셀들의 경계 상자. */
function findSubjectBox(data, { width, height, channels }) {
  let x0 = width, x1 = -1, y0 = height, y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * channels;
      if (data[o] > 245 && data[o + 1] > 245 && data[o + 2] > 245) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) throw new Error("피사체를 찾지 못했습니다(전부 흰 배경)");
  return { x0, y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

async function fit(file) {
  const srcPath = path.join(PRODUCTS_DIR, file);
  const src = sharp(srcPath);
  const { data, info } = await src.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const canvasW = CANVAS;
  const canvasH = CANVAS;

  const box = findSubjectBox(data, info);
  const target = Math.round(TARGET_LONG_SIDE_RATIO * CANVAS);
  const scale = target / Math.max(box.width, box.height);
  const newW = Math.max(1, Math.round(box.width * scale));
  const newH = Math.max(1, Math.round(box.height * scale));

  const subject = await src
    .clone()
    .extract({ left: box.x0, top: box.y0, width: box.width, height: box.height })
    .resize(newW, newH, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  const out = await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      {
        input: subject,
        left: Math.round((canvasW - newW) / 2),
        top: Math.round((canvasH - newH) / 2),
      },
    ])
    .png()
    .toBuffer();

  await sharp(out).toFile(srcPath);
  console.log(
    `${file}: 피사체 ${box.width}x${box.height} -> ${newW}x${newH} ` +
      `/ 캔버스 ${info.width}x${info.height} -> ${canvasW}x${canvasH} ` +
      `(긴 변 비율 ${(Math.max(newW, newH) / canvasW).toFixed(3)})`
  );
}

(async () => {
  for (const f of process.argv.slice(2)) {
    await fit(f);
  }
})();
