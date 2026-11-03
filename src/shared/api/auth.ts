import { authPost, endSession, getDeviceId, refreshSession, startSession } from "./client";
import { ApiError } from "./storage";
import type { AuthResponse, User } from "./types";

export type { User } from "./types";
export type SocialProvider = "kakao" | "google";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
const PASSWORD_MIN = 12;
const PASSWORD_MAX = 128;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

function notSupported(feature: string): never {
  throw new ApiError(`${feature}은(는) 아직 지원하지 않습니다.`);
}

// accessToken은 메모리에만 있으므로 새로고침하면 refresh 쿠키로 복원한다. 쿠키가 없으면 비회원이다.
export async function getSession(): Promise<User | null> {
  try {
    return (await refreshSession()).user;
  } catch {
    return null;
  }
}

export async function signUp(input: { username: string; email: string; password: string }): Promise<User> {
  const username = input.username.trim().toLowerCase();
  const email = normalizeEmail(input.email);
  if (!USERNAME_PATTERN.test(username)) throw new ApiError("아이디는 영문 소문자, 숫자, 밑줄(_)로 3~30자여야 합니다.");
  if (!EMAIL_PATTERN.test(email)) throw new ApiError("올바른 이메일 주소를 입력해주세요.");
  if (input.password.length < PASSWORD_MIN || input.password.length > PASSWORD_MAX) throw new ApiError(`비밀번호는 ${PASSWORD_MIN}~${PASSWORD_MAX}자여야 합니다.`);

  try {
    const auth = await authPost<AuthResponse>("/v1/auth/register", { username, email, password: input.password, deviceId: getDeviceId() });
    startSession(auth);
    return auth.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) throw new ApiError("이미 사용 중인 이메일 또는 아이디입니다.", 409);
    throw error;
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const auth = await authPost<AuthResponse>("/v1/auth/login", { email: normalizeEmail(email), password, deviceId: getDeviceId() });
    startSession(auth);
    return auth.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) throw new ApiError("이메일 또는 비밀번호가 올바르지 않습니다.", 401);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    await authPost("/v1/auth/logout");
  } finally {
    endSession();
  }
}

// 아래 기능은 아직 백엔드 API가 없다. 성공한 것처럼 보이지 않도록 안내만 한다.
export async function signInWithSocial(provider: SocialProvider): Promise<User> {
  notSupported(provider === "kakao" ? "카카오 로그인" : "Google 로그인");
}

export async function requestPasswordReset(email: string): Promise<void> {
  void email;
  notSupported("비밀번호 재설정");
}

export async function updateProfile(input: { name: string; email: string; avatarUrl: string | null }): Promise<User> {
  void input;
  notSupported("프로필 수정");
}

export async function changePassword(currentPassword: string, nextPassword: string): Promise<void> {
  void currentPassword;
  void nextPassword;
  notSupported("비밀번호 변경");
}

export async function deleteAccount(): Promise<void> {
  notSupported("회원 탈퇴");
}
