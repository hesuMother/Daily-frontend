import { useEffect, useRef, useState } from "react";
import type React from "react";
import { changePassword, deleteAccount, updateProfile, type User } from "../../shared/api/auth";
import { errorMessage } from "../../shared/api/storage";
import { fetchNotificationSettings, saveNotificationSettings, uploadImage, type NotificationSettings } from "../../shared/api/userData";
import {
  Bell,
  Camera,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LogOut,
  // MapPin, // TODO: 추후 복구 — 배송지 관리
  UserRound,
  UserRoundX,
} from "lucide-react";

type SettingsView = "menu" | "profile" | "password" | "notifications" | "delete";

const menuItems = [
  { key: "profile" as const, label: "프로필 편집", desc: "닉네임, 프로필 이미지 변경", icon: UserRound },
  { key: "password" as const, label: "비밀번호 변경", desc: "계정 보안 관리", icon: LockKeyhole },
  { key: "notifications" as const, label: "알림 설정", desc: "가격 알림, 마케팅 수신 설정", icon: Bell },
  // TODO: 추후 복구 — 배송지 관리
  // { key: "address" as const, label: "배송지 관리", desc: "기본 배송지 등록 및 수정", icon: MapPin },
  { key: "logout" as const, label: "로그아웃", desc: "현재 계정에서 로그아웃", icon: LogOut },
  { key: "delete" as const, label: "회원 탈퇴", desc: "계정 및 모든 데이터 삭제", icon: UserRoundX, danger: true },
];

// ─── Small shared bits ──────────────────────────────────────────────────────

function BackRow({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-[13px] font-medium text-[#8a837a] transition-colors hover:text-[#171615]"
      >
        <ChevronLeft size={17} strokeWidth={1.8} /> 돌아가기
      </button>
      <span className="text-[#dedbd6]">|</span>
      <h3 className="text-[15px] font-bold text-[#171615]">{title}</h3>
    </div>
  );
}

function Field({
  id, label, type, value, onChange, placeholder, suffix, error, autoComplete,
}: {
  id: string; label: string; type: string; value: string; onChange: (v: string) => void;
  placeholder?: string; suffix?: React.ReactNode; error?: string; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-[#8c857d]">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full bg-white px-4 py-3 text-[14px] text-[#171615] outline-none transition-colors placeholder:text-[#b7b1a8]"
          style={{
            border: `1px solid ${error ? "#d8aaa4" : focused ? "#171615" : "#dedbd6"}`,
            paddingRight: suffix ? "42px" : "16px",
          }}
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      {error && <p className="mt-1.5 text-[11px] text-[#b34b42]">{error}</p>}
    </div>
  );
}

function PwToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" tabIndex={-1} onClick={onToggle} className="text-[#8c857d] transition-colors hover:text-[#171615]">
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-200"
      style={{ backgroundColor: checked ? "#171615" : "#c7a875" }}
    >
      <span
        className="absolute top-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? "translateX(23px)" : "translateX(3px)" }}
      />
    </button>
  );
}

function PrimaryButton({ children, onClick, disabled, type = "button", danger }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit"; danger?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3.5 text-[14px] font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
      style={{ backgroundColor: danger ? "#b34b42" : "#171615" }}
    >
      {children}
    </button>
  );
}

// ─── Profile edit ───────────────────────────────────────────────────────────

function ProfileEditView({ name, email, avatarUrl: initialAvatarUrl, onBack, onSave }: {
  name: string; email: string; avatarUrl: string | null; onBack: () => void; onSave: (user: User) => void;
}) {
  const [nickname, setNickname] = useState(name);
  const [mail, setMail] = useState(email);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatarUrl(await uploadImage(file, 256));
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleSave = async () => {
    if (!nickname.trim() || !mail.trim()) return;
    try {
      onSave(await updateProfile({ name: nickname, email: mail, avatarUrl }));
      setError("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setSaved(false);
      setError(errorMessage(err));
    }
  };

  return (
    <div className="max-w-[480px]">
      <BackRow onBack={onBack} title="프로필 편집" />

      <div className="mb-8 flex items-center gap-5">
        <div className="relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-full bg-[#c7a875] text-[25px] font-medium text-[#171615]">
          {avatarUrl ? (
            <img src={avatarUrl} alt="프로필 이미지" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">{nickname.charAt(0) || "D"}</div>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 border border-[#dedbd6] px-3.5 py-2 text-[12px] font-medium text-[#171615] transition-colors hover:border-[#171615]"
          >
            <Camera size={13} strokeWidth={1.8} /> 이미지 변경
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
          <p className="mt-2 text-[11px] text-[#8c857d]">JPG, PNG 파일 (최대 5MB)</p>
        </div>
      </div>

      <div className="space-y-5">
        <Field id="acc-nickname" label="닉네임" type="text" value={nickname} onChange={setNickname} placeholder="닉네임을 입력하세요" />
        <Field id="acc-email" label="이메일" type="email" value={mail} onChange={setMail} placeholder="example@email.com" autoComplete="email" />
      </div>

      <div className="mt-8 flex items-center gap-3">
        <PrimaryButton onClick={handleSave} disabled={!nickname.trim() || !mail.trim()}>저장</PrimaryButton>
      </div>
      {saved && <p className="mt-3 text-[12px] font-medium text-[#3f7a4d]">변경사항이 저장되었습니다.</p>}
      {error && <p className="mt-3 text-[12px] font-medium text-[#b34b42]">{error}</p>}
    </div>
  );
}

// ─── Password change ────────────────────────────────────────────────────────

function PasswordChangeView({ onBack }: { onBack: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const pwFormatValid = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(next);
  const currentError = submitted && !current ? "현재 비밀번호를 입력해주세요." : undefined;
  const nextError = submitted && next && !pwFormatValid ? "영문, 숫자를 포함해 8자 이상 입력해주세요." : undefined;
  const sameAsCurrentError = submitted && next && current && next === current ? "현재 비밀번호와 다른 비밀번호를 입력해주세요." : undefined;
  const confirmError = submitted && confirm && confirm !== next ? "비밀번호가 일치하지 않습니다." : undefined;

  const canSubmit = current.length > 0 && pwFormatValid && next === confirm && next !== current;

  const handleSubmit = async () => {
    setSubmitted(true);
    setError("");
    if (!canSubmit) return;
    try {
      await changePassword(current, next);
    } catch (err) {
      setError(errorMessage(err));
      return;
    }
    setDone(true);
    setCurrent("");
    setNext("");
    setConfirm("");
    setSubmitted(false);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <div className="max-w-[420px]">
      <BackRow onBack={onBack} title="비밀번호 변경" />

      <div className="space-y-5">
        <Field
          id="pw-current" label="현재 비밀번호" type={showCurrent ? "text" : "password"}
          value={current} onChange={setCurrent} placeholder="현재 비밀번호 입력" autoComplete="current-password"
          error={currentError ?? sameAsCurrentError}
          suffix={<PwToggle show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} />}
        />
        <Field
          id="pw-next" label="새 비밀번호" type={showNext ? "text" : "password"}
          value={next} onChange={setNext} placeholder="영문, 숫자 포함 8자 이상" autoComplete="new-password"
          error={nextError}
          suffix={<PwToggle show={showNext} onToggle={() => setShowNext((v) => !v)} />}
        />
        <Field
          id="pw-confirm" label="새 비밀번호 확인" type={showConfirm ? "text" : "password"}
          value={confirm} onChange={setConfirm} placeholder="새 비밀번호 재입력" autoComplete="new-password"
          error={confirmError}
          suffix={<PwToggle show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />}
        />
      </div>

      <div className="mt-8">
        <PrimaryButton onClick={handleSubmit}>비밀번호 변경</PrimaryButton>
      </div>
      {done && <p className="mt-3 text-[12px] font-medium text-[#3f7a4d]">비밀번호가 변경되었습니다.</p>}
      {error && <p className="mt-3 text-[12px] font-medium text-[#b34b42]">{error}</p>}
    </div>
  );
}

// ─── Notification settings ──────────────────────────────────────────────────

const notificationItems = [
  { key: "price", label: "가격 변동 알림", desc: "찜한 상품의 가격이 내려가면 알려드려요" },
  { key: "style", label: "코디 추천 알림", desc: "취향에 맞는 새로운 코디를 추천해드려요" },
  { key: "order", label: "주문·배송 알림", desc: "주문, 배송 상태 변경 시 알려드려요" },
  { key: "marketing", label: "이벤트·혜택 알림", desc: "쿠폰, 할인 등 마케팅 정보를 받아요" },
];

function NotificationSettingsView({ onBack }: { onBack: () => void }) {
  const [enabled, setEnabled] = useState<NotificationSettings>({
    price: true,
    style: true,
    order: true,
    marketing: false,
  });
  const allOn = notificationItems.every((item) => enabled[item.key]);

  useEffect(() => {
    let active = true;
    fetchNotificationSettings().then((settings) => { if (active) setEnabled(settings); });
    return () => { active = false; };
  }, []);

  const update = (next: NotificationSettings) => {
    setEnabled(next);
    void saveNotificationSettings(next);
  };

  const setAll = (value: boolean) => {
    update(Object.fromEntries(notificationItems.map((item) => [item.key, value])));
  };

  return (
    <div className="max-w-[520px]">
      <BackRow onBack={onBack} title="알림 설정" />

      <div className="mb-5 flex items-center justify-between border border-[#171615] bg-[#171615] px-4 py-4 text-[#faf9f6]">
        <div>
          <p className="text-[14px] font-bold">서비스 알림 설정</p>
          <p className="mt-0.5 text-[11px] text-[#a9a49d]">모든 알림을 한 번에 켜거나 끌 수 있어요</p>
        </div>
        <ToggleSwitch checked={allOn} onChange={setAll} />
      </div>

      <div className="divide-y divide-[#dedbd6] border border-[#dedbd6]">
        {notificationItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between px-4 py-4">
            <div className="min-w-0 pr-4">
              <p className="text-[14px] font-medium text-[#171615]">{item.label}</p>
              <p className="mt-1 text-[11px] text-[#8c857d]">{item.desc}</p>
            </div>
            <ToggleSwitch
              checked={!!enabled[item.key]}
              onChange={(v) => update({ ...enabled, [item.key]: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Delete account ──────────────────────────────────────────────────────────

function DeleteAccountView({ onBack, onConfirmDelete }: { onBack: () => void; onConfirmDelete: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState<"idle" | "confirm" | "done">("idle");
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      await deleteAccount();
      setStep("done");
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="max-w-[520px]">
      <BackRow onBack={onBack} title="회원 탈퇴" />

      <div className="border border-[#d8aaa4] bg-[#fff5f4] p-5">
        <p className="mb-3 text-[14px] font-bold text-[#b34b42]">탈퇴 전 꼭 확인해주세요</p>
        <ul className="space-y-1.5 text-[12px] leading-relaxed text-[#8c6763]">
          <li>· 계정 탈퇴 시 찜 목록, 최근 본 상품, 적립금, 쿠폰 등 모든 데이터가 삭제됩니다.</li>
          <li>· 삭제된 데이터는 복구할 수 없습니다.</li>
          <li>· 진행 중인 주문이 있다면 배송 완료 후 탈퇴해주세요.</li>
          <li>· 동일한 이메일로 재가입 시에도 기존 등급과 혜택은 복원되지 않습니다.</li>
        </ul>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#171615]"
        />
        <span className="text-[13px] leading-relaxed text-[#171615]">위 내용을 모두 확인했으며 탈퇴에 동의합니다.</span>
      </label>

      <div className="mt-6">
        <PrimaryButton danger disabled={!agreed} onClick={() => setStep("confirm")}>탈퇴하기</PrimaryButton>
      </div>

      {step !== "idle" && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-5" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
          <div className="absolute inset-0 bg-black/55" onClick={() => step === "confirm" && setStep("idle")} />
          <div className="relative w-full max-w-[360px] bg-[#faf9f6] p-7 text-center" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
            {step === "confirm" ? (
              <>
                <p className="mb-2 text-[16px] font-bold text-[#171615]">정말 탈퇴하시겠습니까?</p>
                <p className="mb-6 text-[12px] leading-relaxed text-[#8c857d]">이 작업은 되돌릴 수 없으며, 모든 계정 정보가 삭제됩니다.</p>
                {error && <p className="mb-4 text-[12px] font-medium text-[#b34b42]">{error}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("idle")}
                    className="flex-1 border border-[#dedbd6] py-3 text-[13px] font-medium text-[#171615] transition-colors hover:border-[#171615]"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-3 text-[13px] font-bold text-white"
                    style={{ backgroundColor: "#b34b42" }}
                  >
                    탈퇴
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-2 text-[16px] font-bold text-[#171615]">탈퇴가 완료되었습니다</p>
                <p className="mb-6 text-[12px] leading-relaxed text-[#8c857d]">그동안 D.aily를 이용해주셔서 감사합니다.</p>
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  className="w-full py-3 text-[13px] font-bold text-white"
                  style={{ backgroundColor: "#171615" }}
                >
                  확인
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root panel ──────────────────────────────────────────────────────────────

export function AccountSettingsPanel({ name, email, avatarUrl, onUpdateProfile, onDeleteAccount, onLogout }: {
  name: string;
  email: string;
  avatarUrl: string | null;
  onUpdateProfile: (user: User) => void;
  onDeleteAccount: () => void;
  onLogout: () => void;
}) {
  const [view, setView] = useState<SettingsView>("menu");

  if (view === "profile") {
    return <ProfileEditView name={name} email={email} avatarUrl={avatarUrl} onBack={() => setView("menu")} onSave={onUpdateProfile} />;
  }
  if (view === "password") {
    return <PasswordChangeView onBack={() => setView("menu")} />;
  }
  if (view === "notifications") {
    return <NotificationSettingsView onBack={() => setView("menu")} />;
  }
  if (view === "delete") {
    return <DeleteAccountView onBack={() => setView("menu")} onConfirmDelete={onDeleteAccount} />;
  }

  const handleMenuClick = (key: (typeof menuItems)[number]["key"]) => {
    // TODO: 추후 복구 — 배송지 관리
    // if (key === "address") return;
    if (key === "logout") { onLogout(); return; }
    setView(key);
  };

  return (
    <div className="max-w-[560px] space-y-2">
      {menuItems.map(({ key, label, desc, icon: Icon, danger }) => (
        <button
          type="button"
          key={key}
          onClick={() => handleMenuClick(key)}
          className={`flex w-full items-center justify-between border px-4 py-4 text-left transition-colors ${
            danger ? "border-[#d8aaa4] hover:bg-[#fff5f4]" : "border-[#dedbd6] hover:border-[#171615]"
          }`}
        >
          <span className="flex min-w-0 items-center gap-3">
            <Icon size={17} strokeWidth={1.7} className={danger ? "text-[#b34b42]" : "text-[#8c857d]"} />
            <span>
              <span className={`block text-[14px] font-medium ${danger ? "text-[#b34b42]" : "text-[#171615]"}`}>{label}</span>
              <span className="mt-1 block text-[11px] text-[#8c857d]">{desc}</span>
            </span>
          </span>
          {key !== "logout" && <ChevronRight size={15} className="shrink-0 text-[#8c857d]" />}
        </button>
      ))}
    </div>
  );
}
