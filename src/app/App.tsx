import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Heart, Star, ArrowRight,
} from "lucide-react";
import { Header } from "../shared/components/header";
import { ProductDetail } from "../pages/ProductDetailPage";
import { CollectionView, collectionDefs } from "../pages/CollectionPage";
// TODO: 추후 복구 — 스타일 분류 API가 생기면 스타일별 코디 페이지를 다시 연결한다. 지금은 tsconfig에서 제외돼 있다.
// import { DailyBrandView } from "../pages/DailyBrandPage";
import { FooterPageModal } from "../pages/FooterPage";
import { ProductSearchPage } from "../pages/ProductSearchPage";
import { LoginModal } from "../features/auth/LoginModal";
import { OutfitDetailModal, OutfitFeedSection } from "../features/style/OutfitFeedSection";
import { MyPage } from "../pages/MyPage";
import { banners } from "../pages/StyleLookPage";
import { clickable } from "../shared/a11y";
import { getSession, signOut, type User } from "../shared/api/auth";
import { onSessionExpired } from "../shared/api/client";
import { productIdFromLink, productLink } from "../shared/api/db";
import { createOutfit, fetchMyOutfits, fetchOutfitBookmarks, fetchOutfits, revokeOutfitImages, toggleOutfitBookmark, type OutfitInput } from "../shared/api/outfits";
import { ApiError, errorMessage } from "../shared/api/storage";
import type { ModerationStatus, OutfitItem as ApiOutfitItem } from "../shared/api/types";
import { addProductHistory, fetchCategories, fetchProductBookmarks, fetchProductHistories, toggleProductBookmark } from "../shared/api/userData";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  nameEn: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  tag: string | null;
  img: string;
  imgs: string[];
  subtitle: string;
  isNew: boolean;
  category: string;
  sizes: string[];
  description: string;
  material: string;
  fit: string;
  origin: string;
  color: string;
}

export interface ShopPrice {
  shop: string;
  logo: string;
  url: string; // 구매하러 가는 주소
  price: number;
  isFree: boolean;
  isCheapest: boolean;
  stock: "있음" | "품절" | "한정";
}

export interface PricePoint {
  date: string;
  price: number;
  avg: number;
}

export interface OutfitItem {
  productId: number;
  role: string;
}

export interface Outfit {
  id: number;
  style: string;
  title: string;
  tags: string[];
  img: string;
  season: string;
  stylistNote: string;
  items: OutfitItem[];
}

export interface DailyProduct {
  id: string;
  name: string;
  img: string;
  height: string;
  weight: string;
  items: ApiOutfitItem[];
  desc: string;
  status: ModerationStatus;
  authorName: string;
  rejectionReason: string | null;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const products: Product[] = [
  {
    id: 1,
    name: "오버사이즈 린넨 셔츠",
    nameEn: "Oversized Linen Shirt",
    brand: "무신사 스탠다드",
    price: 49000,
    originalPrice: null,
    rating: 4.8,
    reviews: 3214,
    tag: "베스트",
    img: "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=600&h=750&fit=crop&auto=format",
    imgs: [
      "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1713881630214-82c44407cf25?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1647218947427-d783309440d2?w=600&h=750&fit=crop&auto=format",
    ],
    subtitle: "린넨 100% | 오버핏 | 아이보리, 화이트, 베이지",
    isNew: true,
    category: "상의",
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "순수 린넨 원단으로 제작된 오버사이즈 셔츠. 통기성이 뛰어나 여름철에도 쾌적하게 착용할 수 있으며, 넉넉한 핏감으로 다양한 스타일링이 가능합니다. 세탁 후 자연스러운 구김이 생기며 시간이 지날수록 부드러워지는 소재입니다.",
    material: "린넨 100%",
    fit: "오버핏 (어깨 너비 +3cm 기준)",
    origin: "Made in Portugal",
    color: "아이보리 / 화이트 / 베이지",
  },
  {
    id: 2,
    name: "와이드 핏 데님 팬츠",
    nameEn: "Wide-Fit Denim Pants",
    brand: "COVERNAT",
    price: 98000,
    originalPrice: 129000,
    rating: 4.7,
    reviews: 1876,
    tag: "SALE",
    img: "https://images.unsplash.com/photo-1584983801173-0903840a36d6?w=600&h=750&fit=crop&auto=format",
    imgs: [
      "https://images.unsplash.com/photo-1584983801173-0903840a36d6?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1584983806622-8f73015b7ed7?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1553555890-df11df390525?w=600&h=750&fit=crop&auto=format",
    ],
    subtitle: "데님 100% | 와이드 | 인디고, 블랙",
    isNew: true,
    category: "하의",
    sizes: ["28", "30", "32", "34"],
    description: "커버낫 시그니처 와이드 데님 팬츠. 14oz 셀비지 데님 원단을 사용해 내구성이 뛰어나며, 클래식한 5포켓 구조에 와이드한 실루엣으로 현대적인 무드를 완성합니다.",
    material: "코튼 100% (14oz 셀비지 데님)",
    fit: "와이드핏 (허벅지부터 밑단까지 넓은 실루엣)",
    origin: "Made in Japan",
    color: "인디고 / 블랙",
  },
  {
    id: 3,
    name: "울 오버코트",
    nameEn: "Wool Overcoat",
    brand: "ADER ERROR",
    price: 298000,
    originalPrice: null,
    rating: 4.9,
    reviews: 892,
    tag: "신상",
    img: "https://images.unsplash.com/photo-1666358069269-8b1778d8f48c?w=600&h=750&fit=crop&auto=format",
    imgs: [
      "https://images.unsplash.com/photo-1666358069269-8b1778d8f48c?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1619603364904-c0498317e145?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1660827915367-2cf03881e58b?w=600&h=750&fit=crop&auto=format",
    ],
    subtitle: "울 80% | 박시핏 | 블랙, 카멜",
    isNew: true,
    category: "아우터",
    sizes: ["S", "M", "L", "XL"],
    description: "아더에러의 2025 FW 시그니처 울 오버코트. 고품질 이탈리아 울 원단을 사용해 보온성과 고급스러운 드레이프를 동시에 구현했습니다. 박시한 실루엣으로 다양한 레이어링이 가능합니다.",
    material: "울 80%, 폴리에스터 20%",
    fit: "박시핏 (어깨선 드롭 구조)",
    origin: "Made in Italy",
    color: "블랙 / 카멜",
  },
  {
    id: 4,
    name: "크루넥 스웨트셔츠",
    nameEn: "Crewneck Sweatshirt",
    brand: "THISISNEVERTHAT",
    price: 79000,
    originalPrice: null,
    rating: 4.6,
    reviews: 2541,
    tag: "베스트",
    img: "https://images.unsplash.com/photo-1647218947427-d783309440d2?w=600&h=750&fit=crop&auto=format",
    imgs: [
      "https://images.unsplash.com/photo-1647218947427-d783309440d2?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1687626896914-61e59a0e5623?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1713881630214-82c44407cf25?w=600&h=750&fit=crop&auto=format",
    ],
    subtitle: "코튼 100% | 레귤러핏 | 그레이, 네이비, 블랙",
    isNew: true,
    category: "상의",
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "디스이즈네버댓의 베스트셀러 크루넥 스웨트셔츠. 두툼한 320g 코튼 원단으로 제작되어 보온성이 우수하며, 세탁 후에도 형태 변형이 적습니다. 미니멀한 로고 자수 디테일.",
    material: "코튼 100% (320g 프렌치 테리)",
    fit: "레귤러핏 (표준 체형 기준)",
    origin: "Made in Korea",
    color: "그레이 멜란지 / 네이비 / 블랙",
  },
  {
    id: 5,
    name: "테일러드 슬랙스",
    nameEn: "Tailored Slacks",
    brand: "무신사 스탠다드",
    price: 65000,
    originalPrice: null,
    rating: 4.7,
    reviews: 4102,
    tag: "베스트",
    img: "https://images.unsplash.com/photo-1588713611500-8bf627fd3fb9?w=600&h=750&fit=crop&auto=format",
    imgs: [
      "https://images.unsplash.com/photo-1588713611500-8bf627fd3fb9?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1584983801173-0903840a36d6?w=600&h=750&fit=crop&auto=format",
    ],
    subtitle: "TR 혼방 | 세미와이드 | 블랙, 차콜, 네이비",
    isNew: true,
    category: "하의",
    sizes: ["28", "30", "32", "34", "36"],
    description: "출퇴근부터 캐주얼까지 활용도 높은 테일러드 슬랙스. 구김이 잘 생기지 않는 TR 혼방 원단을 사용해 관리가 편하며, 세미와이드 실루엣으로 깔끔하고 세련된 스타일을 완성합니다.",
    material: "폴리에스터 65%, 레이온 35% (TR 혼방)",
    fit: "세미와이드핏 (무릎 아래부터 직선 실루엣)",
    origin: "Made in Korea",
    color: "블랙 / 차콜 / 네이비",
  },
  {
    id: 6,
    name: "바시티 재킷",
    nameEn: "Varsity Jacket",
    brand: "COVERNAT",
    price: 185000,
    originalPrice: 228000,
    rating: 4.8,
    reviews: 1123,
    tag: "SALE",
    img: "https://images.unsplash.com/photo-1687276154629-d4acac547d55?w=600&h=750&fit=crop&auto=format",
    imgs: [
      "https://images.unsplash.com/photo-1687276154629-d4acac547d55?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1660827915367-2cf03881e58b?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=600&h=750&fit=crop&auto=format",
    ],
    subtitle: "울 보디 + 가죽 소매 | 레귤러핏 | 네이비/크림",
    isNew: false,
    category: "아우터",
    sizes: ["S", "M", "L", "XL"],
    description: "커버낫의 아이코닉 바시티 재킷. 울 소재 보디와 가죽 소매의 클래식한 조합. 안감에는 커버낫 아카이브 패턴이 자수 처리되어 있으며, 내구성 좋은 리브 소재 밴딩 처리.",
    material: "울 60%, 가죽(소매) 100% / 안감: 폴리에스터 100%",
    fit: "레귤러핏 (기본 체형 기준, 내부 레이어링 가능)",
    origin: "Made in Korea",
    color: "네이비 × 크림 / 블랙 × 화이트",
  },
  {
    id: 7,
    name: "리넨 와이드 팬츠",
    nameEn: "Linen Wide Pants",
    brand: "ADER ERROR",
    price: 132000,
    originalPrice: null,
    rating: 4.6,
    reviews: 734,
    tag: "신상",
    img: "https://images.unsplash.com/photo-1565281756735-f5d99a69c1bc?w=600&h=750&fit=crop&auto=format",
    imgs: [
      "https://images.unsplash.com/photo-1565281756735-f5d99a69c1bc?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1553555890-df11df390525?w=600&h=750&fit=crop&auto=format",
    ],
    subtitle: "린넨 55% | 와이드 | 오트밀, 블랙",
    isNew: true,
    category: "하의",
    sizes: ["XS", "S", "M", "L"],
    description: "아더에러의 SS25 컬렉션 리넨 와이드 팬츠. 린넨과 비스코스 혼방으로 자연스러운 드레이프와 통기성을 모두 잡았습니다. 허리 고무밴드와 드로스트링으로 편안한 착용감.",
    material: "린넨 55%, 비스코스 45%",
    fit: "와이드핏 (하이라이즈, 넓은 밑단)",
    origin: "Made in Italy",
    color: "오트밀 / 블랙",
  },
  {
    id: 8,
    name: "헤비 코튼 티셔츠",
    nameEn: "Heavy Cotton Tee",
    brand: "THISISNEVERTHAT",
    price: 45000,
    originalPrice: null,
    rating: 4.5,
    reviews: 5678,
    tag: null,
    img: "https://images.unsplash.com/photo-1666358068130-13168bbd4d3b?w=600&h=750&fit=crop&auto=format",
    imgs: [
      "https://images.unsplash.com/photo-1666358068130-13168bbd4d3b?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1713881630214-82c44407cf25?w=600&h=750&fit=crop&auto=format",
    ],
    subtitle: "코튼 100% | 오버핏 | 화이트, 블랙, 카키",
    isNew: true,
    category: "상의",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description: "디스이즈네버댓의 시그니처 헤비 코튼 티셔츠. 260g 두께의 두툼한 원단으로 제작되어 형태 유지력이 우수합니다. 오버핏 패턴으로 넉넉하게 착용 가능하며, 기본에 충실한 디자인.",
    material: "코튼 100% (260g 컴팩트 스핀)",
    fit: "오버핏 (어깨 드롭 구조)",
    origin: "Made in Korea",
    color: "화이트 / 블랙 / 카키 / 그레이",
  },
  {
    id: 9,
    name: "헤비 코튼 티셔츠 ver.2",
    nameEn: "Heavy Cotton Tee",
    brand: "THISISNEVERTHAT",
    price: 45000,
    originalPrice: null,
    rating: 4.5,
    reviews: 5678,
    tag: null,
    img: "https://images.unsplash.com/photo-1666358068130-13168bbd4d3b?w=600&h=750&fit=crop&auto=format",
    imgs: [
      "https://images.unsplash.com/photo-1666358068130-13168bbd4d3b?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=600&h=750&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1713881630214-82c44407cf25?w=600&h=750&fit=crop&auto=format",
    ],
    subtitle: "코튼 100% | 오버핏 | 화이트, 블랙, 카키",
    isNew: true,
    category: "상의",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description: "디스이즈네버댓의 시그니처 헤비 코튼 티셔츠. 260g 두께의 두툼한 원단으로 제작되어 형태 유지력이 우수합니다. 오버핏 패턴으로 넉넉하게 착용 가능하며, 기본에 충실한 디자인.",
    material: "코튼 100% (260g 컴팩트 스핀)",
    fit: "오버핏 (어깨 드롭 구조)",
    origin: "Made in Korea",
    color: "화이트 / 블랙 / 카키 / 그레이",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

// 쇼핑몰별 상품 주소는 백엔드가 내려줘야 한다. 그 전까지는 각 쇼핑몰에서 상품명을 검색한 결과로 보낸다.
const shopSearchUrls: Record<string, (keyword: string) => string> = {
  "무신사": (q) => `https://www.musinsa.com/search/goods?keyword=${q}`,
  "쿠팡": (q) => `https://www.coupang.com/np/search?q=${q}`,
  "29CM": (q) => `https://www.29cm.co.kr/search?keyword=${q}`,
  "W컨셉": (q) => `https://display.wconcept.co.kr/search?keyword=${q}`,
  "네이버쇼핑": (q) => `https://search.shopping.naver.com/search/all?query=${q}`,
  "SSG닷컴": (q) => `https://www.ssg.com/search.ssg?query=${q}`,
  // 브랜드 공식몰은 브랜드마다 주소가 달라 네이버쇼핑 검색으로 대신한다.
  "브랜드몰": (q) => `https://search.shopping.naver.com/search/all?query=${q}`,
};

export function getShopPrices(product: Product): ShopPrice[] {
  const base = product.price;
  const shops = [
    { shop: "무신사", logo: "M", delta: 0 },
    { shop: "쿠팡", logo: "C", delta: Math.round(base * 0.02) },
    { shop: "29CM", logo: "2", delta: -Math.round(base * 0.03) },
    { shop: "W컨셉", logo: "W", delta: -Math.round(base * 0.05) },
    { shop: "네이버쇼핑", logo: "N", delta: Math.round(base * 0.01) },
    { shop: "SSG닷컴", logo: "S", delta: -Math.round(base * 0.07) },
    { shop: "브랜드몰", logo: "B", delta: -Math.round(base * 0.09) },
  ];
  const prices = shops.map((s) => ({
    shop: s.shop,
    logo: s.logo,
    url: shopSearchUrls[s.shop](encodeURIComponent(`${product.brand} ${product.name}`)),
    price: Math.max(base - s.delta, base - Math.round(base * 0.12)),
    isFree: s.shop === "무신사" || s.shop === "쿠팡" || base >= 50000,
    isCheapest: false,
    stock: (s.shop === "SSG닷컴" ? "한정" : s.shop === "W컨셉" && product.id % 3 === 0 ? "품절" : "있음") as "있음" | "품절" | "한정",
  }));
  const min = Math.min(...prices.map((p) => p.price));
  return prices.map((p) => ({ ...p, isCheapest: p.price === min })).sort((a, b) => a.price - b.price);
}

export function getPriceHistory(product: Product): PricePoint[] {
  const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  const base = product.price;
  const seed = product.id * 23;
  return months.map((m, i) => {
    const noise = Math.sin(seed + i * 1.5) * base * 0.1;
    const trend = i < 5 ? base * 0.06 : 0;
    const price = Math.round((base + noise + trend) / 1000) * 1000;
    return { date: m, price, avg: Math.round((base + Math.sin(seed + i) * base * 0.05) / 1000) * 1000 };
  });
}

export const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

// ─── Tooltip ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [myPageOpen, setMyPageOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const userId = user?.id ?? null;
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [outfitFeed, setOutfitFeed] = useState<DailyProduct[]>([]);
  const [outfitFeedPage, setOutfitFeedPage] = useState(1);
  const [outfitFeedHasMore, setOutfitFeedHasMore] = useState(false);
  const [outfitFeedError, setOutfitFeedError] = useState("");
  const [myOutfits, setMyOutfits] = useState<DailyProduct[]>([]);
  const [myOutfitsPage, setMyOutfitsPage] = useState(1);
  const [myOutfitsHasMore, setMyOutfitsHasMore] = useState(false);
  const [myOutfitsError, setMyOutfitsError] = useState("");
  const myOutfitsRef = useRef<DailyProduct[]>([]);
  const [outfitBookmarkIds, setOutfitBookmarkIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>(["전체", "신상품"]);
  const [footerPage, setFooterPage] = useState<string | null>(null);
  const [openOutfitId, setOpenOutfitId] = useState<string | null>(null);
  const [routeReady, setRouteReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [activeBanner]);

  // 주소의 # 뒤(예: #/product/3)를 읽어 그 화면을 연다. 새로고침, 링크 공유, 브라우저 뒤로가기가 이걸로 동작한다.
  const applyRoute = useCallback((hash: string) => {
    let kind = "";
    let value = "";
    try {
      const [, k = "", raw = ""] = hash.split("/");
      kind = k;
      value = decodeURIComponent(raw);
    } catch {
      // 잘못된 주소는 홈으로 본다
    }
    setSelectedProduct(kind === "product" ? products.find((p) => p.id === Number(value)) ?? null : null);
    setSearchQuery(kind === "search" && value ? value : null);
    setActiveCollection(kind === "collection" && collectionDefs.some((c) => c.key === value) ? value : null);
    setFooterPage(kind === "page" && value ? value : null);
    setMyPageOpen(kind === "mypage");
    setOpenOutfitId(null);
  }, []);

  useEffect(() => {
    getSession().then((session) => {
      setUser(session);
      applyRoute(window.location.hash);
      setRouteReady(true);
    });
    fetchOutfits()
      .then((result) => {
        setOutfitFeed(result.items);
        setOutfitFeedHasMore(result.hasMore);
      })
      .catch((err) => setOutfitFeedError(errorMessage(err)));
    fetchCategories().then((rows) => setCategories(["전체", ...rows.map((c) => c.category_name), "신상품"]));
  }, [applyRoute]);

  useEffect(() => {
    const onPopState = () => applyRoute(window.location.hash);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [applyRoute]);

  const replaceMyOutfits = useCallback((next: DailyProduct[]) => {
    const kept = new Set(next.map((outfit) => outfit.img));
    revokeOutfitImages(myOutfitsRef.current.filter((outfit) => !kept.has(outfit.img)));
    myOutfitsRef.current = next;
    setMyOutfits(next);
  }, []);

  // 다른 기기 로그인 등으로 세션이 끊기면 로그아웃 상태로 돌린다.
  useEffect(() => {
    onSessionExpired(() => {
      setUser(null);
      replaceMyOutfits([]);
      setMyPageOpen(false);
      setLoginOpen(true);
    });
    return () => onSessionExpired(() => {});
  }, [replaceMyOutfits]);

  // 로그인하면 내가 올린 코디를 불러온다. 로그아웃할 때는 handleLogout이 비운다.
  useEffect(() => {
    if (userId === null) return;
    let active = true;
    fetchMyOutfits()
      .then((result) => {
        if (!active) { revokeOutfitImages(result.items); return; }
        replaceMyOutfits(result.items);
        setMyOutfitsPage(1);
        setMyOutfitsHasMore(result.hasMore);
        setMyOutfitsError("");
      })
      .catch((err) => { if (active) setMyOutfitsError(errorMessage(err)); });
    return () => { active = false; };
  }, [userId, replaceMyOutfits]);

  // 로그인 상태가 바뀌면 해당 계정의 찜 목록, 최근 본 상품, 저장한 코디를 다시 불러온다. 비회원이면 모두 비어 있다.
  useEffect(() => {
    let active = true;
    Promise.all([fetchProductBookmarks(), fetchProductHistories(), fetchOutfitBookmarks()]).then(([bookmarkLinks, historyLinks, outfitIds]) => {
      if (!active) return;
      setWishlist(bookmarkLinks.flatMap((link) => productIdFromLink(link) ?? []));
      setRecentlyViewed(historyLinks.flatMap((link) => products.find((p) => p.id === productIdFromLink(link)) ?? []));
      setOutfitBookmarkIds(outfitIds);
    });
    return () => { active = false; };
  }, [userId]);

  const loadMoreOutfits = async () => {
    try {
      const result = await fetchOutfits(outfitFeedPage + 1);
      setOutfitFeed((prev) => [...prev, ...result.items]);
      setOutfitFeedPage(result.page);
      setOutfitFeedHasMore(result.hasMore);
    } catch (err) {
      setOutfitFeedError(errorMessage(err));
    }
  };

  const loadMoreMyOutfits = async () => {
    try {
      const result = await fetchMyOutfits(myOutfitsPage + 1);
      replaceMyOutfits([...myOutfitsRef.current, ...result.items]);
      setMyOutfitsPage(result.page);
      setMyOutfitsHasMore(result.hasMore);
    } catch (err) {
      setMyOutfitsError(errorMessage(err));
    }
  };

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setRecentlyViewed([p, ...recentlyViewed.filter((r) => r.id !== p.id)].slice(0, 10));
    void addProductHistory(productLink(p.id));
  };

  // 찜과 코디 저장은 회원 전용이다. 비회원이면 로그인 창을 띄운다.
  const toggleWishlist = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const product = products.find((p) => p.id === id);
    if (!product) return;
    if (!user) { setLoginOpen(true); return; }
    setWishlist(wishlist.includes(id) ? wishlist.filter((i) => i !== id) : [...wishlist, id]);
    void toggleProductBookmark({ name: product.name, link: productLink(id) });
  };

  const handleToggleOutfitBookmark = (outfitId: string) => {
    if (!user) { setLoginOpen(true); return; }
    setOutfitBookmarkIds(outfitBookmarkIds.includes(outfitId) ? outfitBookmarkIds.filter((i) => i !== outfitId) : [...outfitBookmarkIds, outfitId]);
    void toggleOutfitBookmark(outfitId);
  };

  // 코디 업로드는 회원 전용이다. 비회원이 업로드를 시도하면 로그인 창을 띄운다.
  const requireLogin = () => setLoginOpen(true);

  // 등록한 코디는 검수 대기라 피드가 아니라 내가 올린 코디에만 추가된다.
  const handleAddOutfit = async (input: OutfitInput) => {
    if (!user) { setLoginOpen(true); throw new ApiError("로그인이 필요합니다.", 401); }
    const outfit = await createOutfit(input);
    replaceMyOutfits([outfit, ...myOutfitsRef.current]);
  };

  const filtered =
    activeCategory === "전체" ? products :
    activeCategory === "신상품" ? products.filter((p) => p.isNew) :
    products.filter((p) => p.category === activeCategory);

  // 상품 상세·검색·컬렉션 같은 화면은 마이페이지보다 먼저 그려지므로, 다른 곳으로 이동할 때는 모두 닫아야 한다.
  const closeSubPages = () => {
    setSelectedProduct(null);
    setSearchQuery(null);
    setActiveCollection(null);
    setFooterPage(null);
  };

  const openMyPage = () => {
    closeSubPages();
    setMyPageOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHome = () => {
    closeSubPages();
    setMyPageOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const favoriteProducts = products.filter((product) => wishlist.includes(product.id));
  const favoriteOutfits = outfitFeed.filter((outfit) => outfitBookmarkIds.includes(outfit.id));
  const openOutfit = [...outfitFeed, ...myOutfits].find((outfit) => outfit.id === openOutfitId) ?? null;
  const profile = user ? { name: user.username, avatarUrl: null } : null;

  // 지금 보고 있는 화면을 주소에 반영한다. 화면을 고르는 순서는 아래 렌더링 순서와 같다.
  const routeHash =
    selectedProduct ? `#/product/${selectedProduct.id}` :
    searchQuery ? `#/search/${encodeURIComponent(searchQuery)}` :
    activeCollection ? `#/collection/${activeCollection}` :
    footerPage ? `#/page/${encodeURIComponent(footerPage)}` :
    myPageOpen && user ? "#/mypage" : "";

  useEffect(() => {
    if (!routeReady || window.location.hash === routeHash) return;
    window.history.pushState(null, "", routeHash || window.location.pathname + window.location.search);
    window.scrollTo({ top: 0 });
  }, [routeHash, routeReady]);

  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const openAccount = () => {
    if (user) {
      openMyPage();
    } else {
      setLoginOpen(true);
    }
  };
  const handleLoginSuccess = (loggedIn: User) => {
    setUser(loggedIn);
    setLoginOpen(false);
    openMyPage();
  };
  const handleLogout = async () => {
    await signOut();
    setUser(null);
    replaceMyOutfits([]);
    setMyPageOpen(false);
  };
  // 계정 삭제 자체는 계정 설정 화면에서 API로 끝난 상태다.
  const handleDeleteAccount = () => {
    setUser(null);
    setMyPageOpen(false);
  };

  const pageHeader = (
    <Header
      key={searchQuery ?? "home"}
      onHome={handleHome}
      recentlyViewed={recentlyViewed}
      favoriteProducts={favoriteProducts}
      searchQuery={searchQuery ?? ""}
      onSearch={setSearchQuery}
      onOpenLogin={openAccount}
      onSelectProduct={handleSelectProduct}
      onSelectFavoriteProduct={handleSelectProduct}
      favoriteOutfits={favoriteOutfits}
      onSelectFavoriteOutfit={(outfit) => setOpenOutfitId(outfit.id)}
      profile={profile}
      getLowestPrice={(product) => getShopPrices(product)[0].price}
    />
  );

  // 어느 화면에서나 뜰 수 있는 창: 로그인, 코디 상세
  const overlays = (
    <>
      {openOutfit && (
        <OutfitDetailModal
          item={openOutfit}
          favorited={outfitBookmarkIds.includes(openOutfit.id)}
          onToggleFavorite={() => handleToggleOutfitBookmark(openOutfit.id)}
          onClose={() => setOpenOutfitId(null)}
        />
      )}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onSuccess={handleLoginSuccess} />}
    </>
  );

  const renderPage = (page: ReactNode) => (
    <div className="min-h-screen bg-background text-foreground">
      {pageHeader}
      {page}
      {overlays}
    </div>
  );

  if (selectedProduct) {
    return renderPage(<ProductDetail key={selectedProduct.id} product={selectedProduct} onClose={() => setSelectedProduct(null)} wishlisted={wishlist.includes(selectedProduct.id)} onToggleWishlist={() => toggleWishlist(selectedProduct.id)} getShopPrices={getShopPrices} getPriceHistory={getPriceHistory} fmt={fmt} />);
  }

  if (searchQuery) {
    return renderPage(
      <ProductSearchPage
        query={searchQuery}
        onBack={handleHome}
        products={products}
        getShopPrices={getShopPrices}
        fmt={fmt}
        onSelectProduct={handleSelectProduct}
      />
    );
  }

  if (activeCollection) {
    return renderPage(
      <CollectionView
        collectionKey={activeCollection}
        products={products}
        getShopPrices={getShopPrices}
        fmt={fmt}
        collectionDefs={collectionDefs}
        onClose={() => setActiveCollection(null)}
        onSelectProduct={(p) => {
          handleSelectProduct(p);
          setActiveCollection(null);
        }}
      />
    );
  }

  if (footerPage) {
    return renderPage(<FooterPageModal page={footerPage} onClose={() => setFooterPage(null)} />);
  }

  if (myPageOpen && user) {
    return (
      <>
      <MyPage
        name={user.username}
        email={user.email}
        avatarUrl={null}
        role={user.role}
        outfitBookmarkIds={outfitBookmarkIds}
        myOutfits={myOutfits}
        myOutfitsError={myOutfitsError}
        myOutfitsHasMore={myOutfitsHasMore}
        onLoadMoreMyOutfits={() => void loadMoreMyOutfits()}
        savedOutfits={favoriteOutfits}
        onSelectOutfit={(outfit) => setOpenOutfitId(outfit.id)}
        favoriteProducts={favoriteProducts}
        recentlyViewed={recentlyViewed}
        getShopPrices={getShopPrices}
        fmt={fmt}
        onHome={handleHome}
        onLogout={handleLogout}
        onSelectProduct={handleSelectProduct}
        onUpdateProfile={setUser}
        onDeleteAccount={handleDeleteAccount}
        searchQuery={searchQuery ?? ""}
        onSearch={(query) => { setMyPageOpen(false); setSearchQuery(query); }}
        onOpenLogin={openAccount}
      />
      {overlays}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {overlays}

      {/* Announcement */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs tracking-widest">
        5만원 이상 구매 시 무료배송 · 신규 가입 10% 할인 코드{" "}
        <span className="font-semibold">DAILY10</span>
      </div>

      <Header
        key="home"
        onHome={handleHome}
        recentlyViewed={recentlyViewed}
        favoriteProducts={favoriteProducts}
        searchQuery={searchQuery ?? ""}
        onSearch={setSearchQuery}
        onOpenLogin={openAccount}
        onSelectProduct={handleSelectProduct}
        onSelectFavoriteProduct={handleSelectProduct}
        favoriteOutfits={favoriteOutfits}
        onSelectFavoriteOutfit={(outfit) => setOpenOutfitId(outfit.id)}
        profile={profile}
        getLowestPrice={(product) => getShopPrices(product)[0].price}
      />

      {/* Hero */}
      <section className="relative overflow-hidden px-3 md:px-5 pt-3">
        <div className="relative mx-auto max-w-[1400px] h-[300px] md:h-[380px] overflow-hidden">
          {banners.map((banner, index) => (
            <img
              key={banner.id}
              src={banner.img}
              alt={banner.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${index === activeBanner ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end pb-8 pl-6 md:pl-10 max-w-[560px]">
            <p className="text-white/70 text-[10px] md:text-xs tracking-[0.28em] uppercase mb-2 md:mb-3">{banners[activeBanner].subtitle}</p>
            <h1 className="text-white text-3xl md:text-5xl font-bold mb-2 md:mb-3 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {banners[activeBanner].title}
            </h1>
            <p className="text-white/80 text-xs md:text-sm mb-4 md:mb-6">{banners[activeBanner].desc}</p>
            <button
              className="inline-flex items-center gap-2 bg-white text-primary px-5 py-2.5 text-xs md:text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-colors w-fit"
              onClick={() => setActiveCollection(activeBanner === 1 ? "outer-new" : "weekly-best")}
            >
              {banners[activeBanner].cta} <ArrowRight size={16} />
            </button>
          </div>
          <div className="absolute bottom-4 right-6 md:right-8 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setActiveBanner(i)} aria-label={`배너 ${i + 1}`} aria-pressed={i === activeBanner} className={`w-6 h-0.5 transition-all duration-300 ${i === activeBanner ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Quick collection promos */}
      <section className="w-full px-3 md:px-5 pt-3">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 md:grid-cols-3 gap-3 md:gap-2">
          <div
            className="relative overflow-hidden bg-secondary h-[180px] md:h-[220px] w-full group cursor-pointer"
            {...clickable(() => setActiveCollection("outer-new"))}
          >
            <img
              src="https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?w=800&h=600&fit=crop&auto=format"
              alt="아우터 신상"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-white/70 text-[10px] tracking-[0.28em] uppercase mb-2">New Season · 아우터</p>
              <h3 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                아우터 신상
              </h3>
              <span className="inline-flex items-center gap-1.5 text-white text-xs font-semibold">
                컬렉션 보기 <ArrowRight size={12} />
              </span>
            </div>
          </div>

          <div
            className="relative overflow-hidden bg-secondary h-[180px] md:h-[220px] w-full group cursor-pointer"
            {...clickable(() => setActiveCollection("weekly-best"))}
          >
            <img
              src="https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=800&h=300&fit=crop&auto=format"
              alt="이번 주 베스트"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center text-center px-4">
              <div>
                <p className="text-white/70 text-[10px] tracking-[0.25em] uppercase mb-2">Best Seller</p>
                <h4 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  이번 주 베스트
                </h4>
                <span className="inline-flex items-center gap-1 text-white/80 text-[11px] font-medium">
                  {products.filter((p) => p.tag === "베스트").length}개 상품 <ArrowRight size={11} />
                </span>
              </div>
            </div>
          </div>

          <div
            className="relative overflow-hidden bg-secondary h-[180px] md:h-[220px] w-full group cursor-pointer"
            {...clickable(() => setActiveCollection("season-sale"))}
          >
            <img
              src="https://images.unsplash.com/photo-1645561305577-4cb5be67a40a?w=800&h=300&fit=crop&auto=format"
              alt="시즌 오프 세일"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center text-center px-4">
              <div>
                <p className="text-white/70 text-[10px] tracking-[0.25em] uppercase mb-2">Sale up to 40%</p>
                <h4 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  시즌 오프 세일
                </h4>
                <span className="inline-flex items-center gap-1 text-white/80 text-[11px] font-medium">
                  {products.filter((p) => p.tag === "SALE" || p.originalPrice !== null).length}개 할인 중 <ArrowRight size={11} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <main id="collection" className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 scroll-mt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-1">Collection</p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>패션 컬렉션</h2>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto pb-4 mb-8">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} aria-pressed={activeCategory === cat}
              className={`shrink-0 px-4 py-2 text-sm font-medium transition-all duration-200 border ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Product rail — 상품을 전부 가로로 이어서 보여준다 */}
        <div id="collection-product-rail" className="overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4 md:gap-6 min-w-max">
            {filtered.map((product) => {
              const cheapest = getShopPrices(product)[0];
              return (
                <div key={product.id} className="group cursor-pointer w-[220px] md:w-[260px]" {...clickable(() => handleSelectProduct(product))}>
                  <div className="relative overflow-hidden bg-secondary aspect-[4/5] mb-3">
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {product.tag && (
                      <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 tracking-widest ${
                        product.tag === "베스트" ? "bg-primary text-primary-foreground" :
                        product.tag === "SALE" ? "bg-destructive text-destructive-foreground" :
                        "bg-accent text-accent-foreground"
                      }`}>
                        {product.tag}
                      </span>
                    )}
                    <button
                      className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 hover:bg-white transition-colors"
                      aria-label={wishlist.includes(product.id) ? `${product.name} 찜 해제` : `${product.name} 찜하기`}
                      aria-pressed={wishlist.includes(product.id)}
                      onClick={(e) => toggleWishlist(product.id, e)}
                    >
                      <Heart size={16} className={wishlist.includes(product.id) ? "fill-destructive text-destructive" : "text-muted-foreground"} />
                    </button>
                    <div className="absolute bottom-2.5 left-2.5 bg-black/70 text-white text-[10px] px-2 py-1 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="text-accent font-bold">{cheapest.shop}</span> 최저
                    </div>
                  </div>
                  <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground mb-1">{product.brand}</p>
                  <p className="text-sm font-medium text-foreground mb-1 leading-snug">{product.name}</p>
                  <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">{product.subtitle}</p>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Star size={11} className="fill-accent text-accent" />
                    <span className="text-[11px] font-medium">{product.rating}</span>
                    <span className="text-[11px] text-muted-foreground">({product.reviews.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-2">
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
        </div>  
      </main>

      {/* 코디 피드 */}
      <OutfitFeedSection
        outfits={outfitFeed}
        loadError={outfitFeedError}
        hasMore={outfitFeedHasMore}
        onLoadMore={() => void loadMoreOutfits()}
        bookmarkedIds={outfitBookmarkIds}
        onToggleBookmark={handleToggleOutfitBookmark}
        onAddOutfit={handleAddOutfit}
        isLoggedIn={!!user}
        onRequireLogin={requireLogin}
        onSelectOutfit={(outfit) => setOpenOutfitId(outfit.id)}
      />

      {/* CTA — 가입·로그인 안내라서 로그인한 회원에게는 영역 전체를 보여주지 않는다. */}
      {!user && (
      <section className="bg-primary text-primary-foreground py-16 px-4 md:px-8 text-center">
        <p className="text-xs tracking-[0.3em] text-primary-foreground/50 uppercase mb-4">Members Only</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          D.aily 멤버십
        </h2>
        <p className="text-primary-foreground/70 text-sm md:text-base mb-8 max-w-md mx-auto">
          가입 즉시 10% 쿠폰 증정 · 가격 변동 알림 · 회원 전용 할인
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="bg-accent text-accent-foreground px-8 py-3 text-sm font-bold hover:opacity-90 transition-opacity" onClick={() => setLoginOpen(true)}>지금 가입하기</button>
          <button className="border border-primary-foreground/30 text-primary-foreground px-8 py-3 text-sm font-medium hover:border-primary-foreground transition-colors" onClick={() => setLoginOpen(true)}>로그인</button>
        </div>
      </section>
      )}

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <span className="text-xl font-bold block mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                D<span className="text-accent">.</span>aily
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">매일의 스타일을 발견하다.<br />최저가 비교부터 가격 추이까지,<br />스마트한 패션 쇼핑.</p>
            </div>
            {[
              {
                title: "쇼핑",
                links: [
                  { label: "신상품",     action: () => { setActiveCategory("신상품"); scrollToSection("collection"); } },
                  { label: "베스트셀러", action: () => setActiveCollection("weekly-best") },
                  { label: "세일",       action: () => setActiveCollection("season-sale") },
                  { label: "스타일 가이드", action: () => scrollToSection("outfit-feed") },
                ],
              },
              {
                title: "고객지원",
                links: [
                  { label: "주문 조회",       action: () => setFooterPage("주문 조회") },
                  { label: "배송 안내",       action: () => setFooterPage("배송 안내") },
                  { label: "교환·반품",       action: () => setFooterPage("교환·반품") },
                  { label: "자주 묻는 질문", action: () => setFooterPage("자주 묻는 질문") },
                  { label: "1:1 문의",        action: () => setFooterPage("1:1 문의") },
                ],
              },
              {
                title: "회사",
                links: [
                  { label: "회사 소개",         action: () => setFooterPage("회사 소개") },
                  { label: "이용약관",           action: () => setFooterPage("이용약관") },
                  { label: "개인정보처리방침",   action: () => setFooterPage("개인정보처리방침") },
                  { label: "파트너십",           action: () => setFooterPage("파트너십") },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold tracking-[0.15em] uppercase mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(({ label, action }) => (
                    <li key={label}>
                      <button
                        onClick={action}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            {/* TODO: 추후 복구 */}
            {/* <p className="text-xs text-muted-foreground">© 2025 D.aily. All rights reserved.</p> */}
            {/* <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>사업자등록번호 123-45-67890 | 대표 고재영</p> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
