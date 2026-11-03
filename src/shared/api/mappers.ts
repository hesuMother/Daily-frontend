// API 응답과 화면에서 쓰는 타입 사이의 변환

import type { DailyProduct } from "../../app/App";
import { apiUrl } from "./client";
import type { ApiOutfit } from "./types";

export function toDailyProduct(row: ApiOutfit): DailyProduct {
  return {
    id: row.id,
    name: row.name,
    img: apiUrl(row.imageUrl),
    height: String(row.height),
    weight: String(row.weight),
    items: row.items,
    desc: row.description ?? "",
    status: row.status,
    authorName: row.author?.username ?? "탈퇴한 회원",
    rejectionReason: row.rejectionLog?.[0]?.reason ?? null,
  };
}
