import type { DailyProduct } from "../../app/App";
import { api, apiBlob } from "./client";
import { nextId, saveTable, table } from "./db";
import { toDailyProduct } from "./mappers";
import { ApiError, getSessionUserId, requireSessionUserId } from "./storage";
import type { ApiOutfit, OutfitItemType, Page, ProductSummary } from "./types";

const PAGE_LIMIT = 50;
const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ITEMS_MAX = 20;
export const IMAGE_ACCEPT = IMAGE_TYPES.join(",");

export const ITEM_TYPE_LABELS: Record<OutfitItemType, string> = {
  TOP: "상의",
  BOTTOM: "하의",
  OUTER: "아우터",
  SHOES: "신발",
  BAG: "가방",
  ACCESSORY: "액세서리",
  ETC: "기타",
};

// 코디에 담을 아이템. productId가 있으면 카탈로그 상품, 없으면 직접 입력한 아이템이다.
export interface OutfitItemInput {
  type: OutfitItemType;
  name: string;
  link?: string;
  productId?: string;
  offerId?: string;
}

export interface OutfitInput {
  image: File;
  name: string;
  description: string;
  height: string;
  weight: string;
  items: OutfitItemInput[];
}

const toPage = (page: Page<ApiOutfit>): Page<DailyProduct> => ({ ...page, items: page.items.map(toDailyProduct) });

// 비공개 코디 사진은 <img>로 토큰을 보낼 수 없어 Blob URL로 바꾼다. 다 쓰면 revokeOutfitImages로 해제한다.
async function withPrivateImage(row: ApiOutfit): Promise<DailyProduct> {
  const blob = await apiBlob(row.imageUrl);
  return { ...toDailyProduct(row), img: URL.createObjectURL(blob) };
}

export function revokeOutfitImages(outfits: DailyProduct[]) {
  outfits.forEach((outfit) => { if (outfit.img.startsWith("blob:")) URL.revokeObjectURL(outfit.img); });
}

// ─── 코디 조회 ────────────────────────────────────────────────────────────────

export async function fetchOutfits(page = 1): Promise<Page<DailyProduct>> {
  return toPage(await api<Page<ApiOutfit>>(`/v1/outfits?page=${page}&limit=${PAGE_LIMIT}`));
}

// 반려 사유는 상세 조회에만 있어서 반려된 코디만 한 번 더 불러온다.
async function myOutfit(row: ApiOutfit): Promise<DailyProduct> {
  if (row.status === "APPROVED") return toDailyProduct(row);
  const detail = row.status === "REJECTED" ? await api<ApiOutfit>(`/v1/outfits/${row.id}`) : row;
  return withPrivateImage(detail);
}

export async function fetchMyOutfits(page = 1): Promise<Page<DailyProduct>> {
  const result = await api<Page<ApiOutfit>>(`/v1/outfits/mine?page=${page}&limit=${PAGE_LIMIT}`);
  return { ...result, items: await Promise.all(result.items.map(myOutfit)) };
}

// ─── 코디 등록 ────────────────────────────────────────────────────────────────

// 키와 몸무게는 필수다. 문제가 있으면 안내 문구를, 없으면 null을 돌려준다.
export function bodyInfoError(height: string, weight: string): string | null {
  const h = Number(height);
  const w = Number(weight);
  if (height === "" || !Number.isInteger(h) || h < 50 || h > 250) return "키는 50~250cm 사이의 정수로 입력해주세요.";
  if (weight === "" || !Number.isInteger(w) || w < 10 || w > 400) return "몸무게는 10~400kg 사이의 정수로 입력해주세요.";
  return null;
}

export function imageFileError(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return "JPG, PNG, WEBP 사진만 올릴 수 있습니다.";
  if (file.size > IMAGE_MAX_BYTES) return "사진은 8MB 이하만 올릴 수 있습니다.";
  return null;
}

// 등록한 코디는 관리자가 승인하기 전까지 PENDING이라 공개 피드에 나오지 않는다.
export async function createOutfit(input: OutfitInput): Promise<DailyProduct> {
  const name = input.name.trim();
  if (!name) throw new ApiError("코디 이름을 입력해주세요.");
  if (input.items.length === 0) throw new ApiError("상품을 1개 이상 추가해주세요.");
  const bodyError = bodyInfoError(input.height, input.weight);
  if (bodyError) throw new ApiError(bodyError);

  const data = {
    name,
    description: input.description.trim() || undefined,
    height: Number(input.height),
    weight: Number(input.weight),
    items: input.items.map(({ type, name: itemName, link, productId, offerId }) =>
      productId ? { type, productId, offerId } : { type, name: itemName, link: link || undefined },
    ),
  };
  const form = new FormData();
  form.append("image", input.image);
  form.append("data", JSON.stringify(data));
  return withPrivateImage(await api<ApiOutfit>("/v1/outfits", { method: "POST", body: form }));
}

// ─── 코디용 상품 검색 ─────────────────────────────────────────────────────────

export async function searchOutfitProducts(query: string, page = 1): Promise<Page<ProductSummary>> {
  const params = new URLSearchParams({ source: "all", page: String(page), limit: "20" });
  if (query) params.set("q", query);
  const result = await api<Page<{ productId: string; product: ProductSummary }>>(`/v1/outfits/products?${params}`);
  return { ...result, items: result.items.map((item) => item.product) };
}

// ─── 관리자 검수 ──────────────────────────────────────────────────────────────

export async function fetchPendingOutfits(page = 1): Promise<Page<DailyProduct>> {
  const result = await api<Page<ApiOutfit>>(`/v1/admin/outfits?page=${page}&limit=${PAGE_LIMIT}`);
  return { ...result, items: await Promise.all(result.items.map(withPrivateImage)) };
}

export async function reviewOutfit(outfitId: string, review: { status: "APPROVED" } | { status: "REJECTED"; reason: string }): Promise<void> {
  await api(`/v1/admin/outfits/${outfitId}/review`, { method: "POST", body: JSON.stringify(review) });
}

// ─── outfit_bookmarks (코디 저장) ─────────────────────────────────────────────

// 코디 저장 API가 아직 없어 이 브라우저에만 저장한다. 비회원이면 빈 목록이다.
export async function fetchOutfitBookmarks(): Promise<string[]> {
  const userId = getSessionUserId();
  return table("outfit_bookmarks")
    .filter((r) => r.bookmark_user_id === userId && !r.is_deleted)
    .map((r) => r.outfit_id);
}

// 저장 상태를 뒤집고, 바뀐 뒤의 저장 여부를 돌려준다.
export async function toggleOutfitBookmark(outfitId: string): Promise<boolean> {
  const userId = requireSessionUserId();
  const rows = table("outfit_bookmarks");
  const existing = rows.find((r) => r.bookmark_user_id === userId && !r.is_deleted && r.outfit_id === outfitId);
  if (existing) {
    saveTable("outfit_bookmarks", rows.map((r) => (r === existing ? { ...r, is_deleted: true } : r)));
    return false;
  }
  saveTable("outfit_bookmarks", [...rows, {
    outfit_bookmark_id: nextId(rows, (r) => r.outfit_bookmark_id),
    outfit_id: outfitId,
    bookmark_user_id: userId,
    is_deleted: false,
    created_at: new Date().toISOString(),
  }]);
  return true;
}
