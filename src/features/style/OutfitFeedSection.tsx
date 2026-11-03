import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Heart, X } from "lucide-react";
import type { DailyProduct } from "../../app/App";
import { OutfitFeedback } from "./OutfitFeedback";
import { ProductPicker, type PickedItem } from "./ProductPicker";
import { clickable, useEscapeKey } from "../../shared/a11y";
import { IMAGE_ACCEPT, ITEM_TYPE_LABELS, bodyInfoError, imageFileError, type OutfitInput } from "../../shared/api/outfits";
import { errorMessage } from "../../shared/api/storage";

const bodyInfo = (item: DailyProduct) =>
  [item.height && `${item.height}cm`, item.weight && `${item.weight}kg`].filter(Boolean).join(" · ");

// ─── 코디 피드 업로드 모달 ────────────────────────────────────────────────────

function OutfitFeedUploadModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: OutfitInput) => Promise<void>;
}) {
  const [image, setImage] = useState<File | null>(null);
  const preview = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image]);
  const [title, setTitle] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [items, setItems] = useState<PickedItem[]>([]);
  const [desc, setDesc] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEscapeKey(onClose);

  useEffect(() => () => URL.revokeObjectURL(preview), [preview]);

  const attachImage = (file?: File) => {
    if (!file) return;
    const imageError = imageFileError(file);
    if (imageError) { setErrors((er) => ({ ...er, img: imageError })); return; }
    setImage(file);
    setErrors((er) => ({ ...er, img: "" }));
  };

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "코디 제목을 입력해주세요.";
    if (!image) e.img = "사진을 추가해주세요.";
    if (items.length === 0) e.products = "상품을 1개 이상 추가해주세요.";
    const bodyError = bodyInfoError(height, weight);
    if (bodyError) e.body = bodyError;
    if (Object.keys(e).length || !image) { setErrors(e); return; }
    setSubmitting(true);
    try {
      await onSubmit({ image, name: title, description: desc, height, weight, items });
      setDone(true);
    } catch (err) {
      setErrors({ submit: errorMessage(err) });
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ fontFamily: "'Noto Sans KR', sans-serif", background: "rgba(0,0,0,0.7)" }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative w-full max-w-[520px] mx-0 md:mx-4 flex flex-col shadow-2xl overflow-hidden rounded-t-xl md:rounded-xl"
        style={{ background: "#1a1917", maxHeight: "94vh" }}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#2e2c2a" }}>
          <h2 className="text-white text-base font-bold">코디 올리기</h2>
          <button onClick={onClose} aria-label="닫기" className="text-white/50 hover:text-white/90 transition-colors">
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-14 text-center">
            <p className="text-white text-base font-bold mb-2">코디가 접수되었어요</p>
            <p className="text-xs leading-relaxed mb-6" style={{ color: "#888" }}>관리자 검수를 마치면 피드에 공개됩니다.<br />진행 상태는 마이페이지의 내가 올린 코디에서 볼 수 있어요.</p>
            <button type="button" onClick={onClose} className="px-10 py-3 text-sm font-bold" style={{ background: "white", color: "#111", borderRadius: "6px" }}>확인</button>
          </div>
        ) : (
        <>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6" style={{ scrollbarWidth: "thin" }}>

          {/* 사진 업로드 */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-2.5" style={{ color: "#888" }}>
              사진 <span className="text-red-400">*</span>
            </p>
            {preview ? (
              <div className="relative w-[76px] h-[95px] overflow-hidden" style={{ borderRadius: "6px" }}>
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  aria-label="사진 삭제"
                  onClick={() => { setImage(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.65)" }}
                >
                  <X size={10} color="white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="w-[76px] h-[95px] flex flex-col items-center justify-center gap-2 border transition-colors"
                style={{ borderRadius: "6px", borderColor: errors.img ? "#ef4444" : "#333", background: "#111" }}
                onClick={() => fileRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); attachImage(e.dataTransfer.files?.[0]); }}
                onDragOver={(e) => e.preventDefault()}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span className="text-[10px]" style={{ color: "#555" }}>추가</span>
              </button>
            )}
            {errors.img && <p className="text-xs text-red-400 mt-1.5">{errors.img}</p>}
            <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => attachImage(e.target.files?.[0])} />
          </div>

          {/* 코디 제목 */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: "#888" }}>
              코디 제목 <span className="text-red-400">*</span>
            </p>
            <input
              className="w-full px-0 py-2 text-sm text-white bg-transparent outline-none border-b transition-colors placeholder:text-white/20"
              style={{ borderColor: errors.title ? "#ef4444" : "#333" }}
              placeholder="예: 봄 오피스 데이룩"
              maxLength={40}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((er) => ({ ...er, title: "" })); }}
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
          </div>

          {/* 체형 정보 */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: "#888" }}>체형 정보 <span className="text-red-400">*</span></p>
            <div className="flex gap-6">
              {[
                { placeholder: "키", unit: "cm", value: height, set: setHeight, min: 50, max: 250 },
                { placeholder: "몸무게", unit: "kg", value: weight, set: setWeight, min: 10, max: 400 },
              ].map((f) => (
                <div key={f.unit} className="flex-1 relative">
                  <input
                    type="number"
                    min={f.min}
                    max={f.max}
                    aria-label={f.placeholder}
                    className="w-full px-0 pb-2 text-sm text-white bg-transparent outline-none border-b placeholder:text-white/20 pr-8"
                    style={{ borderColor: errors.body ? "#ef4444" : "#333" }}
                    placeholder={f.placeholder}
                    value={f.value}
                    onChange={(e) => { f.set(e.target.value); setErrors((er) => ({ ...er, body: "" })); }}
                  />
                  <span className="absolute right-0 bottom-2 text-xs" style={{ color: "#666" }}>{f.unit}</span>
                </div>
              ))}
            </div>
            {errors.body && <p className="text-xs text-red-400 mt-1.5">{errors.body}</p>}
          </div>

          {/* 상품 연결 */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-1.5" style={{ color: "#888" }}>
              상품 연결 <span className="text-red-400">*</span>
              {items.length > 0 && <span className="text-white/60 font-normal normal-case ml-1">{items.length}개 선택됨</span>}
            </p>
            <p className="text-[10px] mb-2.5" style={{ color: "#555" }}>상품을 고르고 종류를 지정해주세요. 다시 누르면 선택이 해제돼요.</p>
            <ProductPicker items={items} onChange={(next) => { setItems(next); setErrors((er) => ({ ...er, products: "" })); }} />
            {errors.products && <p className="text-xs text-red-400 mt-1">{errors.products}</p>}
          </div>

          {/* 한 줄 설명 */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: "#888" }}>한 줄 설명 <span className="text-white/25 font-normal normal-case">(선택)</span></p>
            <input
              className="w-full px-0 py-2 text-sm text-white bg-transparent outline-none border-b placeholder:text-white/20"
              style={{ borderColor: "#333" }}
              placeholder="이 코디의 포인트를 한 줄로 소개해주세요"
              maxLength={80}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <p className="text-[10px] text-right mt-1" style={{ color: "#444" }}>{desc.length}/80</p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="shrink-0 px-6 py-4 border-t" style={{ borderColor: "#2e2c2a" }}>
          {errors.submit && <p className="text-xs text-red-400 mb-2">{errors.submit}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-medium border transition-colors"
              style={{ color: "#888", borderColor: "#333", borderRadius: "6px" }}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] py-3 text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ background: "white", color: "#111", borderRadius: "6px" }}
            >
              {submitting ? "업로드 중..." : "코디 올리기"}
            </button>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

const rangeInputClass =
  "absolute w-full h-full appearance-none bg-transparent pointer-events-none " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto " +
  "[&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto";

// ─── 키/몸무게 범위 슬라이더 ──────────────────────────────────────────────────

function DualRangeSlider({
  min, max, minVal, maxVal, onMinChange, onMaxChange, unit,
}: {
  min: number; max: number; minVal: number; maxVal: number;
  onMinChange: (v: number) => void; onMaxChange: (v: number) => void;
  unit: string;
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between mb-3">
        <span style={{ color: "#aaa", fontSize: 12 }}>{minVal}{unit}</span>
        <span style={{ color: "#aaa", fontSize: 12 }}>{maxVal}{unit}</span>
      </div>
      <div className="relative" style={{ height: 24 }}>
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px]" style={{ background: "#333", borderRadius: 2 }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[3px]"
          style={{ left: `${pct(minVal)}%`, right: `${100 - pct(maxVal)}%`, background: "white", borderRadius: 2 }}
        />
        {[minVal, maxVal].map((v, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 pointer-events-none"
            style={{ left: `calc(${pct(v)}% - 8px)`, borderColor: "#222", zIndex: 6 }}
          />
        ))}
        {/* 실제 입력은 투명한 range 두 개가 받는다. 겹쳐 있어서 입력 전체가 아니라 손잡이만 포인터를 받게 해야 둘 다 잡힌다.
            최솟값이 오른쪽 끝에 붙으면 위로 올려 다시 잡을 수 있게 한다. */}
        <input
          type="range" min={min} max={max} step={1} value={minVal}
          onChange={(e) => { const v = Number(e.target.value); if (v < maxVal) onMinChange(v); }}
          className={rangeInputClass}
          style={{ opacity: 0, zIndex: minVal > max - (max - min) * 0.1 ? 5 : 3, top: 0, left: 0 }}
        />
        <input
          type="range" min={min} max={max} step={1} value={maxVal}
          onChange={(e) => { const v = Number(e.target.value); if (v > minVal) onMaxChange(v); }}
          className={rangeInputClass}
          style={{ opacity: 0, zIndex: 4, top: 0, left: 0 }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span style={{ color: "#555", fontSize: 10 }}>{min}{unit}</span>
        <span style={{ color: "#555", fontSize: 10 }}>{max}{unit}</span>
      </div>
    </div>
  );
}

// ─── 코디 상세 모달 ───────────────────────────────────────────────────────────

export function OutfitDetailModal({
  item,
  favorited,
  onToggleFavorite,
  onClose,
}: {
  item: DailyProduct;
  favorited: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}) {
  useEscapeKey(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ fontFamily: "'Noto Sans KR', sans-serif", background: "rgba(0,0,0,0.55)" }}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative w-full max-w-[960px] mx-4 bg-background text-foreground flex shadow-2xl overflow-hidden"
        style={{ height: "min(92vh, 680px)" }}
      >
        {/* ── 왼쪽: 사진 ── */}
        <div className="relative hidden md:block w-[42%] shrink-0 bg-[#f0eeea] overflow-hidden">
          <img src={item.img} alt="코디" className="w-full h-full object-cover" />
        </div>

        {/* ── 오른쪽: 내용 ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-background">

          {/* 헤더 */}
          <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary text-primary-foreground flex items-center justify-center font-bold text-[11px] tracking-tight shrink-0">
                D.
              </div>
              <span className="text-[13px] font-semibold">{item.authorName}</span>
            </div>
            <button onClick={onClose} aria-label="닫기" className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <X size={18} />
            </button>
          </div>

          {/* 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>

            {/* 모바일에서는 왼쪽 사진 칸이 없으므로 여기에 코디 사진을 보여준다. */}
            <div className="md:hidden bg-[#f0eeea]" style={{ aspectRatio: "4/5" }}>
              <img src={item.img} alt="코디" className="w-full h-full object-cover" />
            </div>

            {/* 즐겨찾기 */}
            <div className="flex items-center justify-end px-5 pt-3 pb-1">
              <button type="button" onClick={onToggleFavorite} aria-label={favorited ? "코디 저장 취소" : "코디 저장"} aria-pressed={favorited} className="shrink-0 -m-1 p-2 transition-colors">
                <Heart size={18} className={favorited ? "fill-red-400 text-red-400" : "text-muted-foreground/50"} />
              </button>
            </div>

            {/* 신체 정보 */}
            {bodyInfo(item) && (
              <div className="px-5 py-3 border-b border-border">
                <span className="text-[12px] text-muted-foreground">모델 {bodyInfo(item)}</span>
              </div>
            )}

            {/* 이름 + 간단 설명 */}
            <div className="px-5 py-3.5 border-b border-border">
              <p className="text-[15px] font-bold leading-snug">{item.name}</p>
              {item.desc && <p className="text-[13px] text-foreground leading-relaxed mt-1.5">{item.desc}</p>}
            </div>

            <div className="px-5 py-3.5 border-b border-border">
              <OutfitFeedback outfitId={item.id} outfitName={item.name} />
            </div>

            {/* 코디 상품: 링크가 있으면 구매 페이지로 간다 */}
            <div className="px-5 pt-4 pb-4">
              <p className="text-[13px] font-bold mb-1">코디 상품 {item.items.length}개</p>

              <div className="divide-y divide-border">
                {item.items.map((outfitItem) => (
                  <div key={outfitItem.id} className="flex items-center gap-3 py-3.5">
                    <span className="shrink-0 text-[10px] font-bold bg-secondary border border-border px-1.5 py-0.5 text-muted-foreground">{ITEM_TYPE_LABELS[outfitItem.type]}</span>
                    <p className="flex-1 min-w-0 text-[13px] font-medium leading-snug">{outfitItem.name}</p>
                    {outfitItem.link && (
                      <a href={outfitItem.link} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1 border border-border text-[11px] px-2.5 py-1.5 hover:bg-secondary transition-colors text-muted-foreground" style={{ borderRadius: "3px" }}>
                        구매 링크 <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 코디 피드 섹션 ───────────────────────────────────────────────────────────

const H_MIN = 150, H_MAX = 200, W_MIN = 40, W_MAX = 110;

// 더보기를 누르기 전에는 6개씩 두 줄만 보여준다.
const COLLAPSED_COUNT = 12;

export function OutfitFeedSection({
  outfits,
  loadError,
  hasMore,
  onLoadMore,
  bookmarkedIds,
  onToggleBookmark,
  onAddOutfit,
  onSelectOutfit,
  isLoggedIn,
  onRequireLogin,
}: {
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  outfits: DailyProduct[];
  loadError: string;
  hasMore: boolean;
  onLoadMore: () => void;
  bookmarkedIds: string[];
  onToggleBookmark: (outfitId: string) => void;
  onAddOutfit: (input: OutfitInput) => Promise<void>;
  onSelectOutfit: (outfit: DailyProduct) => void;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);

  // ── 필터 상태 ──
  const [bodyPanelOpen, setBodyPanelOpen] = useState(false);
  const [heightMin, setHeightMin] = useState(H_MIN);
  const [heightMax, setHeightMax] = useState(H_MAX);
  const [weightMin, setWeightMin] = useState(W_MIN);
  const [weightMax, setWeightMax] = useState(W_MAX);
  const [expanded, setExpanded] = useState(false);

  const heightActive = heightMin > H_MIN || heightMax < H_MAX;
  const weightActive = weightMin > W_MIN || weightMax < W_MAX;
  const bodyActive = heightActive || weightActive;
  const anyFilter = bodyActive;

  const resetAll = () => {
    setHeightMin(H_MIN); setHeightMax(H_MAX);
    setWeightMin(W_MIN); setWeightMax(W_MAX);
    setBodyPanelOpen(false);
  };

  const inRange = (value: string, min: number, max: number) => {
    const n = parseInt(value);
    return !isNaN(n) && n >= min && n <= max;
  };

  // 서버가 최신순으로 내려준다.
  const filtered = outfits
    .filter((o) => !heightActive || inRange(o.height, heightMin, heightMax))
    .filter((o) => !weightActive || inRange(o.weight, weightMin, weightMax));

  const collapsed = !expanded && filtered.length > COLLAPSED_COUNT;
  const visible = collapsed ? filtered.slice(0, COLLAPSED_COUNT) : filtered;

  const handleMore = () => {
    if (collapsed) setExpanded(true);
    else if (hasMore) onLoadMore();
    else setExpanded(false);
  };

  const toggleStyle = (active: boolean, idleBorder: string) => ({
    background: active ? "white" : "transparent",
    color: active ? "#111" : "#777",
    borderColor: active ? "white" : idleBorder,
    borderRadius: "4px",
  });

  return (
    <section id="outfit-feed" style={{ background: "#141312" }} className="py-14 px-4 md:px-8 scroll-mt-16">
      {uploadOpen && isLoggedIn && (
        <OutfitFeedUploadModal
          onClose={() => setUploadOpen(false)}
          onSubmit={onAddOutfit}
        />
      )}
      <div className="max-w-[1400px] mx-auto">
        {/* 헤더 */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase mb-2" style={{ color: "#6b6762", fontFamily: "'DM Mono', monospace" }}>
              D.aily Looks
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
              오늘 뭐 입지,<br className="md:hidden" /> 코디로 찾기
            </h2>
          </div>
          <button
            onClick={() => { if (isLoggedIn) setUploadOpen(true); else onRequireLogin(); }}
            className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 transition-opacity hover:opacity-80 shrink-0"
            style={{ background: "white", color: "#111", borderRadius: "4px" }}
          >
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
            코디 추가하기
          </button>
        </div>

        {/* ── 필터 바 ── */}
        <div className="mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={resetAll}
              className="text-xs font-medium px-4 py-2 border transition-all"
              style={toggleStyle(!anyFilter, "#333")}
            >
              전체
            </button>

            <button
              onClick={() => setBodyPanelOpen(!bodyPanelOpen)}
              className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 border transition-all"
              style={toggleStyle(bodyActive || bodyPanelOpen, "#333")}
            >
              키/몸무게
              {bodyActive && (
                <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "#222", color: "white" }}>
                  !
                </span>
              )}
              <svg viewBox="0 0 10 6" width="9" height="6" fill="none">
                <path d={bodyPanelOpen ? "M1 5l4-4 4 4" : "M1 1l4 4 4-4"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* 확장 패널 */}
          {bodyPanelOpen && (
            <div className="mt-2 p-4 border" style={{ borderColor: "#2e2c2a", background: "#1a1917", borderRadius: "6px" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: "#666" }}>키 (cm)</p>
                    <DualRangeSlider
                      min={H_MIN} max={H_MAX} minVal={heightMin} maxVal={heightMax}
                      onMinChange={setHeightMin} onMaxChange={setHeightMax} unit="cm"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: "#666" }}>몸무게 (kg)</p>
                    <DualRangeSlider
                      min={W_MIN} max={W_MAX} minVal={weightMin} maxVal={weightMax}
                      onMinChange={setWeightMin} onMaxChange={setWeightMax} unit="kg"
                    />
                  </div>
                </div>
            </div>
          )}
        </div>

        {/* ── 정렬 + 결과 수 ── */}
        <div className="mb-6 pt-3">
          <p style={{ color: "#555", fontSize: 12 }}>{filtered.length}개 코디</p>
        </div>

        {/* ── 코디 그리드 ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {visible.map((item) => {
            const saved = bookmarkedIds.includes(item.id);

            return (
              <div key={item.id} className="group cursor-pointer" {...clickable(() => onSelectOutfit(item))}>
                {/* 썸네일 */}
                <div className="relative overflow-hidden mb-3" style={{ borderRadius: "8px", aspectRatio: "3/4" }}>
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* 코디 저장 */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleBookmark(item.id); }}
                    className="absolute top-1 right-1 p-2.5 opacity-80 hover:opacity-100 transition-opacity"
                    aria-label={saved ? `${item.name} 저장 취소` : `${item.name} 저장`}
                    aria-pressed={saved}
                  >
                    <Heart size={16} className={saved ? "fill-red-400 text-red-400" : "text-white"} />
                  </button>

                </div>

                {/* 텍스트 */}
                <p className="text-sm font-semibold text-white leading-snug mb-1 group-hover:text-white/80 transition-colors">
                  {item.name}
                </p>
                <p className="text-[11px]" style={{ color: "#5a5754" }}>
                  구성 {item.items.length}개
                  {bodyInfo(item) && <span className="ml-2">{bodyInfo(item)}</span>}
                </p>
              </div>
            );
          })}
        </div>

        {(collapsed || expanded || hasMore) && filtered.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={handleMore}
              className="text-xs font-medium px-10 py-3 border border-[#333] text-[#aaa] hover:border-white hover:text-white transition-colors"
              style={{ borderRadius: "4px" }}
            >
              {collapsed || hasMore ? "더보기" : "접기"}
            </button>
          </div>
        )}

        {loadError && <p className="py-16 text-center text-white/40 text-sm">{loadError}</p>}

        {!loadError && filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <p className="text-white/30 text-sm">{outfits.length === 0 ? "아직 공개된 코디가 없습니다" : "조건에 맞는 코디가 없습니다"}</p>
            {anyFilter && <button onClick={resetAll} className="text-xs underline underline-offset-2" style={{ color: "#666" }}>필터 초기화</button>}
          </div>
        )}
      </div>
    </section>
  );
}
