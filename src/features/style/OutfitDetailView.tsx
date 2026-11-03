import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import type { Product, Outfit, ShopPrice } from "../../app/App";
import { OutfitFeedback } from "./OutfitFeedback";

export function OutfitDetailView({
  outfit,
  products,
  getShopPrices,
  fmt,
  isSaved,
  onToggleSave,
  onBack,
  onSelectProduct,
}: {
  outfit: Outfit;
  products: Product[];
  getShopPrices: (product: Product) => ShopPrice[];
  fmt: (value: number) => string;
  isSaved: boolean;
  onToggleSave: () => void;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}) {
  const items = outfit.items
    .map((oi) => ({ item: oi, product: products.find((p) => p.id === oi.productId)! }))
    .filter((x) => x.product);

  return (
    <div className="max-w-[720px]">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 flex items-center gap-1 text-[13px] font-medium text-[#8a837a] transition-colors hover:text-[#171615]"
      >
        <ChevronLeft size={17} strokeWidth={1.8} /> 돌아가기
      </button>

      {/* Hero image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#efede9]">
        <img src={outfit.img} alt={outfit.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {outfit.season && (
          <span className="absolute left-4 top-4 bg-black/40 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm">
            {outfit.season}
          </span>
        )}
        <button
          type="button"
          onClick={onToggleSave}
          className="absolute right-4 top-4 flex items-center gap-1.5 bg-white/90 px-3 py-2 text-[12px] font-bold text-[#171615] transition-colors hover:bg-white"
        >
          <Heart size={15} className={isSaved ? "fill-[#b34b42] text-[#b34b42]" : "text-[#171615]"} />
          {isSaved ? "저장됨" : "코디 저장"}
        </button>
      </div>

      {/* Title + meta */}
      <div className="mt-6 border-b border-[#dedbd6] pb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8c857d]">{outfit.style}</span>
          {outfit.season && (
            <>
              <span className="text-[10px] text-[#c7bfb3]">·</span>
              <span className="text-[10px] text-[#8c857d]">{outfit.season} 시즌</span>
            </>
          )}
        </div>
        <h1 className="text-[22px] font-bold leading-snug text-[#171615]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {outfit.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {outfit.tags.map((t) => (
            <span key={t} className="bg-[#efede9] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#8c857d]">
              #{t}
            </span>
          ))}
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-[#5c564f]">{outfit.stylistNote}</p>
        <div className="mt-5">
          <OutfitFeedback outfitId={String(outfit.id)} outfitName={outfit.title} />
        </div>
      </div>

      {/* Items */}
      <div className="pb-8 pt-6">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8c857d]">
          이 코디 구성 아이템 · {items.length}개
        </p>

        <div className="space-y-3">
          {items.map(({ item, product }) => {
            const cheapest = getShopPrices(product)[0];
            return (
              <div
                key={product.id}
                className="group flex cursor-pointer gap-3.5 border border-[#dedbd6] p-3.5 transition-colors hover:border-[#171615]"
                onClick={() => onSelectProduct(product)}
              >
                <div className="shrink-0 self-start">
                  <div className="h-[90px] w-[72px] overflow-hidden bg-[#efede9]">
                    <img src={product.img} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <p className="mt-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-[#8c857d]">{item.role}</p>
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="mb-0.5 text-[10px] font-bold tracking-[0.15em] text-[#8c857d]">{product.brand}</p>
                  <p className="mb-1.5 text-[13px] font-medium leading-snug text-[#171615]">{product.name}</p>
                  <p className="mb-2 line-clamp-1 text-[11px] text-[#8c857d]">{product.subtitle}</p>

                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-bold text-[#171615]">{fmt(cheapest.price)}</span>
                    {product.originalPrice && (
                      <span className="text-[11px] text-[#8c857d] line-through">{fmt(product.originalPrice)}</span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="bg-[#efede9] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[#8c857d]">
                      {cheapest.shop} 최저가
                    </span>
                    {cheapest.isFree && <span className="text-[10px] font-medium text-[#3f7a4d]">무료배송</span>}
                  </div>
                </div>

                <div className="shrink-0 self-center">
                  <ChevronRight size={14} className="text-[#8c857d] transition-colors group-hover:text-[#171615]" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[#dedbd6] pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c857d]">전체 코디 최저 합산가</p>
          <p className="text-[16px] font-bold text-[#171615]">
            {fmt(items.reduce((sum, { product }) => sum + getShopPrices(product)[0].price, 0))}
          </p>
        </div>
      </div>
    </div>
  );
}
