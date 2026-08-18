// 손글씨 이미지(흰 배경 + 검은 획)를 배경이 비치는 투명 PNG로 바꿉니다.
//
// 방법: 밝기를 그대로 알파로 뒤집습니다. 흰 배경(밝음)은 알파 0, 획(어두움)은
// 알파 255가 되고, 획 가장자리의 회색은 그대로 반투명이 되어 계단현상 없이
// 크림색 배경 위에 얹힙니다. 색은 브랜드 잉크색으로 통일합니다.
//
// 사용법: node scripts/make-calligraphy.js <입력.png> <출력.png> [색상(#rrggbb)]
const sharp = require("sharp");

// 배경이 순백(255)이 아니라 살짝 회색이라, 이 값보다 밝으면 배경으로 봅니다.
const WHITE_POINT = 246;
// 이 값보다 어두우면 획의 한가운데로 보고 완전 불투명 처리합니다.
const BLACK_POINT = 40;
const DEFAULT_COLOR = "#1e1b17"; // var(--color-ink)
const PADDING = 8; // 잘라낸 뒤 사방에 남길 여백(px)
const OUTPUT_WIDTH = 1200;

function parseColor(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`색상은 #rrggbb 형식이어야 합니다: ${hex}`);
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

async function main() {
  const [input, output, color = DEFAULT_COLOR] = process.argv.slice(2);
  if (!input || !output) {
    console.error(
      "사용법: node scripts/make-calligraphy.js <입력.png> <출력.png> [색상(#rrggbb)]"
    );
    process.exit(1);
  }
  const ink = parseColor(color);

  const { data, info } = await sharp(input)
    .flatten({ background: "#ffffff" }) // 원본에 알파가 있어도 흰 배경으로 깔고 시작
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  // 글씨가 있는 범위를 찾아 여백을 잘라냅니다.
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[y * width + x] < WHITE_POINT) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("글씨를 찾지 못했습니다(전부 배경입니다)");

  minX = Math.max(0, minX - PADDING);
  minY = Math.max(0, minY - PADDING);
  maxX = Math.min(width - 1, maxX + PADDING);
  maxY = Math.min(height - 1, maxY + PADDING);

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const rgba = Buffer.alloc(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gray = data[(y + minY) * width + (x + minX)];
      const alpha = Math.round(
        Math.min(1, Math.max(0, (WHITE_POINT - gray) / (WHITE_POINT - BLACK_POINT))) * 255
      );
      const i = (y * w + x) * 4;
      rgba[i] = ink[0];
      rgba[i + 1] = ink[1];
      rgba[i + 2] = ink[2];
      rgba[i + 3] = alpha;
    }
  }

  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .resize({ width: OUTPUT_WIDTH, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: false })
    .toFile(output);

  console.log(`${input} → ${output} (${w}x${h} 잘라내고 ${OUTPUT_WIDTH}px로 저장)`);
}

main();
