import { api } from "./client";
import type { AdminReport, Category, Page, Report, TargetType } from "./types";

export type ReportAction = "NONE" | "HIDE_OUTFIT" | "HIDE_PRODUCT";

export async function fetchReportCategories(): Promise<Category[]> {
  return api<Category[]>("/v1/reports/categories");
}

export async function createReport(input: { categoryId: string; reason: string; description: string; targetType: TargetType; targetId: string }): Promise<Report> {
  const body = { ...input, reason: input.reason.trim(), description: input.description.trim() || undefined };
  return api<Report>("/v1/reports", { method: "POST", body: JSON.stringify(body) });
}

export async function fetchReports(page = 1): Promise<Page<AdminReport>> {
  return api<Page<AdminReport>>(`/v1/admin/reports?page=${page}&limit=50`);
}

// expectedStatus는 화면에 보이던 상태다. 다른 관리자가 먼저 처리했으면 서버가 409로 거부한다.
export async function updateReportStatus(reportId: string, input: {
  expectedStatus: "PENDING" | "REVIEWING";
  status: "REVIEWING" | "RESOLVED" | "REJECTED";
  note: string;
  action?: ReportAction;
}): Promise<AdminReport> {
  return api<AdminReport>(`/v1/admin/reports/${reportId}/status`, { method: "PATCH", body: JSON.stringify(input) });
}
