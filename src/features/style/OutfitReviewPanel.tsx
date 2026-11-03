import { useEffect, useRef, useState } from "react";
import type { DailyProduct } from "../../app/App";
import { ITEM_TYPE_LABELS, fetchPendingOutfits, revokeOutfitImages, reviewOutfit } from "../../shared/api/outfits";
import { errorMessage } from "../../shared/api/storage";

// 관리자 검수. 여기서 승인한 코디만 공개 피드에 나온다.
export function OutfitReviewPanel() {
  const [outfits, setOutfits] = useState<DailyProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const outfitsRef = useRef<DailyProduct[]>([]);

  useEffect(() => {
    let active = true;
    fetchPendingOutfits()
      .then((result) => {
        if (!active) { revokeOutfitImages(result.items); return; }
        outfitsRef.current = result.items;
        setOutfits(result.items);
      })
      .catch((err) => { if (active) setError(errorMessage(err)); })
      .finally(() => { if (active) setLoaded(true); });
    return () => {
      active = false;
      revokeOutfitImages(outfitsRef.current);
    };
  }, []);

  const removeOutfit = (outfit: DailyProduct) => {
    revokeOutfitImages([outfit]);
    outfitsRef.current = outfitsRef.current.filter((o) => o.id !== outfit.id);
    setOutfits(outfitsRef.current);
  };

  const submit = async (outfit: DailyProduct, review: Parameters<typeof reviewOutfit>[1]) => {
    setError("");
    setBusyId(outfit.id);
    try {
      await reviewOutfit(outfit.id, review);
      setRejectingId(null);
      setReason("");
      removeOutfit(outfit);
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusyId(null);
  };

  if (!loaded) return <p className="text-[14px] text-[#8c857d]">불러오는 중...</p>;

  return (
    <div className="max-w-[720px] space-y-2">
      {error && <p className="text-[13px] text-[#b34b42]">{error}</p>}
      {outfits.length === 0 && !error && <p className="text-[14px] text-[#8c857d]">검수를 기다리는 코디가 없습니다.</p>}
      {outfits.map((outfit) => (
        <div key={outfit.id} className="flex gap-4 border border-[#dedbd6] bg-white p-4">
          <img src={outfit.img} alt={outfit.name} className="h-[120px] w-[90px] shrink-0 object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-[#171615]">{outfit.name}</p>
            <p className="mt-1 text-[11px] text-[#8c857d]">{outfit.authorName} · {outfit.height}cm · {outfit.weight}kg</p>
            {outfit.desc && <p className="mt-1 text-[12px] leading-relaxed text-[#5c564f]">{outfit.desc}</p>}
            <p className="mt-1 text-[12px] text-[#5c564f]">{outfit.items.map((item) => `${ITEM_TYPE_LABELS[item.type]} ${item.name}`).join(", ")}</p>

            {rejectingId === outfit.id ? (
              <div className="mt-3">
                <textarea
                  rows={2}
                  aria-label="반려 사유"
                  placeholder="반려 사유를 입력해주세요"
                  maxLength={1000}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full resize-none border border-[#dedbd6] px-3 py-2 text-[13px] outline-none focus:border-[#171615]"
                />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => { setRejectingId(null); setReason(""); }} className="border border-[#dedbd6] px-3 py-2 text-[12px] font-medium text-[#171615]">취소</button>
                  <button type="button" disabled={!reason.trim() || busyId === outfit.id} onClick={() => void submit(outfit, { status: "REJECTED", reason: reason.trim() })} className="bg-[#b34b42] px-3 py-2 text-[12px] font-bold text-white disabled:opacity-40">반려 확정</button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <button type="button" disabled={busyId === outfit.id} onClick={() => void submit(outfit, { status: "APPROVED" })} className="bg-[#171615] px-3 py-2 text-[12px] font-bold text-white disabled:opacity-40">승인</button>
                <button type="button" disabled={busyId === outfit.id} onClick={() => { setRejectingId(outfit.id); setReason(""); }} className="border border-[#dedbd6] px-3 py-2 text-[12px] font-medium text-[#b34b42] transition-colors hover:border-[#b34b42] disabled:opacity-40">반려</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
