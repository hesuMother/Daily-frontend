import { useState, type FormEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Eye, Heart, Menu, Search, User, X } from "lucide-react";
import type { DailyProduct, Product } from "../../app/App";
import { clickable } from "../a11y";

interface HeaderProps {
  variant?: "main" | "back" | "search";
  recentlyViewed?: Product[];
  favoriteProducts?: Product[];
  favoriteOutfits?: DailyProduct[];
  onSelectFavoriteOutfit?: (outfit: DailyProduct) => void;
  // 로그인한 회원. 있으면 사람 아이콘 대신 프로필을 보여준다.
  profile?: { name: string; avatarUrl: string | null } | null;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  onOpenLogin?: () => void;
  onSelectProduct?: (product: Product) => void;
  onSelectFavoriteProduct?: (product: Product) => void;
  getLowestPrice?: (product: Product) => number;
  onBack?: () => void;
  onHome?: () => void;
  backLabel?: string;
  center?: ReactNode;
  actions?: ReactNode;
  searchContent?: ReactNode;
  maxWidth?: "1200px" | "1400px";
}

export function Header({
  variant = "main", recentlyViewed = [], favoriteProducts = [], favoriteOutfits = [], onSelectFavoriteOutfit, profile, onOpenLogin, onSelectProduct, onSelectFavoriteProduct, getLowestPrice,
  onBack, onHome, backLabel, center, actions, searchContent, searchQuery = "", onSearch, maxWidth = "1400px",
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [recentPanelOpen, setRecentPanelOpen] = useState(false);
  const [favoritePanelOpen, setFavoritePanelOpen] = useState(false);
  const [query, setQuery] = useState(searchQuery);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) onSearch?.(trimmedQuery);
  };

  if (variant === "search") {
    return (
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1400px] mx-auto h-16 px-4 md:px-8 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft size={18} /> 돌아가기</button>
          <button onClick={onHome} className="hidden sm:block text-xl font-bold mr-auto" style={{ fontFamily: "'Playfair Display', serif" }}>D<span className="text-accent">.</span>aily</button>
          {searchContent}
        </div>
      </header>
    );
  }

  if (variant === "back") {
    return (
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="mx-auto px-4 md:px-8 h-14 flex items-center gap-4" style={{ maxWidth }}>
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={18} />
            <span className="hidden md:inline">{backLabel}</span>
          </button>
          <div className="flex-1 text-center">
            {onHome && <button onClick={onHome} className="mr-3 text-sm font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>D<span className="text-accent">.</span>aily</button>}
            {center}
          </div>
          {actions ?? <div className="w-16 hidden md:block" />}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <button className="md:hidden p-1" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={menuOpen}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <button className="flex-1 md:flex-none select-none text-left" onClick={onHome} aria-label="D.aily 홈">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.02em" }}
          >
            D<span className="text-accent">.</span>aily
          </span>
        </button>

        <div className="flex items-center gap-4 ml-auto">
          <form onSubmit={submitSearch} className="flex items-center gap-2 border-b border-border focus-within:border-primary transition-colors py-1.5 w-32 sm:w-44 md:w-200 md:mr-80">
            <Search size={17} className="text-muted-foreground shrink-0" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="상품 검색" aria-label="상품 검색" className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </form>

          <div className="relative">
            <button
              className="relative p-1 hover:opacity-80 transition-opacity"
              onClick={() => {
                setRecentPanelOpen((open) => !open);
                setFavoritePanelOpen(false);
              }}
              aria-label="최근 본 상품"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-border bg-secondary flex items-center justify-center">
                {recentlyViewed.length > 0 ? (
                  <img src={recentlyViewed[0].img} alt={recentlyViewed[0].name} className="w-full h-full object-cover" />
                ) : <Eye size={16} className="text-muted-foreground" />}
              </div>
              {recentlyViewed.length > 1 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {recentlyViewed.length}
                </span>
              )}
            </button>

            {recentPanelOpen && (
              <RecentlyViewedPanel
                items={recentlyViewed}
                getLowestPrice={getLowestPrice ?? ((product) => product.price)}
                onClose={() => setRecentPanelOpen(false)}
                onSelectProduct={onSelectProduct ?? (() => undefined)}
              />
            )}
          </div>

          <div className="relative">
            <button
              className="relative p-1 hover:opacity-80 transition-opacity"
              onClick={() => {
                setFavoritePanelOpen((open) => !open);
                setRecentPanelOpen(false);
              }}
              aria-label="즐겨찾기"
            >
              <div className="w-9 h-9 rounded-full border-2 border-border bg-secondary flex items-center justify-center relative">
                <Heart size={16} className={favoriteProducts.length + favoriteOutfits.length > 0 ? "fill-destructive text-destructive" : "text-muted-foreground"} />
              </div>
            </button>

            {favoritePanelOpen && (
              <FavoritesPanel
                items={favoriteProducts}
                outfits={favoriteOutfits}
                onSelectOutfit={onSelectFavoriteOutfit ?? (() => undefined)}
                getLowestPrice={getLowestPrice ?? ((product) => product.price)}
                onClose={() => setFavoritePanelOpen(false)}
                onSelectProduct={onSelectFavoriteProduct ?? (() => undefined)}
              />
            )}
          </div>

          {profile ? (
            <button className="hidden md:block p-1 hover:opacity-80 transition-opacity" onClick={onOpenLogin} aria-label={`${profile.name} 마이페이지`}>
              <span className="w-9 h-9 rounded-full overflow-hidden bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
              </span>            </button>
          ) : (
            <button className="hidden md:block p-2 hover:text-accent transition-colors" onClick={onOpenLogin} aria-label="로그인">
              <User size={20} />
            </button>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-1">
          {["마이페이지", "주문 조회", "1:1 문의"].map((item) => (
            <button key={item} type="button" onClick={item === "마이페이지" ? onOpenLogin : undefined} className="w-full py-2.5 text-sm font-medium border-b border-border cursor-pointer flex justify-between items-center text-left">
              {item} <ChevronRight size={14} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function RecentlyViewedPanel({ items, getLowestPrice, onClose, onSelectProduct }: {
  items: Product[];
  getLowestPrice: (product: Product) => number;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-[320px] bg-background border border-border shadow-2xl z-50" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-muted-foreground" />
            <span className="text-xs font-bold tracking-[0.15em] uppercase">최근 본 상품</span>
            {items.length > 0 && <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 font-semibold">{items.length}</span>}
          </div>
          <button onClick={onClose} aria-label="닫기" className="text-muted-foreground hover:text-foreground transition-colors"><X size={16} /></button>
        </div>

        {items.length === 0 ? (
          <div className="py-12 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3"><Eye size={20} className="text-muted-foreground" /></div>
            <p className="text-sm font-medium text-foreground mb-1">최근 본 상품이 없습니다</p>
            <p className="text-xs text-muted-foreground">상품을 클릭하면 여기에 기록됩니다</p>
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
            {items.map((product) => (
              <div key={product.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary cursor-pointer transition-colors group" {...clickable(() => { onSelectProduct(product); onClose(); })}>
                <div className="w-14 h-16 overflow-hidden bg-secondary shrink-0"><img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground mb-0.5">{product.brand}</p>
                  <p className="text-sm font-medium text-foreground truncate leading-snug mb-1">{product.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-foreground">{getLowestPrice(product).toLocaleString("ko-KR")}원</span>
                    {product.originalPrice && <span className="text-xs line-through text-muted-foreground">{product.originalPrice.toLocaleString("ko-KR")}원</span>}
                  </div>
                </div>
                <ChevronRight size={14} className="text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && <div className="border-t border-border px-4 py-2.5"><p className="text-[10px] text-muted-foreground text-center">최근 본 상품 최대 10개까지 표시됩니다</p></div>}
      </div>
    </>
  );
}

// 즐겨찾기 패널. 찜한 상품과 저장한 코디를 탭으로 나눠 보여준다.
function FavoritesPanel({ items, outfits, getLowestPrice, onClose, onSelectProduct, onSelectOutfit }: {
  items: Product[];
  outfits: DailyProduct[];
  getLowestPrice: (product: Product) => number;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectOutfit: (outfit: DailyProduct) => void;
}) {
  const [tab, setTab] = useState<"상품" | "코디">("상품");
  const counts = { 상품: items.length, 코디: outfits.length };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-[320px] bg-background border border-border shadow-2xl z-50" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-muted-foreground" />
            <span className="text-xs font-bold tracking-[0.15em] uppercase">즐겨찾기</span>
          </div>
          <button onClick={onClose} aria-label="닫기" className="text-muted-foreground hover:text-foreground transition-colors"><X size={16} /></button>
        </div>

        <div className="grid grid-cols-2 border-b border-border" role="tablist">
          {(["상품", "코디"] as const).map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={`py-2.5 text-xs font-bold transition-colors ${tab === name ? "text-foreground border-b-2 border-primary -mb-px" : "text-muted-foreground hover:text-foreground"}`}
            >
              {name} <span className="font-semibold text-muted-foreground">{counts[name]}</span>
            </button>
          ))}
        </div>

        {counts[tab] === 0 ? (
          <div className="py-12 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3"><Heart size={20} className="text-muted-foreground" /></div>
            <p className="text-sm font-medium text-foreground mb-1">{tab === "상품" ? "즐겨찾기 상품이 없습니다" : "저장한 코디가 없습니다"}</p>
            <p className="text-xs text-muted-foreground">하트 버튼을 누르면 여기에 저장됩니다</p>
          </div>
        ) : tab === "상품" ? (
          <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
            {items.map((product) => (
              <div key={product.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary cursor-pointer transition-colors group" {...clickable(() => { onSelectProduct(product); onClose(); })}>
                <div className="w-14 h-16 overflow-hidden bg-secondary shrink-0"><img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground mb-0.5">{product.brand}</p>
                  <p className="text-sm font-medium text-foreground truncate leading-snug mb-1">{product.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-foreground">{getLowestPrice(product).toLocaleString("ko-KR")}원</span>
                    {product.originalPrice && <span className="text-xs line-through text-muted-foreground">{product.originalPrice.toLocaleString("ko-KR")}원</span>}
                  </div>
                </div>
                <ChevronRight size={14} className="text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
              </div>
            ))}
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
            {outfits.map((outfit) => (
              <div key={outfit.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary cursor-pointer transition-colors group" {...clickable(() => { onSelectOutfit(outfit); onClose(); })}>
                <div className="w-14 h-16 overflow-hidden bg-secondary shrink-0">{outfit.img && <img src={outfit.img} alt={outfit.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground mb-0.5">{outfit.authorName}</p>
                  <p className="text-sm font-medium text-foreground truncate leading-snug mb-1">{outfit.name}</p>
                  <p className="text-xs text-muted-foreground">연결 상품 {outfit.items.length}개</p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
