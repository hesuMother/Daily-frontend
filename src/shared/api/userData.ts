import { now, nextId, saveTable, table, type CategoryRow } from "./db";
import { ApiError, getSessionUserId, read, requireSessionUserId, write } from "./storage";

export type NotificationSettings = Record<string, boolean>;

const defaultNotifications: NotificationSettings = { price: true, style: true, order: true, marketing: false };
const HISTORY_LIMIT = 10;

// ─── categories ──────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<CategoryRow[]> {
  return table("categories");
}

// ─── product_bookmarks (찜 목록) ──────────────────────────────────────────────

// 찜한 상품의 링크 목록. 비회원이면 빈 목록이다.
export async function fetchProductBookmarks(): Promise<string[]> {
  const userId = getSessionUserId();
  return table("product_bookmarks")
    .filter((r) => r.user_id === userId && !r.is_deleted)
    .map((r) => r.product_bookmark_product_link);
}

// 찜 상태를 뒤집고, 바뀐 뒤의 찜 여부를 돌려준다.
export async function toggleProductBookmark(product: { name: string; link: string }): Promise<boolean> {
  const userId = requireSessionUserId();
  const rows = table("product_bookmarks");
  const existing = rows.find((r) => r.user_id === userId && !r.is_deleted && r.product_bookmark_product_link === product.link);
  if (existing) {
    saveTable("product_bookmarks", rows.map((r) => (r === existing ? { ...r, is_deleted: true } : r)));
    return false;
  }
  saveTable("product_bookmarks", [...rows, {
    product_bookmark_id: nextId(rows, (r) => r.product_bookmark_id),
    user_id: userId,
    product_bookmark_product_name: product.name,
    product_bookmark_product_link: product.link,
    is_deleted: false,
    created_at: now(),
  }]);
  return true;
}

// ─── product_histories (최근 본 상품) ─────────────────────────────────────────

// 최근 본 상품의 링크 목록(최신순). 비회원이면 빈 목록이다.
export async function fetchProductHistories(): Promise<string[]> {
  const userId = getSessionUserId();
  return table("product_histories")
    .filter((r) => r.user_id === userId && !r.is_deleted)
    .sort((a, b) => b.product_id - a.product_id)
    .slice(0, HISTORY_LIMIT)
    .map((r) => r.product_link);
}

// 비회원의 조회 기록은 저장하지 않는다.
export async function addProductHistory(productLink: string): Promise<void> {
  const userId = getSessionUserId();
  if (userId === null) return;
  const rows = table("product_histories").map((r) =>
    r.user_id === userId && r.product_link === productLink ? { ...r, is_deleted: true } : r,
  );
  saveTable("product_histories", [...rows, {
    product_id: nextId(rows, (r) => r.product_id),
    user_id: userId,
    product_link: productLink,
    is_deleted: false,
    created_at: now(),
  }]);
}

// ─── 알림 설정 (ERD에 없음) ───────────────────────────────────────────────────

export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  return { ...defaultNotifications, ...read<NotificationSettings>(`notifications:${getSessionUserId()}`, {}) };
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  write(`notifications:${requireSessionUserId()}`, settings);
}

// ─── 이미지 업로드 ────────────────────────────────────────────────────────────

// 서버가 없으므로 이미지를 줄여 data URL로 돌려준다. 백엔드 연결 시 업로드 후 URL을 반환하도록 바꾼다.
export function uploadImage(file: File, maxSize = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new ApiError("이미지를 처리할 수 없습니다.")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new ApiError("이미지를 불러올 수 없습니다."));
    };
    img.src = blobUrl;
  });
}
