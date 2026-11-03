// 백엔드 호출 공통 처리. accessToken은 메모리에만 두고, refresh 쿠키는 브라우저가 관리한다.

import { ApiError, read, setSessionUserId, write } from "./storage";
import type { AuthResponse } from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const REFRESH_LOCK = "daily-auth-refresh";

const STATUS_MESSAGES: Record<number, string> = {
  401: "로그인이 필요합니다.",
  403: "접근 권한이 없습니다.",
  404: "대상을 찾을 수 없습니다.",
  409: "이미 처리되었습니다. 새로고침 후 다시 시도해주세요.",
  429: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  503: "서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.",
};

let accessToken: string | null = null;
let refreshing: Promise<AuthResponse> | undefined;
let notifySessionExpired = () => {};

export const apiUrl = (path: string) => `${API_BASE}${path}`;

// 로그인 중에 세션이 끊기면 화면을 로그아웃 상태로 바꿀 수 있게 알려준다.
export function onSessionExpired(callback: () => void) {
  notifySessionExpired = callback;
}

export function getDeviceId(): string {
  const saved = read<string | null>("device-id", null);
  if (saved) return saved;
  const deviceId = crypto.randomUUID();
  write("device-id", deviceId);
  return deviceId;
}

export function startSession(auth: AuthResponse) {
  accessToken = auth.accessToken;
  setSessionUserId(auth.user.id);
}

export function endSession() {
  accessToken = null;
  setSessionUserId(null);
}

async function toApiError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
  const message = Array.isArray(body?.message) ? body.message.join(" ") : body?.message;
  return new ApiError(STATUS_MESSAGES[res.status] ?? message ?? "요청을 처리하지 못했습니다.", res.status);
}

// /v1/auth/*의 POST 전용. 로그인 실패의 401은 토큰 만료가 아니므로 refresh 재시도를 하지 않는다.
export async function authPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    credentials: "include",
    headers: { "X-Auth-Request": "1", ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as T;
}

// 이미 쓴 refresh 쿠키를 다시 보내면 서버가 세션을 폐기하므로, 다른 탭과도 한 번에 하나씩만 보낸다.
function requestRefresh(): Promise<AuthResponse> {
  const run = () => authPost<AuthResponse>("/v1/auth/refresh");
  return navigator.locks ? navigator.locks.request(REFRESH_LOCK, run) : run();
}

export function refreshSession(): Promise<AuthResponse> {
  refreshing ??= requestRefresh()
    .then((auth) => {
      startSession(auth);
      return auth;
    })
    .catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401 && accessToken !== null) {
        endSession();
        notifySessionExpired();
      }
      throw error;
    })
    .finally(() => {
      refreshing = undefined;
    });
  return refreshing;
}

async function send(path: string, init: RequestInit, retry = true): Promise<Response> {
  await refreshing?.catch(() => undefined);
  const usedToken = accessToken;
  const headers = new Headers(init.headers);
  if (usedToken) headers.set("Authorization", `Bearer ${usedToken}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");

  const res = await fetch(apiUrl(path), { ...init, headers, credentials: "include" });
  if (res.status !== 401 || !retry || !usedToken) return res;

  // 기다리는 사이 다른 요청이 이미 갱신했다면 새 토큰으로 재시도만 한다.
  if (accessToken === usedToken) await refreshSession();
  return send(path, init, false);
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await send(path, init);
  if (!res.ok) throw await toApiError(res);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export async function apiBlob(path: string): Promise<Blob> {
  const res = await send(path, {});
  if (!res.ok) throw await toApiError(res);
  return res.blob();
}
