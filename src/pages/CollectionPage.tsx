import { useState, useEffect } from "react";
import type React from "react";
import { Heart, Star } from "lucide-react";
import type { Product, ShopPrice } from "../app/App";
export interface CollectionDef {
  key: string;
  label: string;
  labelEn: string;
  desc: string;
  heroImg: string;
  heroOverlay?: string;
  filter: (p: Product) => boolean;
  sortFn?: (a: Product, b: Product) => number;
  badge?: string;
}

export const collectionDefs: CollectionDef[] = [
  {
    key: "outer-new",
    label: "아우터 신상 컬렉션",
    labelEn: "New Outerwear",
    desc: "2025 FW 시즌의 신규 아우터를 가장 먼저 만나보세요. 트렌디한 실루엣과 고품질 소재로 구성된 컬렉션입니다.",
    heroImg: "https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?w=1400&h=600&fit=crop&auto=format",
    heroOverlay: "from-black/70 via-black/30 to-transparent",
    filter: (p) => p.category === "아우터",
    sortFn: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0),
    badge: "New Season",
  },
  {
    key: "weekly-best",
    label: "이번 주 베스트",
    labelEn: "Weekly Best Sellers",
    desc: "지금 가장 많이 팔리고 있는 베스트셀러 아이템을 모았습니다. 검증된 퀄리티와 스타일을 확인하세요.",
    heroImg: "https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=1400&h=600&fit=crop&auto=format",
    heroOverlay: "from-black/65 via-black/25 to-transparent",
    filter: (p) => p.tag === "베스트",
    sortFn: (a, b) => b.reviews - a.reviews,
    badge: "Best Seller",
  },
  {
    key: "season-sale",
    label: "시즌오프 세일",
    labelEn: "Season Off Sale",
    desc: "이번 시즌 마지막 기회. 최대 40% 할인된 가격으로 프리미엄 패션을 만나보세요. 수량이 한정되어 있습니다.",
    heroImg: "https://images.unsplash.com/photo-1645561305577-4cb5be67a40a?w=1400&h=600&fit=crop&auto=format",
    heroOverlay: "from-black/70 via-black/30 to-transparent",
    filter: (p) => p.tag === "SALE" || p.originalPrice !== null,
    sortFn: (a, b) => {
      const discA = a.originalPrice ? (1 - a.price / a.originalPrice) : 0;
      const discB = b.originalPrice ? (1 - b.price / b.originalPrice) : 0;
      return discB - discA;
    },
    badge: "Sale up to 40%",
  },
];
export function CollectionView({
  collectionKey,
  onClose,
  onSelectProduct,
  products,
  getShopPrices,
  fmt,
  collectionDefs,
}: {
  collectionKey: string;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  products: Product[];
  getShopPrices: (product: Product) => ShopPrice[];
  fmt: (value: number) => string;
  collectionDefs: CollectionDef[];
}) {
  void onClose;
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "review">("default");

  const col = collectionDefs.find((c) => c.key === collectionKey)!;

  const baseItems = products.filter(col.filter);
  const sorted = [...baseItems].sort((a, b) => {
    if (sortBy === "price-asc") return getShopPrices(a)[0].price - getShopPrices(b)[0].price;
    if (sortBy === "price-desc") return getShopPrices(b)[0].price - getShopPrices(a)[0].price;
    if (sortBy === "review") return b.reviews - a.reviews;
    return col.sortFn ? col.sortFn(a, b) : 0;
  });

  const toggleWish = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-y-auto" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Hero */}
      <div className="relative h-[260px] md:h-[380px] overflow-hidden">
        <img
          src={col.heroImg}
          alt={col.label}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${col.heroOverlay ?? "from-black/60 to-transparent"}`} />
        <div className="absolute inset-0 flex flex-col justify-end pb-10 pl-8 md:pl-16">
          {col.badge && (
            <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase text-white/60 mb-3">
              {col.badge}
            </span>
          )}
          <h1
            className="text-white text-3xl md:text-5xl font-bold mb-2 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {col.label}
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-[520px] leading-relaxed hidden md:block">
            {col.desc}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border bg-background sticky top-14 z-40">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-12 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            총 <span className="font-bold text-foreground">{sorted.length}</span>개 상품
          </p>
          <div className="flex items-center gap-1">
            {(["default", "price-asc", "price-desc", "review"] as const).map((s) => {
              const labels: Record<string, string> = {
                default: "추천순",
                "price-asc": "낮은 가격순",
                "price-desc": "높은 가격순",
                review: "리뷰 많은순",
              };
              return (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`text-[11px] px-2.5 py-1 transition-colors ${
                    sortBy === s
                      ? "text-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {labels[s]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product grid */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        {sorted.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-1">해당 컬렉션에 상품이 없습니다</p>
            <p className="text-sm">잠시 후 다시 확인해 주세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sorted.map((product) => {
              const cheapest = getShopPrices(product)[0];
              const discPct = product.originalPrice
                ? Math.round((1 - product.price / product.originalPrice) * 100)
                : null;
              return (
                <div
                  key={product.id}
                  className="group cursor-pointer"
                  onClick={() => onSelectProduct(product)}
                >
                  <div className="relative overflow-hidden bg-secondary aspect-[4/5] mb-3">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.tag && (
                      <span
                        className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 tracking-widest ${
                          product.tag === "베스트"
                            ? "bg-primary text-primary-foreground"
                            : product.tag === "SALE"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-accent text-accent-foreground"
                        }`}
                      >
                        {product.tag}
                      </span>
                    )}
                    {discPct && (
                      <span className="absolute top-2.5 right-10 text-[10px] font-bold px-1.5 py-0.5 bg-destructive text-destructive-foreground">
                        -{discPct}%
                      </span>
                    )}
                    <button
                      className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 hover:bg-white transition-colors"
                      onClick={(e) => toggleWish(product.id, e)}
                    >
                      <Heart
                        size={15}
                        className={wishlist.includes(product.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}
                      />
                    </button>
                    <div className="absolute bottom-2.5 left-2.5 bg-black/70 text-white text-[10px] px-2 py-1 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="text-accent font-bold">{cheapest.shop}</span> 최저
                    </div>
                  </div>

                  <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground mb-1">{product.brand}</p>
                  <p className="text-sm font-medium text-foreground mb-1 leading-snug">{product.name}</p>
                  <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed line-clamp-1">{product.subtitle}</p>

                  <div className="flex items-center gap-1 mb-1.5">
                    <Star size={11} className="fill-accent text-accent" />
                    <span className="text-[11px] font-medium">{product.rating}</span>
                    <span className="text-[11px] text-muted-foreground">({product.reviews.toLocaleString()})</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold">{fmt(cheapest.price)}</span>
                    {product.originalPrice && (
                      <span className="text-xs line-through text-muted-foreground">{fmt(product.originalPrice)}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">{cheapest.shop}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Style Look View ──────────────────────────────────────────────────────────

export const styleGuideData: Record<string, { eng: string; desc: string; color: string }> = {
  캐주얼:  { eng: "Casual",  desc: "편안하고 자연스러운 일상 스타일", color: "#C4A97B" },
  스트릿:  { eng: "Street",  desc: "개성 넘치는 도시형 스트릿 패션", color: "#0F0E0D" },
  오피스룩: { eng: "Office",  desc: "세련되고 단정한 비즈니스 무드",  color: "#7A7269" },
  미니멀:  { eng: "Minimal", desc: "군더더기 없는 깔끔한 베이직",    color: "#0F0E0D" },
  스포티:  { eng: "Sporty",  desc: "활동적이고 경쾌한 애슬레저",    color: "#C4A97B" },
};


