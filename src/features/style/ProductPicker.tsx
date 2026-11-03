import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { ITEMS_MAX, ITEM_TYPE_LABELS, searchOutfitProducts, type OutfitItemInput } from "../../shared/api/outfits";
import { errorMessage } from "../../shared/api/storage";
import type { OutfitItemType, ProductSummary } from "../../shared/api/types";

export type PickedItem = OutfitItemInput & { key: string; img?: string };

const ITEM_TYPES = Object.keys(ITEM_TYPE_LABELS) as OutfitItemType[];
const HTTP_URL_PATTERN = /^https?:\/\/\S+$/;

const inputClass = "min-w-0 flex-1 bg-transparent border-b px-0 py-2 text-sm text-white outline-none placeholder:text-white/20";
const inputStyle = { borderColor: "#333" };

// 가격을 모르면 0원이 아니라 "가격 정보 없음"으로 보여준다.
function priceLabel(product: ProductSummary) {
  const offer = product.offers[0];
  if (!offer) return "판매 정보 없음";
  if (offer.isSoldOut) return "품절";
  return offer.price === null ? "가격 정보 없음" : `${offer.price.toLocaleString()}원~`;
}

// 코디 등록 화면의 상품 연결. 카탈로그 검색 결과에서 고르거나 이름과 링크를 직접 입력한다.
export function ProductPicker({ items, onChange }: { items: PickedItem[]; onChange: (items: PickedItem[]) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualLink, setManualLink] = useState("");
  const [manualError, setManualError] = useState("");
  const full = items.length >= ITEMS_MAX;

  const load = useCallback(async (keyword: string, nextPage: number) => {
    setLoading(true);
    setError("");
    try {
      const result = await searchOutfitProducts(keyword, nextPage);
      setResults((prev) => (nextPage === 1 ? result.items : [...prev, ...result.items]));
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(errorMessage(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    searchOutfitProducts("", 1)
      .then((result) => { if (active) { setResults(result.items); setHasMore(result.hasMore); } })
      .catch((err) => { if (active) setError(errorMessage(err)); });
    return () => { active = false; };
  }, []);

  const toggleProduct = (product: ProductSummary) => {
    if (items.some((item) => item.productId === product.id)) {
      onChange(items.filter((item) => item.productId !== product.id));
      return;
    }
    if (full) return;
    onChange([...items, {
      key: product.id,
      type: "ETC",
      name: product.name,
      productId: product.id,
      offerId: product.offers[0]?.id,
      img: product.images[0]?.imageUrl,
    }]);
  };

  const addManual = () => {
    const name = manualName.trim();
    const link = manualLink.trim();
    if (!name) { setManualError("아이템 이름을 입력해주세요."); return; }
    if (link && !HTTP_URL_PATTERN.test(link)) { setManualError("링크는 http:// 또는 https://로 시작해야 합니다."); return; }
    onChange([...items, { key: crypto.randomUUID(), type: "ETC", name, link: link || undefined }]);
    setManualName("");
    setManualLink("");
    setManualError("");
  };

  return (
    <div>
      {items.length > 0 && (
        <div className="mb-4 space-y-2">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-2 border p-1.5" style={{ borderColor: "#333", background: "#111", borderRadius: "4px" }}>
              {item.img && <img src={item.img} alt="" className="h-8 w-8 shrink-0 object-cover" style={{ borderRadius: "3px" }} />}
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-white">{item.name}</span>
              <select
                aria-label={`${item.name} 종류`}
                value={item.type}
                onChange={(e) => onChange(items.map((i) => (i.key === item.key ? { ...i, type: e.target.value as OutfitItemType } : i)))}
                className="shrink-0 border px-1.5 py-1 text-[11px] text-white outline-none"
                style={{ borderColor: "#333", background: "#1a1917", borderRadius: "3px" }}
              >
                {ITEM_TYPES.map((type) => <option key={type} value={type}>{ITEM_TYPE_LABELS[type]}</option>)}
              </select>
              <button type="button" onClick={() => onChange(items.filter((i) => i.key !== item.key))} aria-label={`${item.name} 삭제`} className="shrink-0 p-1 text-white/50 transition-colors hover:text-white">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mb-3 flex gap-2">
        <input
          className={inputClass}
          style={inputStyle}
          aria-label="상품 검색"
          placeholder="상품명으로 검색"
          maxLength={100}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void load(query.trim(), 1); } }}
        />
        <button type="button" onClick={() => void load(query.trim(), 1)} disabled={loading} className="shrink-0 border px-3 text-xs font-medium text-white/70 transition-colors hover:text-white disabled:opacity-50" style={{ borderColor: "#333", borderRadius: "4px" }}>
          검색
        </button>
      </div>

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
      {!error && !loading && results.length === 0 && <p className="mb-2 text-[11px]" style={{ color: "#777" }}>검색된 상품이 없어요. 아래에서 직접 추가할 수 있어요.</p>}

      <div className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {results.map((product) => {
          const selected = items.some((item) => item.productId === product.id);
          return (
            <button
              key={product.id}
              type="button"
              aria-pressed={selected}
              onClick={() => toggleProduct(product)}
              className={`w-[84px] shrink-0 text-left transition-opacity ${selected ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
            >
              <div className="mb-1.5 overflow-hidden border-2 bg-[#111]" style={{ aspectRatio: "3/4", borderRadius: "6px", borderColor: selected ? "white" : "transparent" }}>
                {product.images[0] && <img src={product.images[0].imageUrl} alt={product.name} className="h-full w-full object-cover" />}
              </div>
              <p className="truncate text-[10px] font-medium leading-snug text-white">{product.name}</p>
              <p className="truncate text-[10px]" style={{ color: "#777" }}>{priceLabel(product)}</p>
            </button>
          );
        })}
        {hasMore && (
          <button type="button" onClick={() => void load(query.trim(), page + 1)} disabled={loading} className="w-[84px] shrink-0 border text-[11px] text-white/70 transition-colors hover:text-white disabled:opacity-50" style={{ borderColor: "#333", borderRadius: "6px" }}>
            더 보기
          </button>
        )}
      </div>

      <div className="mt-3">
        <p className="mb-1 text-[10px]" style={{ color: "#777" }}>카탈로그에 없는 아이템은 직접 추가하세요.</p>
        <div className="flex gap-2">
          <input className={inputClass} style={inputStyle} aria-label="아이템 이름" placeholder="아이템 이름" maxLength={200} value={manualName} onChange={(e) => { setManualName(e.target.value); setManualError(""); }} />
          <input className={inputClass} style={inputStyle} aria-label="아이템 링크" placeholder="링크 (선택)" value={manualLink} onChange={(e) => { setManualLink(e.target.value); setManualError(""); }} />
          <button type="button" onClick={addManual} disabled={full} className="shrink-0 border px-3 text-xs font-medium text-white/70 transition-colors hover:text-white disabled:opacity-50" style={{ borderColor: "#333", borderRadius: "4px" }}>
            추가
          </button>
        </div>
        {manualError && <p className="mt-1.5 text-xs text-red-400">{manualError}</p>}
        {full && <p className="mt-1.5 text-xs" style={{ color: "#777" }}>아이템은 최대 {ITEMS_MAX}개까지 담을 수 있어요.</p>}
      </div>
    </div>
  );
}
