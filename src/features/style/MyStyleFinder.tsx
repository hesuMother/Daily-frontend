import { useState } from "react";
import type React from "react";
import { Heart } from "lucide-react";
import type { Product, Outfit, ShopPrice } from "../../app/App";
import { OutfitDetailView } from "./OutfitDetailView";

const FEATURED_COUNT = 6;

export function MyStyleFinder({
  outfits,
  products,
  getShopPrices,
  fmt,
  onSelectProduct,
  savedIds,
  onToggleSave,
}: {
  savedIds: number[];
  onToggleSave: (outfitId: number) => void;
  outfits: Outfit[];
  products: Product[];
  getShopPrices: (product: Product) => ShopPrice[];
  fmt: (value: number) => string;
  onSelectProduct: (product: Product) => void;
}) {
  const [selected, setSelected] = useState<Outfit | null>(null);
  const toggleSave = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onToggleSave(id);
  };

  if (selected) {
    return (
      <OutfitDetailView
        outfit={selected}
        products={products}
        getShopPrices={getShopPrices}
        fmt={fmt}
        isSaved={savedIds.includes(selected.id)}
        onToggleSave={() => toggleSave(selected.id)}
        onBack={() => setSelected(null)}
        onSelectProduct={onSelectProduct}
      />
    );
  }

  const featured = outfits.slice(0, FEATURED_COUNT);

  return (
    <div>
      <p className="mb-5 text-[12px] text-[#8c857d]">
        취향에 맞춰 추천된 코디예요. 마음에 드는 코디를 눌러 자세히 확인해보세요.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {featured.map((outfit) => {
          const items = outfit.items
            .map((oi) => products.find((p) => p.id === oi.productId)!)
            .filter(Boolean);
          const saved = savedIds.includes(outfit.id);

          return (
            <div key={outfit.id} className="group cursor-pointer text-left" onClick={() => setSelected(outfit)}>
              <div className="relative aspect-[3/4] overflow-hidden bg-[#efede9]">
                <img
                  src={outfit.img}
                  alt={outfit.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                <button
                  type="button"
                  onClick={(e) => toggleSave(outfit.id, e)}
                  className="absolute right-2 top-2 bg-white/90 p-1.5 transition-colors hover:bg-white"
                >
                  <Heart size={14} className={saved ? "fill-[#b34b42] text-[#b34b42]" : "text-[#8c857d]"} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="mb-1.5 flex flex-wrap gap-1">
                    {outfit.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[9px] font-bold tracking-wider text-white/70">#{t}</span>
                    ))}
                  </div>
                  <p className="mb-2 text-[12px] font-bold leading-snug text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {outfit.title}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {items.slice(0, 3).map((product) => (
                      <div key={product.id} className="h-7 w-7 shrink-0 overflow-hidden border border-white/30 bg-white/20">
                        <img src={product.img} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-2 truncate text-[12px] text-[#8c857d]">{outfit.style} · {items.length}개 아이템</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
