import type { Product } from "../app/App";
import type { ShopPrice } from "../app/App";
export function ProductSearchPage({ query, onSelectProduct, products, getShopPrices, fmt }: { query: string; onBack: () => void; onSelectProduct: (p: Product) => void; products: Product[]; getShopPrices: (product: Product) => ShopPrice[]; fmt: (value: number) => string }) {
  const visibleProducts = products.filter((product) => {
    const keyword = query.trim().toLowerCase();
    const queryMatch = !keyword || [product.name, product.nameEn, product.brand, product.category, product.subtitle].some((value) => value.toLowerCase().includes(keyword));
    return queryMatch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div><p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent mb-2">Search results</p><h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>&quot;{query}&quot; 검색 결과</h1></div>
          <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{visibleProducts.length}</span>개의 상품</p>
        </div>
        {visibleProducts.length ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-9">
          {visibleProducts.map((product) => {
            const cheapest = getShopPrices(product)[0];
            return <button key={product.id} onClick={() => onSelectProduct(product)} className="group text-left">
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary mb-3"><img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />{product.tag && <span className={`absolute top-3 left-3 text-[10px] font-bold tracking-widest px-2 py-1 ${product.tag === "SALE" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>{product.tag}</span>}</div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground mb-1">{product.brand}</p><p className="text-sm font-medium leading-snug mb-2">{product.name}</p><div className="flex items-center gap-2"><span className="font-bold text-sm">{fmt(cheapest.price)}</span>{product.originalPrice && <span className="text-xs text-muted-foreground line-through">{fmt(product.originalPrice)}</span>}</div>
            </button>;
          })}
        </div> : <div className="py-28 text-center border-y border-border"><p className="text-lg font-medium mb-2">검색 결과가 없습니다.</p><p className="text-sm text-muted-foreground">다른 검색어나 카테고리를 선택해 보세요.</p></div>}
      </main>
    </div>
  );
}

// ─── Product Detail ───────────────────────────────────────────────────────────


