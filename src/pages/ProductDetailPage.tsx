import { useState } from "react";
import { Star, Bell, ExternalLink, TrendingDown, TrendingUp, ChevronDown, Heart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { Product } from "../app/App";
import type { PricePoint, ShopPrice } from "../app/App";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-primary text-primary-foreground text-xs px-3 py-2 shadow-lg">
      <p className="font-bold mb-1 text-primary-foreground/60">{label}</p>
      {payload.map((p, i) => (
        <p key={i}>{p.name === "price" ? "최저가" : "평균가"}: {p.value.toLocaleString()}원</p>
      ))}
    </div>
  );
}

export function ProductDetail({ product, onClose, wishlisted, onToggleWishlist, getShopPrices, getPriceHistory, fmt }: { product: Product; onClose: () => void; wishlisted: boolean; onToggleWishlist: () => void; getShopPrices: (product: Product) => ShopPrice[]; getPriceHistory: (product: Product) => PricePoint[]; fmt: (value: number) => string }) {
  void onClose;
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [showAllShops, setShowAllShops] = useState(false);

  const shopPrices = getShopPrices(product);
  const history = getPriceHistory(product);
  const cheapest = shopPrices[0];
  // "바로 구매"는 재고가 있는 쇼핑몰 중 가장 싼 곳으로 보낸다.
  const buyShop = shopPrices.find((shop) => shop.stock !== "품절");
  const lowestEver = Math.min(...history.map((h) => h.price));
  const highestEver = Math.max(...history.map((h) => h.price));
  const diffPct = Math.round(((cheapest.price - lowestEver) / lowestEver) * 100);
  const visibleShops = showAllShops ? shopPrices : shopPrices.slice(0, 4);


  return (
    <div className="min-h-screen bg-background overflow-y-auto" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        {/* Top: images + info */}
        <div className="grid md:grid-cols-2 gap-8 mb-14">
          <div>
            <div className="aspect-[4/5] bg-secondary overflow-hidden mb-3">
              <img src={product.imgs[activeImg]} alt={product.name} className="w-full h-full object-cover transition-opacity duration-300" />
            </div>
            <div className="flex gap-2">
              {product.imgs.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} aria-label={`상품 사진 ${i + 1}`} aria-pressed={i === activeImg}
                  className={`w-16 h-20 overflow-hidden border-2 transition-colors ${i === activeImg ? "border-primary" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            {product.tag && (
              <span className={`self-start text-[10px] font-bold px-2 py-0.5 tracking-widest mb-3 ${
                product.tag === "베스트" ? "bg-primary text-primary-foreground" :
                product.tag === "SALE" ? "bg-destructive text-destructive-foreground" :
                "bg-accent text-accent-foreground"
              }`}>
                {product.tag}
              </span>
            )}
            <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground mb-2">{product.brand}</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground mb-4">{product.nameEn}</p>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={12} className={s <= Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"} />
                ))}
              </div>
              <span className="text-sm font-semibold">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviews.toLocaleString()}개 리뷰)</span>
            </div>

            {/* Price box */}
            <div className="bg-secondary border border-border p-5 mb-6">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-bold">{fmt(cheapest.price)}</span>
                {product.originalPrice && (
                  <span className="text-base line-through text-muted-foreground">{fmt(product.originalPrice)}</span>
                )}
                {product.originalPrice && (
                  <span className="text-sm font-bold text-destructive">
                    {Math.round((1 - cheapest.price / product.originalPrice) * 100)}% 할인
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-accent/20 text-accent-foreground font-semibold px-1.5 py-0.5">{cheapest.shop} 최저가</span>
                {cheapest.isFree ? <span className="text-green-700 font-medium">무료배송</span> : <span>배송비 별도</span>}
              </div>
            </div>

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold tracking-wider text-muted-foreground">사이즈 선택</p>
                <button className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">사이즈 가이드</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSelectedSize(s)} aria-pressed={selectedSize === s}
                    className={`px-4 py-2 text-sm border transition-colors duration-150 min-w-[52px] ${
                      selectedSize === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-primary"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-4">
              <button className="flex items-center gap-2 border border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
                <Bell size={15} /> 가격 알림
              </button>
              <button
                onClick={onToggleWishlist}
                aria-label={wishlisted ? "찜 해제" : "찜하기"}
                aria-pressed={wishlisted}
                className="flex items-center justify-center border border-border px-4 py-3 hover:border-primary transition-colors"
              >
                <Heart size={17} className={wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"} />
              </button>
              {buyShop ? (
                <a href={buyShop.url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 bg-accent text-accent-foreground px-5 py-3 text-sm font-bold text-center hover:opacity-90 transition-opacity">
                  바로 구매 <span className="font-medium opacity-70">· {buyShop.shop} {fmt(buyShop.price)}</span>
                </a>
              ) : (
                <span className="flex-1 bg-secondary text-muted-foreground px-5 py-3 text-sm font-bold text-center">전 쇼핑몰 품절</span>
              )}
            </div>

            {/* Product quick info */}
            <div className="border border-border divide-y divide-border text-xs">
              {[
                { label: "소재", value: product.material },
                { label: "핏", value: product.fit },
                { label: "색상", value: product.color },
                { label: "원산지", value: product.origin },
              ].map((row) => (
                <div key={row.label} className="flex px-3 py-2.5">
                  <span className="text-muted-foreground w-14 shrink-0">{row.label}</span>
                  <span className="text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Price comparison ── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-1">Price Compare</p>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                쇼핑몰별 가격 비교
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">총 <span className="font-semibold text-foreground">{shopPrices.length}개</span> 쇼핑몰</p>
          </div>

          <div className="border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] bg-secondary px-4 py-2.5 text-xs font-bold tracking-wider text-muted-foreground border-b border-border">
              <span>쇼핑몰</span>
              <span className="text-right pr-6">판매가</span>
              <span className="text-right pr-6 hidden md:block">배송비</span>
              <span className="text-right pr-6 hidden md:block">재고</span>
              <span className="text-right">구매</span>
            </div>
            {visibleShops.map((shop) => (
              <div key={shop.shop} className={`grid grid-cols-[1fr_auto_auto_auto_auto] px-4 py-3.5 items-center border-b border-border last:border-b-0 hover:bg-secondary/60 transition-colors ${shop.isCheapest ? "bg-accent/5" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold shrink-0 ${shop.isCheapest ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {shop.logo}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{shop.shop}</span>
                      {shop.isCheapest && <span className="text-[9px] font-bold bg-accent text-accent-foreground px-1.5 py-0.5 tracking-wider">최저가</span>}
                    </div>
                    <div className="text-xs text-muted-foreground md:hidden">
                      배송 {shop.isFree ? "무료" : "유료"} · {shop.stock}
                    </div>
                  </div>
                </div>
                <div className="text-right pr-6">
                  <span className={`text-sm font-bold ${shop.isCheapest ? "text-accent" : "text-foreground"}`}>
                    {fmt(shop.price)}
                  </span>
                </div>
                <div className="text-right pr-6 hidden md:block">
                  <span className={`text-xs ${shop.isFree ? "text-green-700 font-medium" : "text-muted-foreground"}`}>
                    {shop.isFree ? "무료" : "유료"}
                  </span>
                </div>
                <div className="text-right pr-6 hidden md:block">
                  <span className={`text-xs font-medium ${shop.stock === "있음" ? "text-green-700" : shop.stock === "한정" ? "text-amber-600" : "text-muted-foreground line-through"}`}>
                    {shop.stock}
                  </span>
                </div>
                <div>
                  <a href={shop.stock === "품절" ? undefined : shop.url} target="_blank" rel="noopener noreferrer"
                    aria-label={shop.stock === "품절" ? `${shop.shop} 품절` : `${shop.shop}에서 구매`}
                    className={`flex items-center gap-1 text-xs border px-3 py-1.5 whitespace-nowrap transition-colors ${
                      shop.stock === "품절"
                        ? "border-border text-muted-foreground cursor-not-allowed"
                        : "border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    }`}>
                    {shop.stock === "품절" ? "품절" : <><span>구매</span><ExternalLink size={10} /></>}
                  </a>
                </div>
              </div>
            ))}
          </div>
          {shopPrices.length > 4 && (
            <button
              className="w-full py-3 border border-border border-t-0 text-sm text-muted-foreground flex items-center justify-center gap-1.5 hover:bg-secondary transition-colors"
              onClick={() => setShowAllShops(!showAllShops)}
            >
              {showAllShops ? "접기" : `${shopPrices.length - 4}개 더 보기`}
              <ChevronDown size={14} className={`transition-transform ${showAllShops ? "rotate-180" : ""}`} />
            </button>
          )}
        </section>

        {/* ── Price history ── */}
        <section className="mb-14">
          <div className="mb-5">
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-1">Price History</p>
            <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>가격 변동 추이</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "현재 최저가", value: fmt(cheapest.price), sub: cheapest.shop, highlight: true, icon: null },
              { label: "역대 최저가", value: fmt(lowestEver), sub: diffPct > 0 ? `현재보다 ${diffPct}% 저렴` : "현재가 역대 최저", highlight: false, icon: <TrendingDown size={14} className={diffPct > 0 ? "text-green-600" : "text-muted-foreground"} /> },
              { label: "역대 최고가", value: fmt(highestEver), sub: `현재보다 ${Math.round(((highestEver - cheapest.price) / cheapest.price) * 100)}% 높았음`, highlight: false, icon: <TrendingUp size={14} className="text-destructive" /> },
            ].map((s) => (
              <div key={s.label} className={`border p-4 ${s.highlight ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                <p className={`text-[10px] tracking-wider uppercase mb-1.5 ${s.highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{s.label}</p>
                <div className="flex items-center gap-1.5 mb-1">{s.icon}<p className={`text-base md:text-lg font-bold ${s.highlight ? "text-primary-foreground" : "text-foreground"}`}>{s.value}</p></div>
                <p className={`text-[11px] ${s.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="border border-border bg-background p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-primary" /><span>최저가</span></div>
                <div className="flex items-center gap-1.5"><div className="w-4 border-t-2 border-dashed border-accent" /><span>평균가</span></div>
              </div>
              <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>2024년 연간</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={history} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,14,13,0.06)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#7A7269" }} tickLine={false} axisLine={{ stroke: "rgba(15,14,13,0.1)" }} />
                <YAxis tick={{ fontSize: 10, fill: "#7A7269" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={lowestEver} stroke="#C4A97B" strokeDasharray="4 3" strokeWidth={1}
                  label={{ value: "역대최저", position: "right", fontSize: 10, fill: "#C4A97B" }} />
                <Line type="monotone" dataKey="avg" stroke="#C4A97B" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="avg" />
                <Line type="monotone" dataKey="price" stroke="#0F0E0D" strokeWidth={2}
                  dot={{ fill: "#0F0E0D", r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: "#C4A97B", r: 5, strokeWidth: 0 }} name="price" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-muted-foreground mt-3 text-center">* 가격은 각 쇼핑몰 기준이며 실시간 변동될 수 있습니다</p>
          </div>
        </section>

        {/* Description */}
        <section className="mb-14 border border-border p-6 md:p-8">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">About</p>
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>상품 설명</h2>
          <p className="text-sm text-muted-foreground leading-loose">{product.description}</p>
        </section>

        <div className="md:hidden h-20" />
      </div>

      {/* Mobile sticky bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center gap-3 z-40">
        <div><p className="text-[10px] text-muted-foreground">최저가</p><p className="text-base font-bold">{fmt(cheapest.price)}</p></div>
        <button onClick={onToggleWishlist} aria-label={wishlisted ? "찜 해제" : "찜하기"} aria-pressed={wishlisted} className="border border-border p-3">
          <Heart size={17} className={wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"} />
        </button>
        {buyShop ? (
          <a href={buyShop.url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-accent text-accent-foreground px-4 py-3 text-sm font-bold text-center">바로구매</a>
        ) : (
          <span className="flex-1 bg-secondary text-muted-foreground px-4 py-3 text-sm font-bold text-center">품절</span>
        )}
      </div>
    </div>
  );
}

