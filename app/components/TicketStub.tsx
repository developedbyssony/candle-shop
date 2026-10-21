/**
 * 마스킹 테이프로 붙여 둔 분홍 입장권 — "저녁 7시 불 켜는 시간".
 * 픽셀 글꼴(font-pixel)은 쓰는 글자만 잘라 둔 파일이라, 문구를 바꾸면 글꼴도 새로 잘라야 합니다.
 */
export default function TicketStub({ className = "" }: { className?: string }) {
  return (
    <div className={`relative inline-block rotate-[-5deg] ${className}`}>
      <div className="ticket-stub flex bg-[#e8b9a6] text-[#5a2f22] drop-shadow-[0_6px_10px_rgba(30,27,23,0.14)]">
        <p className="pl-5 pr-3 py-2.5 md:pl-7 md:pr-5 md:py-4 border-r border-dashed border-[#5a2f22]/40 font-pixel text-[11px] md:text-[15px] leading-[1.4] whitespace-nowrap">
          저녁 7시
          <br />
          불 켜는 시간
        </p>
        <p className="pl-2 pr-4 md:pl-3 md:pr-6 grid place-items-center font-pixel text-[10px] md:text-[12px] [writing-mode:vertical-rl]">
          0326
        </p>
      </div>
      <span aria-hidden className="masking-tape -top-2 left-[30%] w-[40%] rotate-[4deg]" />
    </div>
  );
}
