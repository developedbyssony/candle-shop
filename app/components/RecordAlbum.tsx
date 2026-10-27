import Image from "next/image";

/**
 * 히어로 콜라주의 앨범 재킷 + 뒤에 꽂힌 LP(장식).
 * 색색 캔들 일러스트를 재킷으로 쓰고, 오른쪽으로 살짝 삐져나온 판이 스크랩북 느낌을 더합니다.
 */
export default function RecordAlbum() {
  return (
    <span className="relative block w-full">
      {/* LP: 재킷 뒤에서 오른쪽으로 살짝 나와 있습니다. 가운데 라벨은 테라코타색. */}
      <span aria-hidden className="absolute top-[6%] left-[36%] w-[88%] aspect-square">
        <span
          className="block w-full h-full rounded-full shadow-[0_8px_18px_rgba(30,27,23,0.25)]"
          style={{
            background:
              "radial-gradient(circle, #1e1b17 0 1.6%, #c8875e 2% 13%, #1e1b17 13.5% 15%, transparent 15.5%), conic-gradient(from 20deg, transparent 0 40deg, rgba(255,255,255,0.08) 60deg, transparent 80deg 220deg, rgba(255,255,255,0.06) 240deg, transparent 260deg), repeating-radial-gradient(circle, #1e1b17 0 1.5px, #2b2723 1.5px 3px)",
          }}
        />
      </span>

      <span className="relative block aspect-square border-[3px] border-white shadow-[0_14px_28px_rgba(30,27,23,0.2)]">
        <Image
          src="/home/color-candles.webp"
          alt="초록 바탕에 여러 색 캔들이 켜진 일러스트"
          fill
          className="object-cover"
          sizes="(max-width: 767px) 38vw, 210px"
        />
      </span>
    </span>
  );
}
