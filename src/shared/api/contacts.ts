import { api } from "./client";
import type { Category } from "./types";

export async function fetchContactCategories(): Promise<Category[]> {
  return api<Category[]>("/v1/contacts/categories");
}

export async function createContact(input: { categoryId: string; reason: string; description: string }): Promise<void> {
  const body = { ...input, reason: input.reason.trim(), description: input.description.trim() || undefined };
  await api("/v1/contacts", { method: "POST", body: JSON.stringify(body) });
}
