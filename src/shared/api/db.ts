// API가 없는 기능을 위해 localStorage에 남겨둔 테이블. 처음에는 아래 시드 데이터로 채워진다.
// 백엔드가 지원하면 이 파일의 해당 테이블을 지우고 API 호출로 바꾼다.

import { read, write } from "./storage";

// ─── Row types ───────────────────────────────────────────────────────────────

export interface CategoryRow {
  category_id: number;
  category_name: string;
  created_at: string;
}

export interface OutfitBookmarkRow {
  outfit_bookmark_id: number;
  outfit_id: string;
  bookmark_user_id: string;
  is_deleted: boolean;
  created_at: string;
}

export interface ProductBookmarkRow {
  product_bookmark_id: number;
  user_id: string;
  product_bookmark_product_name: string;
  product_bookmark_product_link: string;
  is_deleted: boolean;
  created_at: string;
}

export interface ProductHistoryRow {
  product_id: number; // 상품 ID가 아니라 기록 ID다
  user_id: string;
  product_link: string;
  is_deleted: boolean;
  created_at: string;
}

interface Tables {
  categories: CategoryRow[];
  outfit_bookmarks: OutfitBookmarkRow[];
  product_bookmarks: ProductBookmarkRow[];
  product_histories: ProductHistoryRow[];
}

// ─── 상품 링크 ────────────────────────────────────────────────────────────────

// 홈 화면 상품은 아직 목업이라 상품 API의 UUID와 연결되지 않는다. 찜과 최근 본 상품은 링크로만 참조한다.
export const productLink = (productId: number) => `https://daily.kr/products/${productId}`;

export function productIdFromLink(link: string | null): number | null {
  const match = link?.match(/\/products\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

// ─── Seed ────────────────────────────────────────────────────────────────────

const SEED_AT = "2026-09-01T00:00:00.000Z";

const seed: Tables = {
  categories: ["상의", "하의", "아우터"].map((category_name, i) => ({ category_id: i + 1, category_name, created_at: SEED_AT })),
  outfit_bookmarks: [],
  product_bookmarks: [],
  product_histories: [],
};

// ─── Table access ────────────────────────────────────────────────────────────

export function table<K extends keyof Tables>(name: K): Tables[K] {
  return read(`db:${name}`, seed[name]);
}

export function saveTable<K extends keyof Tables>(name: K, rows: Tables[K]) {
  write(`db:${name}`, rows);
}

export function nextId<T>(rows: T[], id: (row: T) => number): number {
  return rows.reduce((max, row) => Math.max(max, id(row)), 0) + 1;
}

export const now = () => new Date().toISOString();
