import { Heart } from "lucide-react";
import { useState } from "react";
import type { DailyProduct, Product, ShopPrice } from "../app/App";
import type { User } from "../shared/api/auth";
import { AccountSettingsPanel } from "../features/account/AccountSettingsPanel";
import { ReportAdminPanel } from "../features/report/ReportAdminPanel";
import { MyOutfits } from "../features/style/MyOutfits";
import { OutfitReviewPanel } from "../features/style/OutfitReviewPanel";
// TODO: 추후 복구 — "나의 스타일 찾기" 메뉴
// import { MyStyleFinder } from "../features/style/MyStyleFinder";
import { Header } from "../shared/components/header";

interface MyPageProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  role: User["role"];
  outfitBookmarkIds: string[];
  myOutfits: DailyProduct[];
  myOutfitsError: string;
  myOutfitsHasMore: boolean;
  onLoadMoreMyOutfits: () => void;
  savedOutfits: DailyProduct[];
  onSelectOutfit: (outfit: DailyProduct) => void;
  favoriteProducts: Product[];
  recentlyViewed: Product[];
  getShopPrices: (product: Product) => ShopPrice[];
  fmt: (value: number) => string;
  onHome: () => void;
  onLogout: () => void;
  onSelectProduct: (product: Product) => void;
  onUpdateProfile: (user: User) => void;
  onDeleteAccount: () => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  onOpenLogin: () => void;
}

// TODO: 추후 복구 — "나의 스타일 찾기" 메뉴. 지금은 그 자리에 "내가 올린 코디"가 들어간다.
// type MyPageTab = "찜 목록" | "최근 본 상품" | "나의 스타일 찾기" | "내 코드" | "주문 내역" | "계정 설정" | "신고 관리";
// const memberTabs: MyPageTab[] = ["찜 목록", "최근 본 상품", "나의 스타일 찾기", "내 코드", "주문 내역", "계정 설정"];
type MyPageTab = "찜 목록" | "최근 본 상품" | "내가 올린 코디" | "내 코드" | "주문 내역" | "계정 설정" | "코디 검수" | "신고 관리";

// TODO: 추후 복구 — "내 코드", "주문 내역" 메뉴
// const memberTabs: MyPageTab[] = ["찜 목록", "최근 본 상품", "내가 올린 코디", "내 코드", "주문 내역", "계정 설정"];
const memberTabs: MyPageTab[] = ["찜 목록", "최근 본 상품", "내가 올린 코디", "계정 설정"];

export function MyPage({
  name, email, avatarUrl, role, outfitBookmarkIds, myOutfits, myOutfitsError, myOutfitsHasMore, onLoadMoreMyOutfits, savedOutfits, onSelectOutfit, favoriteProducts, recentlyViewed, getShopPrices,
  // TODO: 추후 복구 — "나의 스타일 찾기"에서 쓰던 props
  // onToggleOutfitBookmark, outfits, products, fmt,
  onHome, onLogout, onSelectProduct, onUpdateProfile, onDeleteAccount,
  searchQuery, onSearch, onOpenLogin,
}: MyPageProps) {
  const [activeTab, setActiveTab] = useState<MyPageTab>("찜 목록");
  // 찜 목록은 찜한 상품과 저장한 코디를 나눠서 보여준다.
  const [favoriteKind, setFavoriteKind] = useState<"상품" | "코디">("상품");
  const tabs: MyPageTab[] = role === "ADMIN" ? [...memberTabs, "코디 검수", "신고 관리"] : memberTabs;
  const displayName = name || "D.aily 회원";
  const displayEmail = email || "daily@example.com";
  const visibleProducts = activeTab === "최근 본 상품" ? recentlyViewed : favoriteProducts;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#171615]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <Header
        key="mypage"
        onHome={onHome}
        recentlyViewed={recentlyViewed}
        favoriteProducts={favoriteProducts}
        searchQuery={searchQuery}
        onSearch={onSearch}
        onOpenLogin={onOpenLogin}
        onSelectProduct={onSelectProduct}
        onSelectFavoriteProduct={onSelectProduct}
        favoriteOutfits={savedOutfits}
        onSelectFavoriteOutfit={onSelectOutfit}
        profile={{ name: displayName, avatarUrl }}
        getLowestPrice={(product) => getShopPrices(product)[0].price}
      />

      <main className="mx-auto max-w-[1144px] px-5 pb-24 pt-11 md:px-0">
        <section className="relative h-[331px] overflow-hidden bg-[#11100f] px-11 py-11 text-[#f8f6f2] md:px-12">
          <div className="absolute -right-8 -top-24 h-[200px] w-[200px] rounded-full bg-[#252321]" />
          <div className="absolute bottom-[-68px] right-[132px] h-[176px] w-[176px] rounded-full bg-[#242220]" />
          <div className="relative flex items-start gap-7">
            <div className="flex h-[78px] w-[78px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#c7a875] text-[25px] font-medium text-[#171615]">{avatarUrl ? <img src={avatarUrl} alt="프로필 이미지" className="h-full w-full object-cover" /> : displayName.charAt(0)}</div>
            <div>
              <div className="flex items-center gap-3"><h2 className="text-[21px] font-bold">{displayName}</h2>
                {/* TODO: 추후 복구 — 등급 배지 */}
                {/* <span className="bg-[#3b342a] px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-[#c7a875]">SILVER</span> */}
              </div>
              <p className="mt-1 text-[16px] text-[#a9a49d]">{displayEmail}</p>
              {/* TODO: 추후 복구 — 적립금 / 쿠폰 / 등급 */}
              {/* <div className="mt-4 flex items-start divide-x divide-[#3a3835]"><div className="pr-5"><p className="text-[12px] text-[#8f8981]">적립금</p><p className="mt-1 text-[16px] font-bold text-[#c7a875]">1,240 P</p></div><div className="px-5"><p className="text-[12px] text-[#8f8981]">쿠폰</p><p className="mt-1 text-[16px] font-bold">3장</p></div><div className="pl-5"><p className="text-[12px] text-[#8f8981]">등급</p><p className="mt-1 text-[16px] font-bold">실버</p></div></div> */}
            </div> 
          </div>
          <div className="absolute bottom-[133px] left-11 right-11 border-t border-[#2d2b29] md:left-12 md:right-12" />
          <div className="absolute bottom-0 left-11 right-11 grid h-[133px] grid-cols-3 md:left-12 md:right-12"><div className="flex flex-col items-center justify-center border-r border-[#2d2b29]"><strong className="text-[30px] font-bold">{favoriteProducts.length}</strong><span className="mt-1 text-[12px] text-[#99928a]">찜한 상품</span></div><div className="flex flex-col items-center justify-center border-r border-[#2d2b29]"><strong className="text-[30px] font-bold">{recentlyViewed.length}</strong><span className="mt-1 text-[12px] text-[#99928a]">최근 본</span></div><div className="flex flex-col items-center justify-center"><strong className="text-[30px] font-bold">{outfitBookmarkIds.length}</strong><span className="mt-1 text-[12px] text-[#99928a]">저장한 코디</span></div></div>
        </section>

        <nav className="mt-10 flex overflow-x-auto border-b border-[#dedbd6]">{tabs.map((tab) => <button key={tab} type="button" aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)} className={`relative shrink-0 px-[22px] pb-5 text-[16px] font-medium transition-colors ${activeTab === tab ? "text-[#171615]" : "text-[#8c857d] hover:text-[#171615]"}`}>{tab}{activeTab === tab && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#171615]" />}</button>)}</nav>

        <section className={`min-h-[330px] ${activeTab === "계정 설정" || activeTab === "내가 올린 코디" || activeTab === "코디 검수" || activeTab === "신고 관리" || activeTab === "찜 목록" ? "pt-8 text-left" : "pt-28 text-center"}`}>
          {activeTab === "찜 목록" && (
            <div className="mb-6 flex gap-2">
              {(["상품", "코디"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={favoriteKind === kind}
                  onClick={() => setFavoriteKind(kind)}
                  className={`border px-4 py-2 text-[13px] font-medium transition-colors ${favoriteKind === kind ? "border-[#171615] bg-[#171615] text-white" : "border-[#dedbd6] text-[#8c857d] hover:border-[#171615] hover:text-[#171615]"}`}
                >
                  {kind} {kind === "상품" ? favoriteProducts.length : savedOutfits.length}
                </button>
              ))}
            </div>
          )}

          {activeTab === "찜 목록" && favoriteKind === "코디" && (
            savedOutfits.length === 0 ? (
              <div className="pt-12 text-center">
                <Heart size={37} strokeWidth={1.2} className="mx-auto mb-4 text-[#a88e68]" />
                <p className="text-[14px] text-[#8c857d]">저장한 코디가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
                {savedOutfits.map((outfit) => (
                  <button type="button" key={outfit.id} onClick={() => onSelectOutfit(outfit)} className="group text-left">
                    <div className="aspect-[3/4] overflow-hidden bg-[#efede9]">
                      <img src={outfit.img} alt={outfit.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <p className="mt-3 truncate text-[13px]">{outfit.name}</p>
                    <p className="mt-1 text-[12px] text-[#8c857d]">연결 상품 {outfit.items.length}개</p>
                  </button>
                ))}
              </div>
            )
          )}

          {((activeTab === "찜 목록" && favoriteKind === "상품") || activeTab === "최근 본 상품") && (
            visibleProducts.length === 0 ? (
              <div className={activeTab === "찜 목록" ? "pt-12 text-center" : undefined}>
                <Heart size={37} strokeWidth={1.2} className="mx-auto mb-4 text-[#a88e68]" />
                <p className="text-[14px] text-[#8c857d]">{activeTab === "찜 목록" ? "찜한 상품이 없습니다." : "최근 본 상품이 없습니다."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
                {visibleProducts.map((product) => (
                  <button type="button" key={product.id} onClick={() => onSelectProduct(product)} className="group">
                    <div className="aspect-[4/5] overflow-hidden bg-[#efede9]">
                      <img src={product.img} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <p className="mt-3 truncate text-[13px]">{product.name}</p>
                    <p className="mt-1 text-[12px] text-[#8c857d]">{product.price.toLocaleString("ko-KR")}원</p>
                  </button>
                ))}
              </div>
            )
          )}

          {activeTab === "내가 올린 코디" && <MyOutfits outfits={myOutfits} error={myOutfitsError} hasMore={myOutfitsHasMore} onLoadMore={onLoadMoreMyOutfits} onSelect={onSelectOutfit} />}

          {/* TODO: 추후 복구 — "나의 스타일 찾기" 메뉴 */}
          {/* {activeTab === "나의 스타일 찾기" && (
            <MyStyleFinder
              outfits={outfits}
              products={products}
              getShopPrices={getShopPrices}
              fmt={fmt}
              onSelectProduct={onSelectProduct}
              savedIds={outfitBookmarkIds}
              onToggleSave={onToggleOutfitBookmark}
            />
          )} */}

          {activeTab === "코디 검수" && <OutfitReviewPanel />}

          {activeTab === "신고 관리" && <ReportAdminPanel />}

          {activeTab === "계정 설정" && (
            <AccountSettingsPanel
              name={displayName}
              email={displayEmail}
              avatarUrl={avatarUrl}
              onUpdateProfile={onUpdateProfile}
              onDeleteAccount={onDeleteAccount}
              onLogout={onLogout}
            />
          )}

          {/* TODO: 추후 복구 — "내 코드", "주문 내역" 메뉴 */}
          {/* {(activeTab === "내 코드" || activeTab === "주문 내역") && (
            <div className="text-[14px] text-[#8c857d]">
              {activeTab === "내 코드" ? "사용 가능한 코드가 없습니다." : "주문 내역이 없습니다."}
            </div>
          )} */}
        </section>
      </main>
    </div>
  );
}
