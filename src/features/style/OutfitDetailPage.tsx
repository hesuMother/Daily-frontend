import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, Outfit, ShopPrice } from "../../app/App";
import { OutfitFeedback } from "./OutfitFeedback";

export function OutfitDetailPage({
  outfit,
  onBack,
  onSelectProduct,
  products,
  getShopPrices,
  fmt,
}: {
  outfit: Outfit;
  onBack: () => void;
  onSelectProduct: (p: Product) => void;
  products: Product[];
  getShopPrices: (product: Product) => ShopPrice[];
  fmt: (value: number) => string;
}) {
  const items = outfit.items
    .map((oi) => ({ item: oi, product: products.find((p) => p.id === oi.productId)! }))
    .filter((x) => x.product);

  const total = items.reduce((sum, { product }) => sum + getShopPrices(product)[0].price, 0);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft size={18} /> 코디 목록으로 돌아가기
        </button>

        {/* Top: image + info */}
        <div className="grid md:grid-cols-2 gap-8 mb-14">
          <div className="relative overflow-hidden bg-secondary" style={{ aspectRatio: "3/4" }}>
            <img src={outfit.img} alt={outfit.title} className="w-full h-full object-cover" />
            {outfit.season && (
              <span className="absolute top-3 left-3 text-[9px] font-bold tracking-[0.2em] text-white/80 bg-black/40 backdrop-blur-sm px-2 py-1 uppercase">
                {outfit.season}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground mb-2">{outfit.style}</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {outfit.title}
            </h1>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {outfit.tags.map((t) => (
                <span key={t} className="text-[10px] font-bold tracking-wider text-muted-foreground bg-secondary px-2 py-0.5">
                  #{t}
                </span>
              ))}
            </div>

            <div className="bg-secondary border border-border p-5 mb-6">
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-2">코디 설명</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{outfit.stylistNote}</p>
            </div>

            <div className="mb-6">
              <OutfitFeedback outfitId={String(outfit.id)} outfitName={outfit.title} />
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-border pt-5">
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">전체 코디 최저 합산가</p>
              <p className="text-xl font-bold">{fmt(total)}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <section className="mb-10">
          <div className="mb-5">
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-1">Outfit Items</p>
            <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              이 코디 구성 아이템 · {items.length}개
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {items.map(({ item, product }) => {
              const cheapest = getShopPrices(product)[0];
              return (
                <div
                  key={product.id}
                  className="flex gap-3.5 p-3.5 border border-border hover:border-foreground/30 hover:bg-secondary/50 cursor-pointer transition-all group"
                  onClick={() => onSelectProduct(product)}
                >
                  <div className="shrink-0 self-start">
                    <div className="w-[72px] h-[90px] overflow-hidden bg-secondary">
                      <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <p className="text-center text-[9px] font-bold tracking-wider text-muted-foreground mt-1.5 uppercase">
                      {item.role}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground mb-0.5">{product.brand}</p>
                    <p className="text-[13px] font-medium text-foreground leading-snug mb-1.5">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">{product.subtitle}</p>

                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-bold">{fmt(cheapest.price)}</span>
                      {product.originalPrice && (
                        <span className="text-[11px] line-through text-muted-foreground">{fmt(product.originalPrice)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] font-bold bg-secondary text-muted-foreground px-1.5 py-0.5 tracking-wider">
                        {cheapest.shop} 최저가
                      </span>
                      {cheapest.isFree && <span className="text-[10px] text-green-700 font-medium">무료배송</span>}
                    </div>
                  </div>

                  <div className="self-center shrink-0">
                    <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
