import type { DailyProduct } from "../../app/App";
import type { ModerationStatus } from "../../shared/api/types";

const STATUS_LABELS: Record<ModerationStatus, { label: string; className: string }> = {
  PENDING: { label: "검수 대기", className: "bg-[#8c857d]" },
  APPROVED: { label: "공개 중", className: "bg-[#3f7a4d]" },
  REJECTED: { label: "반려", className: "bg-[#b34b42]" },
};

// 로그인한 회원이 직접 올린 코디 목록.
// TODO: 추후 복구 — 코디 삭제 API가 생기면 삭제 버튼을 다시 넣는다.
export function MyOutfits({
  outfits,
  error,
  hasMore,
  onLoadMore,
  onSelect,
}: {
  outfits: DailyProduct[];
  error: string;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelect: (outfit: DailyProduct) => void;
}) {
  if (error) return <p className="pt-20 text-center text-[14px] text-[#b34b42]">{error}</p>;

  if (outfits.length === 0) {
    return <p className="pt-20 text-center text-[14px] text-[#8c857d]">아직 올린 코디가 없어요</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {outfits.map((outfit) => {
          const status = STATUS_LABELS[outfit.status];
          return (
            <div key={outfit.id}>
              <div className="relative aspect-[3/4] overflow-hidden bg-[#efede9]">
                <button type="button" onClick={() => onSelect(outfit)} aria-label={`${outfit.name} 보기`} className="block h-full w-full">
                  <img src={outfit.img} alt="" className="h-full w-full object-cover" />
                </button>
                <span className={`absolute left-2.5 top-2.5 px-2 py-0.5 text-[10px] font-bold text-white ${status.className}`}>{status.label}</span>
              </div>
              <p className="mt-3 truncate text-[13px]">{outfit.name}</p>
              <p className="mt-1 text-[12px] text-[#8c857d]">연결 상품 {outfit.items.length}개</p>
              {outfit.rejectionReason && <p className="mt-1 text-[12px] text-[#b34b42]">반려 사유: {outfit.rejectionReason}</p>}
            </div>
          );
        })}
      </div>
      {hasMore && (
        <button type="button" onClick={onLoadMore} className="mt-6 w-full border border-[#dedbd6] py-3 text-[13px] font-medium text-[#171615] transition-colors hover:border-[#171615]">더 보기</button>
      )}
    </div>
  );
}
