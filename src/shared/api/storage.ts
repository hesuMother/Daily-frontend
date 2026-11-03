// API가 없는 기능(코디 저장, 찜, 알림 설정 등)은 localStorage에 저장한다.
// 로그인 정보는 여기에 저장하지 않는다. accessToken과 세션은 client.ts의 메모리에만 둔다.

const PREFIX = "daily:";

// status는 서버가 돌려준 HTTP 상태 코드다. 401: 로그인 필요, 403: 권한 없음, 404: 대상 없음
export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    throw new ApiError("저장 공간이 부족해 저장하지 못했습니다.");
  }
}

let sessionUserId: string | null = null;

export function setSessionUserId(userId: string | null) {
  sessionUserId = userId;
}

export function getSessionUserId(): string | null {
  return sessionUserId;
}

export function requireSessionUserId(): string {
  if (sessionUserId === null) throw new ApiError("로그인이 필요합니다.", 401);
  return sessionUserId;
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}
