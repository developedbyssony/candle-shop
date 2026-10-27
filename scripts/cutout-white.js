// 흰 배경 상품 사진에서 바탕만 투명하게 오려 냅니다(홈 '색 골라 보기' 무대용).
//
// 왜: 색 골라 보기는 사진 전체에 SVG 색 필터를 거는데, 그러면 흰 바탕까지 살짝 물들어
// 흰 무대 위에 사진 네모 테두리가 비쳐 보입니다. 바탕을 투명하게 해 두면 필터는 캔들에만 먹습니다.
//
// 방법: 사진 네 가장자리에서 출발해, 흰색에 가까운 픽셀만 따라 번져 나가며(flood fill) 투명하게 합니다.
// 가장자리와 이어진 흰색만 지우므로 캔들 안쪽의 밝은 부분(심지 끈, 하이라이트)은 그대로 남습니다.
// 경계는 흰색에 가까운 정도만큼 반투명하게 남겨 계단현상이 생기지 않게 합니다.
// 크기는 원본 그대로 둬서, 위에 얹는 심지 이미지(wickImage)와 자리가 어긋나지 않습니다.
//
// 사용법: node scripts/cutout-white.js <입력.png> <출력.png>
const sharp = require("sharp");

// 이 값 이상이면(가장 어두운 채널 기준) 완전히 바탕으로 보고 투명하게 합니다.
const CLEAR = 250;
// 이 값까지는 바탕이 번져 나가되, CLEAR보다 어두운 만큼 반투명으로 남깁니다(그림자 가장자리 부드럽게).
const EDGE = 238;

async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error("사용법: node scripts/cutout-white.js <입력.png> <출력.png>");

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const lightness = (p) => Math.min(data[p * 4], data[p * 4 + 1], data[p * 4 + 2]);

  const seen = new Uint8Array(width * height);
  const queue = [];
  const push = (p) => {
    if (seen[p] || lightness(p) < EDGE) return;
    seen[p] = 1;
    queue.push(p);
  };
  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    push(y * width + width - 1);
  }

  while (queue.length) {
    const p = queue.pop();
    const value = lightness(p);
    // CLEAR 이상은 완전 투명, EDGE~CLEAR 사이는 흰색에 가까울수록 더 투명하게.
    const alpha = value >= CLEAR ? 0 : Math.round(((CLEAR - value) / (CLEAR - EDGE)) * 255);
    data[p * 4 + 3] = Math.min(data[p * 4 + 3], alpha);
    const x = p % width;
    if (x > 0) push(p - 1);
    if (x < width - 1) push(p + 1);
    if (p >= width) push(p - width);
    if (p < width * (height - 1)) push(p + width);
  }

  await sharp(data, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(output);
  console.log(`${input} → ${output}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
