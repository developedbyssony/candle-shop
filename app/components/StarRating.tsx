const STAR_PATH =
  "M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z";

function Stars({ size, color }: { size: number; color: string }) {
  return (
    <span className="flex" style={{ color }} aria-hidden>
      {[0, 1, 2, 3, 4].map((index) => (
        <svg
          key={index}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="shrink-0"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

/**
 * 별 다섯 개를 겹쳐 그려서 4.3점 같은 소수점도 표현합니다.
 * 아래에는 빈 별을, 위에는 점수만큼 잘라낸 채운 별을 얹습니다.
 */
export default function StarRating({
  value,
  size = 14,
}: {
  value: number;
  size?: number;
}) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));

  return (
    <span
      className="relative inline-block align-middle"
      style={{ height: size }}
      role="img"
      aria-label={`5점 만점에 ${value}점`}
    >
      <Stars size={size} color="var(--color-sand)" />
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${percent}%` }}
        aria-hidden
      >
        <Stars size={size} color="var(--color-sage-dark)" />
      </span>
    </span>
  );
}
