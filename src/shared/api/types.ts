// 백엔드 응답 타입. API 명세서의 공통 타입과 이름을 맞췄다.

export type UserRole = "USER" | "ADMIN" | "MODERATOR";
export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type OutfitItemType = "TOP" | "BOTTOM" | "OUTER" | "SHOES" | "BAG" | "ACCESSORY" | "ETC";
export type ReportStatus = "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED";
export type TargetType = "OUTFIT" | "USER" | "PRODUCT" | "PRODUCT_OFFER" | "PRODUCT_HISTORY" | "PRODUCT_BOOKMARK";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  deviceId: string;
  user: User;
}

export interface Page<T> {
  items: T[];
  page: number;
  hasMore: boolean;
}

export interface OutfitItem {
  id: string;
  type: OutfitItemType;
  name: string;
  link: string | null;
  productId: string | null;
  offerId: string | null;
  sortOrder: number;
}

export interface ApiOutfit {
  id: string;
  authorId: string | null;
  name: string;
  description: string | null;
  height: number;
  weight: number;
  imageUrl: string;
  status: ModerationStatus;
  createdAt: string;
  updatedAt: string;
  author: { id: string; username: string; profileImageUrl: string | null } | null;
  items: OutfitItem[];
  rejectionLog?: { reason: string; reviewedAt: string }[];
}

export interface ProductSummary {
  id: string;
  name: string;
  images: { imageUrl: string }[];
  offers: {
    id: string;
    price: number | null;
    currency: string;
    purchaseUrl: string | null;
    isSoldOut: boolean | null;
    seller: { name: string };
  }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Report {
  id: string;
  reason: string;
  description: string | null;
  targetType: TargetType;
  targetId: string;
  status: ReportStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export interface AdminReport extends Report {
  adminNote: string | null;
  reporter: { id: string; username: string; email: string } | null;
}
