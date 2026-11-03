import { useRef, useState } from "react";
import type React from "react";
import { ChevronLeft, Heart, X } from "lucide-react";
import type { DailyProduct, Product, ShopPrice } from "../app/App";
import { styleLabels } from "./FooterPage";
import { OutfitFeedback } from "../features/style/OutfitFeedback";
import { clickable } from "../shared/a11y";
import { bodyInfoError } from "../shared/api/outfits";
import { errorMessage } from "../shared/api/storage";
import { uploadImage } from "../shared/api/userData";

// ─── 코디 상세 (전체 페이지) ──────────────────────────────────────────────────

function CodiDetailPage({
  item,
  style,
  catalogProducts,
  getShopPrices,
  favorited,
  onToggleFavorite,
  onSelectProduct,
  onBack,
}: {
  item: DailyProduct;
  style: string;
  catalogProducts: Product[];
  getShopPrices: (product: Product) => ShopPrice[];
  favorited: boolean;
  onToggleFavorite: () => void;
  onSelectProduct: (product: Product) => void;
  onBack: () => void;
}) {
  const picked = catalogProducts.filter((p) => item.productIds.includes(p.id));

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft size={18} /> 코디 목록으로 돌아가기
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* ── 왼쪽: 사진 ── */}
          <div className="relative bg-[#f0eeea] overflow-hidden" style={{ aspectRatio: "3/4" }}>
            {item.img ? (
              <img src={item.img} alt="코디" className="w-full h-full object-cover" />
            ) : picked.length >= 2 ? (
              <div className="w-full h-full grid grid-cols-2 gap-px bg-border">
                {picked.slice(0, 4).map((p) => (
                  <div key={p.id} className="overflow-hidden bg-secondary">
                    <img src={p.img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : picked.length === 1 ? (
              <img src={picked[0].img} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground/40 text-sm">이미지 없음</span>
              </div>
            )}
          </div>

          {/* ── 오른쪽: 내용 ── */}
          <div className="flex flex-col">
            {/* 브랜드 행 + 즐겨찾기 */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary text-primary-foreground flex items-center justify-center font-bold text-[11px] tracking-tight shrink-0">
                  D.
                </div>
                <span className="text-[15px] font-semibold">{style}</span>
              </div>
              <button type="button" onClick={onToggleFavorite} aria-label={favorited ? "코디 저장 취소" : "코디 저장"} aria-pressed={favorited} className="shrink-0 p-2 transition-colors">
                <Heart size={20} className={favorited ? "fill-red-400 text-red-400" : "text-muted-foreground/50"} />
              </button>
            </div>

            <h1 className="pt-4 text-xl font-bold leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</h1>

            {/* 카테고리 태그 */}
            <div className="flex flex-wrap gap-1.5 pt-4">
              <span className="text-[11px] px-2.5 py-1 border border-border text-muted-foreground" style={{ borderRadius: "20px" }}>
                {style}
              </span>
              {item.seasons.map((s) => (
                <span key={s} className="text-[11px] px-2.5 py-1 border border-border text-muted-foreground" style={{ borderRadius: "20px" }}>
                  {s}
                </span>
              ))}
            </div>

            {/* 신체 정보 */}
            {(item.height || item.weight) && (
              <p className="text-[12px] text-muted-foreground pt-3">
                모델 {[item.height && `${item.height}cm`, item.weight && `${item.weight}kg`].filter(Boolean).join(" · ")}
              </p>
            )}

            {/* 간단 설명 */}
            {item.desc && (
              <p className="text-[13px] text-foreground leading-relaxed pt-3">{item.desc}</p>
            )}

            <div className="pt-5">
              <OutfitFeedback outfitId={item.id} outfitName={item.name} />
            </div>

            {/* 코디 상품: 누르면 그 상품 상세로 간다 */}
            <div className="pt-6">
              <p className="text-[13px] font-bold mb-1">코디 상품 {picked.length}개</p>

              <div className="space-y-0 divide-y divide-border">
                {picked.map((p) => {
                  const cheapest = getShopPrices(p)[0];
                  const discountPct = p.originalPrice ? Math.round((1 - cheapest.price / p.originalPrice) * 100) : 0;
                  const onSale = discountPct > 0;
                  return (
                    <div key={p.id} {...clickable(() => onSelectProduct(p))} className="group flex items-start gap-3 py-3.5 cursor-pointer">
                      {/* 썸네일 */}
                      <div className="w-[60px] h-[74px] overflow-hidden shrink-0 bg-secondary">
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                      </div>

                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold bg-secondary border border-border px-1.5 py-0.5 text-muted-foreground">{p.category}</span>
                        </div>
                        <p className="text-[13px] font-medium leading-snug mb-1.5 group-hover:underline underline-offset-2">{p.name}</p>
                        <div className="flex items-center gap-1.5 text-[13px] font-bold" style={onSale ? { color: "#e55c2d" } : undefined}>
                          {onSale && <span>{discountPct}%</span>}
                          <span>{cheapest.price.toLocaleString()}원</span>
                        </div>
                      </div>

                      <span
                        className="shrink-0 border border-border text-[11px] px-2.5 py-1.5 group-hover:bg-secondary transition-colors text-muted-foreground mt-auto self-end mb-1"
                        style={{ borderRadius: "3px" }}
                      >
                        상품 상세보기
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 코디 등록 + 목록 ─────────────────────────────────────────────────────────

export function DailyBrandView({
  style,
  products: ownProducts,
  catalogProducts,
  getShopPrices,
  bookmarkedIds,
  onToggleBookmark,
  onAddProduct,
  onSelectProduct,
  onClose,
  isLoggedIn,
  onRequireLogin,
}: {
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  bookmarkedIds: number[];
  onToggleBookmark: (outfitId: number) => void;
  style: string;
  products: DailyProduct[];
  catalogProducts: Product[];
  getShopPrices: (product: Product) => ShopPrice[];
  onAddProduct: (p: DailyProduct) => Promise<void>;
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
}) {
  const listed = ownProducts.filter((p) => p.style === style);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOutfit, setDetailOutfit] = useState<DailyProduct | null>(null);

  const emptyForm = { name: "", img: "", height: "", weight: "", productIds: [] as number[], desc: "", seasons: [] as string[] };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSeason = (s: string) =>
    setForm((f) => ({
      ...f,
      seasons: f.seasons.includes(s) ? f.seasons.filter((x) => x !== s) : [...f.seasons, s],
    }));

  // 상품은 카테고리와 상관없이 원하는 만큼 고를 수 있다. 다시 누르면 선택이 풀린다.
  const toggleProduct = (id: number) =>
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id) ? f.productIds.filter((x) => x !== id) : [...f.productIds, id],
    }));

  const attachImage = async (file: File) => {
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, img: url }));
    } catch (err) {
      setErrors((er) => ({ ...er, submit: errorMessage(err) }));
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void attachImage(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    void attachImage(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "코디 이름을 입력해주세요.";
    if (form.productIds.length === 0) e.products = "상품을 1개 이상 선택해주세요.";
    const bodyError = bodyInfoError(form.height, form.weight);
    if (bodyError) e.body = bodyError;
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      await onAddProduct({
        id: 0, // 저장 시 outfit_id가 부여된다
        name: form.name.trim(),
        style,
        img: form.img,
        height: form.height,
        weight: form.weight,
        productIds: form.productIds,
        desc: form.desc.trim(),
        seasons: form.seasons,
      });
    } catch (err) {
      setErrors({ submit: errorMessage(err) });
      return;
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setForm(emptyForm);
      setErrors({});
      setSaveSuccess(false);
      setModalOpen(false);
    }, 900);
  };

  // 코디 등록은 회원 전용이다. 비회원이면 등록 화면 대신 로그인 창을 띄운다.
  const openModal = () => {
    if (!isLoggedIn) { onRequireLogin(); return; }
    setForm(emptyForm); setErrors({}); setSaveSuccess(false); setModalOpen(true);
  };

  const meta = styleLabels[style] ?? { eng: style, desc: "" };

  if (detailOutfit) {
    return (
      <CodiDetailPage
        item={detailOutfit}
        style={style}
        catalogProducts={catalogProducts}
        getShopPrices={getShopPrices}
        favorited={bookmarkedIds.includes(detailOutfit.id)}
        onToggleFavorite={() => onToggleBookmark(detailOutfit.id)}
        onSelectProduct={onSelectProduct}
        onBack={() => setDetailOutfit(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 md:px-8 h-14 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={16} /> 돌아가기
        </button>
        <span className="text-sm font-bold tracking-wide">D.aily 스타일 코디</span>
        <button
          onClick={openModal}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 hover:opacity-90 transition-opacity"
        >
          + 코디 등록
        </button>
      </div>

      {/* Title */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-10 pb-6">
        <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase mb-2">{meta.eng}</p>
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{style}</h1>
        <p className="text-sm text-muted-foreground">{meta.desc}</p>
      </div>

      {/* Outfit grid */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pb-16">
        {listed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 border-2 border-dashed border-border flex items-center justify-center mb-4 text-muted-foreground">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14" /></svg>
            </div>
            <p className="text-sm font-medium mb-1">등록된 코디가 없습니다</p>
            <p className="text-xs text-muted-foreground mb-5">코디 등록 버튼으로 첫 코디를 추가해보세요.</p>
            <button onClick={openModal} className="bg-primary text-primary-foreground text-xs font-bold px-6 py-2.5 hover:opacity-90 transition-opacity">
              + 코디 등록하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listed.map((item) => {
              const picked = catalogProducts.filter((p) => item.productIds.includes(p.id));
              const totalPrice = picked.reduce((sum, p) => sum + getShopPrices(p)[0].price, 0);
              return (
                <div key={item.id} {...clickable(() => setDetailOutfit(item))} className="border border-border bg-background group hover:border-primary transition-colors cursor-pointer">
                  {/* Outfit photo */}
                  <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
                    {item.img ? (
                      <img src={item.img} alt="코디" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {picked.length >= 2 ? (
                          <div className="w-full h-full grid grid-cols-2 gap-px bg-border">
                            {picked.slice(0, 4).map((p) => (
                              <div key={p.id} className="bg-secondary overflow-hidden">
                                <img src={p.img} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        ) : picked.length === 1 ? (
                          <img src={picked[0].img} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-muted-foreground/30 text-xs">이미지 없음</span>
                        )}
                      </div>
                    )}
                    {/* Style badge */}
                    <span className="absolute top-3 left-3 text-[9px] font-bold tracking-widest bg-primary text-primary-foreground px-2 py-0.5">{style}</span>
                    {/* Season badges */}
                    {item.seasons.length > 0 && (
                      <div className="absolute top-3 right-3 flex gap-1">
                        {item.seasons.map((s) => (
                          <span key={s} className="text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 backdrop-blur-sm">{s}</span>
                        ))}
                      </div>
                    )}
                    {/* Body info */}
                    {(item.height || item.weight) && (
                      <div className="absolute bottom-3 left-3 bg-black/55 text-white text-[10px] px-2.5 py-1 backdrop-blur-sm flex items-center gap-2">
                        {item.height && <span>{item.height}cm</span>}
                        {item.height && item.weight && <span className="opacity-40">·</span>}
                        {item.weight && <span>{item.weight}kg</span>}
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <p className="text-sm font-bold mb-1.5 truncate">{item.name}</p>
                    {item.desc && (
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{item.desc}</p>
                    )}
                    {/* Product strip */}
                    {picked.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {picked.map((p) => (
                          <div key={p.id} className="flex items-center gap-1.5 bg-secondary px-2 py-1" style={{ borderRadius: "3px" }}>
                            <div className="w-5 h-5 overflow-hidden shrink-0" style={{ borderRadius: "2px" }}>
                              <img src={p.img} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-[10px] text-muted-foreground">{picked.length}개 상품</span>
                      {totalPrice > 0 && (
                        <span className="text-xs font-bold text-accent">{totalPrice.toLocaleString()}원~</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Add card */}
            <button
              onClick={openModal}
              className="aspect-[3/4] border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-xs font-medium">코디 추가</span>
            </button>
          </div>
        )}
      </div>

      {/* ── 코디 등록 — 전체화면 2컬럼 ── */}
      {modalOpen && isLoggedIn && (
        <div
          className="fixed inset-0 z-50 flex flex-col md:flex-row bg-background"
          style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
        >
          {/* ══ 성공 오버레이 ══ */}
          {saveSuccess && (
            <div className="absolute inset-0 z-30 bg-background flex flex-col items-center justify-center gap-5">
              <div className="w-20 h-20 bg-primary flex items-center justify-center text-primary-foreground" style={{ borderRadius: "50%" }}>
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold mb-1">코디가 등록되었어요!</p>
                <p className="text-sm text-muted-foreground">{style} 스타일에 추가됐습니다</p>
              </div>
            </div>
          )}

          {/* ══ 왼쪽: 사진 패널 ══ */}
          <div className="relative md:w-[42%] shrink-0 flex flex-col" style={{ background: "#111" }}>
            {/* 상단 바 */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-5 pb-3">
              <button
                onClick={() => { setModalOpen(false); setForm(emptyForm); setErrors({}); }}
                className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
              >
                <X size={18} />
                <span className="hidden md:inline text-xs font-medium tracking-wide">닫기</span>
              </button>
              <span className="text-white text-[11px] font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                D<span style={{ color: "#C4A97B" }}>.</span>aily
              </span>
              <div className="w-10" />
            </div>

            {/* 사진 영역 */}
            <div
              className="flex-1 flex items-center justify-center cursor-pointer group min-h-[260px] md:min-h-0"
              style={{ aspectRatio: "unset" }}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {form.img ? (
                <div className="relative w-full h-full">
                  <img src={form.img} alt="코디 이미지" className="w-full h-full object-cover" style={{ maxHeight: "calc(100vh - 0px)" }} />
                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-white text-xs font-medium">
                      사진 변경
                    </div>
                  </div>
                  {/* 삭제 버튼 */}
                  <button
                    type="button"
                    aria-label="사진 삭제"
                    className="absolute top-14 right-4 bg-black/50 text-white p-2 hover:bg-black/80 transition-colors"
                    style={{ borderRadius: "4px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm((f) => ({ ...f, img: "" }));
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-5 px-8 py-16 text-center w-full">
                  {/* 카메라 아이콘 */}
                  <div className="w-20 h-20 border-2 border-white/20 flex items-center justify-center group-hover:border-white/50 transition-colors" style={{ borderRadius: "50%" }}>
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">사진 추가</p>
                    <p className="text-white/35 text-[11px] leading-relaxed">
                      클릭 또는 드래그 앤 드롭<br />JPG · PNG · WEBP
                    </p>
                  </div>
                  {/* 업로드 버튼 */}
                  <div className="border border-white/25 text-white/70 text-xs px-5 py-2 group-hover:border-white/60 group-hover:text-white/90 transition-colors" style={{ borderRadius: "2px" }}>
                    파일 선택
                  </div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            {/* 하단: 스타일 뱃지 */}
            <div className="absolute bottom-5 left-5 flex gap-2">
              <span className="text-[10px] font-bold tracking-widest text-white/70 bg-white/10 backdrop-blur-sm px-3 py-1 uppercase" style={{ borderRadius: "2px" }}>
                {style}
              </span>
              {form.seasons.map((s) => (
                <span key={s} className="text-[10px] font-bold text-white/60 bg-white/10 backdrop-blur-sm px-2.5 py-1" style={{ borderRadius: "2px" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* ══ 오른쪽: 폼 패널 ══ */}
          <div className="flex-1 flex flex-col bg-background border-l border-border overflow-hidden">
            {/* 폼 헤더 */}
            <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border">
              <p className="text-[10px] font-bold tracking-[0.22em] text-muted-foreground uppercase mb-0.5">New Look</p>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>코디 등록</h2>
            </div>

            {/* 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto">
              {/* ── 코디 이름 ── */}
              <div className="px-6 py-5 border-b border-border">
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-muted-foreground mb-3">
                  코디 이름
                  <span className="ml-1 text-destructive">*</span>
                </p>
                <input
                  type="text"
                  className="w-full border-b border-border bg-transparent pb-2 text-sm outline-none focus:border-primary transition-colors"
                  placeholder="예) 여유로운 린넨 데일리룩"
                  value={form.name}
                  onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); if (errors.name) setErrors((er) => ({ ...er, name: "" })); }}
                  maxLength={40}
                />
                {errors.name && <p className="text-xs text-destructive mt-2">{errors.name}</p>}
              </div>

              {/* ── 코디 설명 ── */}
              <div className="px-6 py-5 border-b border-border">
                <textarea
                  rows={3}
                  className="w-full text-sm bg-transparent outline-none resize-none text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
                  placeholder="이 코디에 대해 소개해주세요. 어울리는 상황, 스타일 포인트 등..."
                  value={form.desc}
                  onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                  maxLength={200}
                />
                <p className="text-[10px] text-muted-foreground/50 text-right mt-1">{form.desc.length}/200</p>
              </div>

              {/* ── 착용 정보 ── */}
              <div className="px-6 py-5 border-b border-border">
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-muted-foreground mb-3">착용 정보</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground mb-1.5">키</p>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full border-b border-border bg-transparent pb-2 text-sm outline-none focus:border-primary transition-colors pr-8"
                        placeholder="170"
                        min={0}
                        aria-label="키"
                        value={form.height}
                        onChange={(e) => { setForm((f) => ({ ...f, height: e.target.value })); if (errors.body) setErrors((er) => ({ ...er, body: "" })); }}
                      />
                      <span className="absolute right-0 bottom-2 text-xs text-muted-foreground">cm</span>
                    </div>
                  </div>
                  <div className="w-px bg-border self-stretch mx-1" />
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground mb-1.5">몸무게</p>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full border-b border-border bg-transparent pb-2 text-sm outline-none focus:border-primary transition-colors pr-8"
                        placeholder="60"
                        min={0}
                        max={999}
                        aria-label="몸무게"
                        value={form.weight}
                        onChange={(e) => { setForm((f) => ({ ...f, weight: e.target.value })); if (errors.body) setErrors((er) => ({ ...er, body: "" })); }}
                      />
                      <span className="absolute right-0 bottom-2 text-xs text-muted-foreground">kg</span>
                    </div>
                  </div>
                </div>
                {errors.body && <p className="text-xs text-destructive mt-2">{errors.body}</p>}
              </div>

              {/* ── 계절 ── */}
              <div className="px-6 py-5 border-b border-border">
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-muted-foreground mb-3">계절</p>
                <div className="flex gap-2">
                  {[
                    { label: "봄", color: "bg-pink-50 text-pink-600 border-pink-200", active: "bg-pink-500 text-white border-pink-500" },
                    { label: "여름", color: "bg-sky-50 text-sky-600 border-sky-200", active: "bg-sky-500 text-white border-sky-500" },
                    { label: "가을", color: "bg-amber-50 text-amber-600 border-amber-200", active: "bg-amber-500 text-white border-amber-500" },
                    { label: "겨울", color: "bg-slate-50 text-slate-600 border-slate-200", active: "bg-slate-600 text-white border-slate-600" },
                  ].map(({ label, color, active }) => {
                    const sel = form.seasons.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleSeason(label)}
                        className={`flex-1 py-2.5 text-xs font-bold border transition-all ${sel ? active : `${color} hover:opacity-80`}`}
                        style={{ borderRadius: "3px" }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── 상품 연결 ── */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-muted-foreground">
                    상품 연결
                    <span className="ml-1 text-destructive">*</span>
                  </p>
                  {form.productIds.length > 0 && (
                    <span className="text-[11px] text-accent font-bold">{form.productIds.length}개 선택됨</span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">원하는 상품을 모두 고를 수 있어요. 다시 누르면 선택이 해제돼요.</p>
                {errors.products && <p className="text-xs text-destructive mb-2">{errors.products}</p>}

                {/* 선택된 상품 칩 */}
                {form.productIds.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {form.productIds.flatMap((id) => catalogProducts.find((p) => p.id === id) ?? []).map((p) => (
                      <div key={p.id} className="flex items-center gap-1.5 bg-secondary border border-border pl-1 pr-2 py-1" style={{ borderRadius: "3px" }}>
                        <div className="w-7 h-7 overflow-hidden shrink-0" style={{ borderRadius: "2px" }}>
                          <img src={p.img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] font-medium max-w-[90px] truncate">{p.name}</span>
                        <button type="button" onClick={() => toggleProduct(p.id)} aria-label={`${p.name} 선택 해제`} className="text-muted-foreground hover:text-foreground transition-colors ml-0.5">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 상품 가로 스크롤 */}
                <div className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                  {catalogProducts.map((p) => {
                    const sel = form.productIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { toggleProduct(p.id); if (errors.products) setErrors((er) => ({ ...er, products: "" })); }}
                        className={`shrink-0 w-[90px] text-left transition-all group ${sel ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                      >
                        <div className={`relative aspect-[3/4] overflow-hidden mb-1.5 transition-all ${sel ? "ring-2 ring-primary ring-offset-1" : ""}`} style={{ borderRadius: "4px" }}>
                          <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          {sel && (
                            <div className="absolute inset-0 bg-primary/20 flex items-start justify-end p-1.5">
                              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                                  <path d="M2 6l3 3 5-5" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-[9px] font-bold tracking-wider text-muted-foreground truncate">{p.brand}</p>
                        <p className="text-[10px] font-medium truncate leading-snug">{p.name}</p>
                        <p className="text-[10px] font-bold text-accent">{getShopPrices(p)[0].price.toLocaleString()}원~</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="shrink-0 px-6 py-4 border-t border-border bg-background">
              {errors.submit && <p className="text-xs text-destructive mb-2">{errors.submit}</p>}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saveSuccess}
                className="w-full bg-primary text-primary-foreground py-3.5 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saveSuccess ? "✓ 등록 완료" : "코디 등록하기"}
              </button>
              <button
                type="button"
                onClick={() => { setModalOpen(false); setForm(emptyForm); setErrors({}); }}
                className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
