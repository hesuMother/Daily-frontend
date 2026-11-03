import { useEffect, useState } from "react";
import { fetchReports, updateReportStatus, type ReportAction } from "../../shared/api/reports";
import { errorMessage } from "../../shared/api/storage";
import type { AdminReport, ReportStatus, TargetType } from "../../shared/api/types";

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("ko-KR");

const STATUS_LABELS: Record<ReportStatus, string> = { PENDING: "접수", REVIEWING: "검토 중", RESOLVED: "해결", REJECTED: "반려" };

const HIDE_ACTIONS: Partial<Record<TargetType, { action: ReportAction; label: string }>> = {
  OUTFIT: { action: "HIDE_OUTFIT", label: "해결하면서 코디 숨기기" },
  PRODUCT: { action: "HIDE_PRODUCT", label: "해결하면서 상품 숨기기" },
};

const isOpen = (status: ReportStatus): status is "PENDING" | "REVIEWING" => status === "PENDING" || status === "REVIEWING";

function ReportActions({ report, onChanged, onError }: { report: AdminReport; onChanged: (report: AdminReport) => void; onError: (message: string) => void }) {
  const [note, setNote] = useState("");
  const [hide, setHide] = useState(false);
  const [busy, setBusy] = useState(false);
  const { status: expectedStatus } = report;
  const hideAction = HIDE_ACTIONS[report.targetType];
  if (!isOpen(expectedStatus)) return null;

  const submit = async (status: "REVIEWING" | "RESOLVED" | "REJECTED") => {
    setBusy(true);
    onError("");
    try {
      const action = status === "RESOLVED" && hide ? hideAction?.action : undefined;
      onChanged(await updateReportStatus(report.id, { expectedStatus, status, note: note.trim(), action }));
      setNote("");
      setHide(false);
    } catch (err) {
      onError(errorMessage(err));
    }
    setBusy(false);
  };

  const disabled = busy || !note.trim();
  const buttonClass = "border border-[#dedbd6] px-3 py-2 text-[12px] font-medium text-[#171615] transition-colors hover:border-[#171615] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="mt-3 border-t border-[#efede9] pt-3">
      <textarea
        rows={2}
        aria-label="처리 메모"
        placeholder="처리 메모 (필수, 신고자에게 공개되지 않습니다)"
        maxLength={2000}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full resize-none border border-[#dedbd6] px-3 py-2 text-[13px] outline-none focus:border-[#171615]"
      />
      {hideAction && (
        <label className="mt-2 flex items-center gap-2 text-[12px] text-[#5c564f]">
          <input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} className="accent-[#171615]" />
          {hideAction.label}
        </label>
      )}
      <div className="mt-2 flex gap-2">
        {expectedStatus === "PENDING" && <button type="button" disabled={disabled} onClick={() => void submit("REVIEWING")} className={buttonClass}>검토 시작</button>}
        <button type="button" disabled={disabled} onClick={() => void submit("RESOLVED")} className={buttonClass}>해결</button>
        <button type="button" disabled={disabled} onClick={() => void submit("REJECTED")} className={buttonClass}>반려</button>
      </div>
    </div>
  );
}

export function ReportAdminPanel() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchReports()
      .then((result) => { if (active) { setReports(result.items); setHasMore(result.hasMore); } })
      .catch((err) => { if (active) setError(errorMessage(err)); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  const loadMore = async () => {
    try {
      const result = await fetchReports(page + 1);
      setReports((prev) => [...prev, ...result.items]);
      setPage(result.page);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (!loaded) return <p className="text-[14px] text-[#8c857d]">불러오는 중...</p>;

  return (
    <div className="max-w-[720px] space-y-2">
      {error && <p className="text-[13px] text-[#b34b42]">{error}</p>}
      {reports.length === 0 && !error && <p className="text-[14px] text-[#8c857d]">접수된 신고가 없습니다.</p>}
      {reports.map((report) => (
        <div key={report.id} className="border border-[#dedbd6] bg-white px-4 py-4">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="bg-[#efede9] px-2 py-0.5 text-[10px] font-bold text-[#8c857d]">{report.category.name}</span>
            <span className={`text-[10px] font-bold ${isOpen(report.status) ? "text-[#b34b42]" : "text-[#3f7a4d]"}`}>{STATUS_LABELS[report.status]}</span>
          </div>
          <p className="text-[14px] font-medium text-[#171615]">{report.reason}</p>
          {report.description && <p className="mt-1 text-[12px] leading-relaxed text-[#5c564f]">{report.description}</p>}
          <p className="mt-2 text-[11px] text-[#8c857d]">
            {report.reporter?.username ?? "탈퇴한 회원"} · {formatDate(report.createdAt)} · {report.targetType} {report.targetId}
            {report.completedAt && ` · ${formatDate(report.completedAt)} 처리`}
          </p>
          {report.adminNote && <p className="mt-1 text-[12px] text-[#5c564f]">메모: {report.adminNote}</p>}
          <ReportActions
            key={report.status}
            report={report}
            onError={setError}
            onChanged={(updated) => setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
          />
        </div>
      ))}
      {hasMore && (
        <button type="button" onClick={() => void loadMore()} className="w-full border border-[#dedbd6] py-3 text-[13px] font-medium text-[#171615] transition-colors hover:border-[#171615]">더 보기</button>
      )}
    </div>
  );
}
