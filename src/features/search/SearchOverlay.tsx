import { useState, useRef, useEffect } from "react";
import { Search, X, Clock, TrendingUp as Trending, Tag } from "lucide-react";
import type { Product, ShopPrice } from "../../app/App";
const recentSearches = ["오버핏 셔츠", "코트", "데님 팬츠", "슬랙스"];
const popularSearches = ["캐주얼룩", "오피스룩", "와이드팬츠", "린넨셔츠", "미니멀코디"];
export function SearchOverlay({
  onClose,
  onSelectProduct,
  products,
  getShopPrices,
  fmt,
}: {
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  products: Product[];
  getShopPrices: (product: Product) => ShopPrice[];
  fmt: (value: number) => string;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = query.trim().length > 0
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.category.includes(query) ||
        p.subtitle.includes(query)
      )
    : [];

  const handleSelect = (p: Product) => {
    onSelectProduct(p);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-8" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-background w-full max-w-6xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Input row */}
        <div className="flex items-center gap-4 px-5 md:px-8 py-4 border-b border-border">
          <div className="hidden sm:block shrink-0">
            <p className="text-[10px] font-bold tracking-[0.28em] text-muted-foreground uppercase">D.aily archive</p>
            <p className="text-sm font-bold mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>Fashion Collector</p>
          </div>
          <div className="flex items-center gap-2 flex-1 border-b border-border focus-within:border-primary transition-colors py-2">
            <Search size={17} className="text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="찾고 싶은 스타일, 브랜드, 아이템"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          )}
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-2 shrink-0">
            취소
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 md:px-8 py-7">
          {query.trim() === "" ? (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.28em] text-accent uppercase mb-2">Curated discovery</p>
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>오늘의 스타일 아카이브</h2>
                  <p className="text-sm text-muted-foreground mt-2">무드에서 시작해, 마음에 드는 아이템을 찾아보세요.</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock size={13} /> 최근 본 스타일을 기반으로 추천</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { title: "Linen Layers", label: "가벼운 여름 셔츠", query: "린넨", image: products[0].img },
                  { title: "Modern Denim", label: "편안한 와이드 핏", query: "데님", image: products[1].img },
                  { title: "Quiet Tailoring", label: "정제된 오피스 룩", query: "슬랙스", image: products[4].img },
                  { title: "New Outerwear", label: "시즌의 아우터", query: "아우터", image: products[2].img },
                ].map((collection) => (
                  <button key={collection.title} onClick={() => setQuery(collection.query)} className="group relative aspect-[3/4] overflow-hidden text-left bg-secondary">
                    <img src={collection.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute left-3 right-3 bottom-3 text-white">
                      <p className="text-[9px] tracking-[0.18em] uppercase text-white/65 mb-1">{collection.title}</p>
                      <p className="text-xs font-medium">{collection.label}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-[1.35fr_1fr] gap-6 border-t border-border pt-6">
                <div>
                  <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-3"><Trending size={13} /> Collector's picks</p>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((s, i) => <button key={s} onClick={() => setQuery(s)} className="px-3 py-2 bg-secondary text-sm hover:bg-primary hover:text-primary-foreground transition-colors"><span className="text-accent font-bold mr-2">0{i + 1}</span>{s}</button>)}
                  </div>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-3"><Tag size={13} /> Browse by piece</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">{["상의", "하의", "아우터", "신발", "악세서리"].map((c) => <button key={c} onClick={() => setQuery(c)} className="text-sm border-b border-border hover:border-primary hover:text-primary transition-colors">{c}</button>)}</div>
                  <p className="text-xs text-muted-foreground mt-5">최근 검색: {recentSearches.join(" · ")}</p>
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            /* No results */
            <div className="py-16 text-center">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-base font-medium text-foreground mb-1">
                "<span className="text-accent">{query}</span>" 검색 결과가 없습니다
              </p>
              <p className="text-sm text-muted-foreground">다른 키워드로 검색해 보세요</p>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {popularSearches.map((s) => (
                  <button key={s} onClick={() => setQuery(s)} className="px-3 py-1.5 bg-secondary text-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Results */
            <div>
              <p className="text-xs text-muted-foreground mb-5">
                "<span className="font-semibold text-foreground">{query}</span>" 검색 결과{" "}
                <span className="font-semibold text-accent">{results.length}</span>개
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.map((p) => {
                  const cheapest = getShopPrices(p)[0];
                  return (
                    <div
                      key={p.id}
                      className="group cursor-pointer"
                      onClick={() => handleSelect(p)}
                    >
                      <div className="aspect-[4/5] overflow-hidden bg-secondary mb-2 relative">
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        {p.tag && (
                          <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 tracking-widest ${
                            p.tag === "베스트" ? "bg-primary text-primary-foreground" :
                            p.tag === "SALE" ? "bg-destructive text-destructive-foreground" :
                            "bg-accent text-accent-foreground"
                          }`}>
                            {p.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground mb-0.5">{p.brand}</p>
                      <p className="text-sm font-medium text-foreground leading-snug mb-1">{p.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold">{fmt(cheapest.price)}</span>
                        {p.originalPrice && (
                          <span className="text-xs line-through text-muted-foreground">{fmt(p.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


