import { useState, useRef, useEffect } from "react";
import type React from "react";
import { X, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { requestPasswordReset, signIn, signInWithSocial, signUp, type User } from "../../shared/api/auth";
import { errorMessage } from "../../shared/api/storage";

type LoginView = "social" | "email" | "signup" | "forgot";

function LMField({ id, label, type, value, onChange, placeholder, autoFocus, suffix, onEnter }: { id: string; label: string; type: string; value: string; onChange: (value: string) => void; placeholder: string; autoFocus?: boolean; suffix?: React.ReactNode; onEnter?: () => void }) {
  const [focused, setFocused] = useState(false);
  return <div><label htmlFor={id} className="block text-[10.5px] font-bold tracking-[0.14em] uppercase mb-1.5" style={{ color: "#7A7269" }}>{label}</label><div className="relative"><input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }} className="w-full py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all" style={{ borderRadius: "4px", paddingLeft: "14px", paddingRight: suffix ? "42px" : "14px", borderColor: focused ? "#0F0E0D" : "rgba(15,14,13,0.16)", boxShadow: focused ? "0 0 0 2.5px rgba(15,14,13,0.07)" : "none" }} />{suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">{suffix}</div>}</div></div>;
}

function LMPwToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) { return <button type="button" tabIndex={-1} onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{show ? <EyeOff size={14} /> : <Eye size={14} />}</button>; }

function LMSocialBtn({ onClick, bgColor, textColor, hoverBg, border, children }: { onClick?: () => void; bgColor: string; textColor: string; hoverBg?: string; border?: string; children: React.ReactNode }) { const [hov, setHov] = useState(false); return <button type="button" onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} className="w-full h-[46px] flex items-center justify-center gap-2.5 text-[13px] font-semibold cursor-pointer transition-colors active:scale-[0.998]" style={{ borderRadius: "5px", backgroundColor: hov && hoverBg ? hoverBg : bgColor, color: textColor, border: border ?? "none" }}>{children}</button>; }

function LMPrimaryBtn({ children, onClick, disabled, type = "button" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) { const [hov, setHov] = useState(false); return <button type={type} onClick={onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} className="w-full h-[46px] text-[13px] font-bold cursor-pointer active:scale-[0.998] disabled:opacity-30 disabled:cursor-not-allowed transition-colors" style={{ borderRadius: "5px", backgroundColor: hov && !disabled ? "#2a2928" : "#0F0E0D", color: "#FAF8F5" }}>{children}</button>; }

function LMOutlineBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) { const [hov, setHov] = useState(false); return <button type="button" onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} className="w-full h-[46px] text-[13px] font-medium cursor-pointer active:scale-[0.998] transition-colors" style={{ borderRadius: "5px", border: `1px solid ${hov ? "#0F0E0D" : "rgba(15,14,13,0.2)"}`, backgroundColor: hov ? "#F0EDE8" : "transparent", color: "#0F0E0D" }}>{children}</button>; }

function KakaoIcon() { return <svg width="18" height="18" viewBox="0 0 38 36" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M19 0C8.507 0 0 6.716 0 15c0 5.234 2.988 9.84 7.556 12.732L5.7 35.7l9.19-5.202A21.6 21.6 0 0 0 19 30c10.493 0 19-6.716 19-15S29.493 0 19 0z" fill="#3C1E1E" /></svg>; }
function GoogleIcon() { return <svg width="17" height="17" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" /><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" /></svg>; }
function LMError({ message }: { message: string }) { return message ? <p role="alert" className="text-[12px]" style={{ color: "#b34b42" }}>{message}</p> : null; }

export function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (user: User) => void }) {
  const [view, setView] = useState<LoginView>("social");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [username, setUsername] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const apply = () => {
      el.style.borderRadius = window.innerWidth >= 640 ? "6px" : "12px 12px 0 0";
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const goTo = (v: LoginView) => {
    setView(v);
    setShowPw(false);
    setShowConfirmPw(false);
    setError("");
  };

  const submit = async (action: () => Promise<User>) => {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      onSuccess(await action());
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  const handleSignup = () => {
    if (password !== confirmPw) { setError("비밀번호가 일치하지 않습니다."); return; }
    void submit(() => signUp({ username, email, password }));
  };

  const handleReset = async () => {
    if (sent || busy) return;
    setError("");
    setBusy(true);
    try {
      await requestPasswordReset(resetEmail);
      setSent(true);
    } catch (e) {
      setError(errorMessage(e));
    }
    setBusy(false);
  };

  const P = "px-7 pb-8 pt-5";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-5"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        style={{ backdropFilter: "blur(1.5px)" }}
      />

      {/* Card */}
      <div
        ref={cardRef}
        className="relative bg-background w-full sm:max-w-[400px] z-10 overflow-hidden"
        style={{
          borderRadius: "12px 12px 0 0",
          border: "1px solid rgba(15,14,13,0.11)",
          boxShadow: "0 -4px 30px rgba(0,0,0,0.07), 0 24px 64px rgba(0,0,0,0.2)",
        }}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-0.5">
          <div className="w-9 h-[3px]" style={{ borderRadius: "2px", backgroundColor: "rgba(15,14,13,0.14)" }} />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3.5 right-4 z-20 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X size={17} strokeWidth={1.8} />
        </button>

        {/* Promo banner */}
        <div className="text-center py-2.5 px-10 text-[11px] tracking-[0.09em]" style={{ backgroundColor: "#0F0E0D", color: "#FAF8F5" }}>
          신규 가입 시{" "}
          <span className="font-bold" style={{ color: "#C4A97B" }}>최대 10% 할인</span>
          {" "}쿠폰 즉시 증정
        </div>

        {/* ── Social ───────────────────────────────────────── */}
        {view === "social" && (
          <div className={`${P} space-y-2.5`}>
            <div className="text-center mb-5 mt-1.5">
              <span className="text-[22px] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                D<span style={{ color: "#C4A97B" }}>.</span>aily
              </span>
              <p className="text-[14px] font-bold mt-0.5 tracking-tight">로그인 또는 회원가입</p>
              <p className="text-[12px] mt-1" style={{ color: "#7A7269" }}>D.aily에 오신 걸 환영합니다</p>
            </div>

            <LMSocialBtn onClick={() => submit(() => signInWithSocial("kakao"))} bgColor="#FEE500" textColor="#3C1E1E" hoverBg="#F5DC00">
              <KakaoIcon />
              카카오로 계속하기
            </LMSocialBtn>

            <LMSocialBtn onClick={() => submit(() => signInWithSocial("google"))} bgColor="#ffffff" textColor="#0F0E0D" hoverBg="#F0EDE8" border="1px solid rgba(15,14,13,0.18)">
              <GoogleIcon />
              Google로 계속하기
            </LMSocialBtn>

            <LMError message={error} />

            {/* Divider */}
            <div className="flex items-center gap-3 py-0.5">
              <div className="flex-1 h-px" style={{ backgroundColor: "rgba(15,14,13,0.1)" }} />
              <span className="text-[11px] tracking-wider" style={{ color: "#B0A89E" }}>또는</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "rgba(15,14,13,0.1)" }} />
            </div>

            <LMOutlineBtn onClick={() => goTo("email")}>이메일로 로그인</LMOutlineBtn>

            <p className="text-center text-[12px] pt-0.5" style={{ color: "#7A7269" }}>
              계정이 없으신가요?{" "}
              <button
                type="button"
                onClick={() => goTo("signup")}
                className="font-bold underline underline-offset-2 hover:opacity-60 transition-opacity cursor-pointer"
                style={{ color: "#0F0E0D" }}
              >
                무료 가입
              </button>
            </p>
          </div>
        )}

        {/* ── Email login ───────────────────────────────────── */}
        {view === "email" && (
          <form className={`${P} space-y-4`} onSubmit={(e) => { e.preventDefault(); if (email && password) void submit(() => signIn(email, password)); }}>
            <button
              type="button"
              onClick={() => goTo("social")}
              className="flex items-center gap-1 text-[11px] hover:text-foreground transition-colors cursor-pointer mb-1"
              style={{ color: "#7A7269" }}
            >
              <ChevronLeft size={12} strokeWidth={2.5} />
              다른 방법으로 로그인
            </button>

            <div>
              <h2 className="text-[17px] font-bold tracking-tight">이메일 로그인</h2>
              <p className="text-[12px] mt-0.5" style={{ color: "#7A7269" }}>
                이메일 주소와 비밀번호를 입력해 주세요
              </p>
            </div>

            <LMField id="lm-email" label="이메일" type="email" value={email} onChange={setEmail}
              placeholder="example@email.com" autoFocus />

            <LMField id="lm-pw" label="비밀번호" type={showPw ? "text" : "password"}
              value={password} onChange={setPassword} placeholder="비밀번호 입력"
              suffix={<LMPwToggle show={showPw} onToggle={() => setShowPw((p) => !p)} />} />

            <LMError message={error} />

            <LMPrimaryBtn type="submit" disabled={busy}>로그인</LMPrimaryBtn>

            <div className="flex items-center justify-between text-[12px] pt-0.5">
              <button type="button" onClick={() => goTo("forgot")}
                className="underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer"
                style={{ color: "#7A7269" }}>
                비밀번호 찾기
              </button>
              <button type="button" onClick={() => goTo("signup")}
                className="font-bold underline underline-offset-2 hover:opacity-60 transition-opacity cursor-pointer"
                style={{ color: "#0F0E0D" }}>
                회원가입
              </button>
            </div>
          </form>
        )}

        {/* ── Signup ───────────────────────────────────────── */}
        {view === "signup" && (
          <form className={`${P} space-y-3`} onSubmit={(e) => { e.preventDefault(); if (agreed) handleSignup(); }}>
            <button type="button" onClick={() => goTo("social")}
              className="flex items-center gap-1 text-[11px] hover:text-foreground transition-colors cursor-pointer mb-1"
              style={{ color: "#7A7269" }}>
              <ChevronLeft size={12} strokeWidth={2.5} />
              뒤로가기
            </button>

            <div>
              <h2 className="text-[17px] font-bold tracking-tight">회원가입</h2>
              <p className="text-[12px] mt-0.5" style={{ color: "#7A7269" }}>
                가입 즉시 10% 할인 쿠폰이 자동으로 발급됩니다
              </p>
            </div>

            <LMField id="su-name" label="아이디" type="text" value={username} onChange={setUsername}
              placeholder="영문 소문자, 숫자, 밑줄 3~30자" autoFocus />
            <LMField id="su-email" label="이메일" type="email" value={email} onChange={setEmail}
              placeholder="example@email.com" />
            <LMField id="su-pw" label="비밀번호" type={showPw ? "text" : "password"}
              value={password} onChange={setPassword} placeholder="12자 이상"
              suffix={<LMPwToggle show={showPw} onToggle={() => setShowPw((p) => !p)} />} />
            <LMField id="su-cpw" label="비밀번호 확인" type={showConfirmPw ? "text" : "password"}
              value={confirmPw} onChange={setConfirmPw} placeholder="비밀번호 재입력"
              suffix={<LMPwToggle show={showConfirmPw} onToggle={() => setShowConfirmPw((p) => !p)} />} />

            <label className="flex items-start gap-2.5 cursor-pointer pt-0.5">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 shrink-0 cursor-pointer" style={{ accentColor: "#0F0E0D" }} />
              <span className="text-[12px] leading-relaxed" style={{ color: "#7A7269" }}>
                <button type="button" className="underline hover:opacity-60 transition-opacity cursor-pointer" style={{ color: "#0F0E0D" }}>
                  이용약관
                </button>
                {" "}및{" "}
                <button type="button" className="underline hover:opacity-60 transition-opacity cursor-pointer" style={{ color: "#0F0E0D" }}>
                  개인정보처리방침
                </button>
                에 동의합니다
              </span>
            </label>

            <LMError message={error} />

            <LMPrimaryBtn type="submit" disabled={!agreed || busy}>가입하기</LMPrimaryBtn>

            <p className="text-center text-[12px]" style={{ color: "#7A7269" }}>
              이미 계정이 있으신가요?{" "}
              <button type="button" onClick={() => goTo("email")}
                className="font-bold underline underline-offset-2 hover:opacity-60 transition-opacity cursor-pointer"
                style={{ color: "#0F0E0D" }}>
                로그인
              </button>
            </p>
          </form>
        )}

        {/* ── Forgot password ───────────────────────────────── */}
        {view === "forgot" && (
          <form className={`${P} space-y-4`}
            onSubmit={(e) => { e.preventDefault(); if (resetEmail) void handleReset(); }}>
            <button type="button" onClick={() => goTo("email")}
              className="flex items-center gap-1 text-[11px] hover:text-foreground transition-colors cursor-pointer mb-1"
              style={{ color: "#7A7269" }}>
              <ChevronLeft size={12} strokeWidth={2.5} />
              로그인으로 돌아가기
            </button>

            <div>
              <h2 className="text-[17px] font-bold tracking-tight">비밀번호 재설정</h2>
              <p className="text-[12px] mt-0.5" style={{ color: "#7A7269" }}>
                가입한 이메일 주소를 입력하면 재설정 링크를 보내드립니다
              </p>
            </div>

            {!sent ? (
              <>
                <LMField id="fg-email" label="이메일" type="email" value={resetEmail}
                  onChange={setResetEmail} placeholder="example@email.com" autoFocus />
                <LMError message={error} />
                <LMPrimaryBtn type="submit" disabled={busy}>재설정 링크 받기</LMPrimaryBtn>
              </>
            ) : (
              <div className="py-5 px-4 text-center"
                style={{ border: "1px solid rgba(34,197,94,0.28)", borderRadius: "5px", backgroundColor: "rgba(34,197,94,0.04)" }}>
                <p className="text-[13px] font-bold mb-1.5" style={{ color: "#16a34a" }}>링크를 전송했습니다</p>
                <p className="text-[12px] leading-relaxed" style={{ color: "#7A7269" }}>
                  <span className="font-medium" style={{ color: "#0F0E0D" }}>{resetEmail}</span>로<br />
                  재설정 링크를 보냈습니다. 스팸함도 확인해 주세요.
                </p>
                <button type="button"
                  onClick={() => { setSent(false); setResetEmail(""); }}
                  className="text-[12px] underline underline-offset-2 mt-3.5 hover:opacity-60 transition-opacity cursor-pointer block mx-auto"
                  style={{ color: "#7A7269" }}>
                  다른 이메일로 재시도
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}


