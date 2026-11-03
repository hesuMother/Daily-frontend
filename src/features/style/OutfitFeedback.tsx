import { useEffect, useState } from "react";
import { Flag, X } from "lucide-react";
import { createReport, fetchReportCategories } from "../../shared/api/reports";
import { errorMessage } from "../../shared/api/storage";
import type { Category } from "../../shared/api/types";

// ─── 신고 모달 ────────────────────────────────────────────────────────────────

function ReportModal({ outfitId, outfitName, onClose }: { outfitId: string; outfitName: string; onClose: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    fetchReportCategories()
      .then((rows) => { if (active) setCategories(rows); })
      .catch((err) => { if (active) setError(errorMessage(err)); });
    return () => { active = false; };
  }, []);

  const handleSubmit = async () => {
    if (categoryId === null) { setError("신고 분류를 선택해주세요."); return; }
    if (!reason.trim()) { setError("신고 사유를 입력해주세요."); return; }
    try {
      await createReport({ categoryId, reason, description, targetType: "OUTFIT", targetId: outfitId });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-5 text-left" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="relative w-full max-w-[400px] bg-background p-6" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
        <button type="button" onClick={onClose} aria-label="닫기" className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground">
          <X size={17} />
        </button>

        {done ? (
          <div className="py-4 text-center">
            <p className="mb-2 text-[16px] font-bold">신고가 접수되었습니다</p>
            <p className="mb-6 text-[12px] leading-relaxed text-muted-foreground">검토 후 필요한 조치를 진행하겠습니다.</p>
            <button type="button" onClick={onClose} className="w-full bg-primary py-3 text-[13px] font-bold text-primary-foreground">확인</button>
          </div>
        ) : (
          <>
            <p className="mb-1 text-[16px] font-bold">코디 신고</p>
            <p className="mb-5 truncate text-[12px] text-muted-foreground">{outfitName}</p>

            <p className="mb-2 text-[12px] font-medium text-muted-foreground">신고 분류</p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setCategoryId(c.id); setError(""); }}
                  className={`border px-3 py-1.5 text-[12px] transition-colors ${
                    categoryId === c.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <label htmlFor="report-reason" className="mb-1.5 block text-[12px] font-medium text-muted-foreground">신고 사유</label>
            <input
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={60}
              placeholder="한 줄로 요약해주세요"
              className="mb-4 w-full border border-border bg-background px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-primary"
            />

            <label htmlFor="report-description" className="mb-1.5 block text-[12px] font-medium text-muted-foreground">상세 내용 (선택)</label>
            <textarea
              id="report-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              className="w-full resize-none border border-border bg-background px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-primary"
            />

            {error && <p role="alert" className="mt-3 text-[12px] text-destructive">{error}</p>}

            <button type="button" onClick={handleSubmit} className="mt-5 w-full bg-primary py-3 text-[13px] font-bold text-primary-foreground transition-opacity hover:opacity-90">
              신고하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── 신고 ─────────────────────────────────────────────────────────────────────

// TODO: 추후 복구 — 별점. 별점 API가 생기면 이 카드에 다시 넣는다.
export function OutfitFeedback({ outfitId, outfitName }: { outfitId: string; outfitName: string }) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="text-left">
      <button
        type="button"
        onClick={() => setReportOpen(true)}
        className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <Flag size={11} /> 이 코디 신고하기
      </button>

      {reportOpen && <ReportModal outfitId={outfitId} outfitName={outfitName} onClose={() => setReportOpen(false)} />}
    </div>
  );
}
