import { useEffect, useState } from "react";
import { createContact, fetchContactCategories } from "../../shared/api/contacts";
import { errorMessage } from "../../shared/api/storage";
import type { Category } from "../../shared/api/types";

const fieldClass = "w-full border border-border px-4 py-3 text-sm bg-input-background outline-none focus:border-primary";

export function ContactForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    fetchContactCategories()
      .then((rows) => { if (active) setCategories(rows); })
      .catch((err) => { if (active) setError(errorMessage(err)); });
    return () => { active = false; };
  }, []);

  const handleSubmit = async () => {
    if (!categoryId) { setError("문의 유형을 선택해주세요."); return; }
    if (!reason.trim()) { setError("제목을 입력해주세요."); return; }
    setError("");
    setBusy(true);
    try {
      await createContact({ categoryId, reason, description });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusy(false);
  };

  if (done) return <p className="text-sm text-muted-foreground">문의가 접수되었습니다. 답변은 가입하신 이메일로 보내드립니다.</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">답변은 가입하신 이메일로 보내드립니다.</p>
      <div className="space-y-3">
        <select aria-label="문의 유형" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={fieldClass}>
          <option value="">문의 유형 선택</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input aria-label="제목" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} className={fieldClass} placeholder="제목" />
        <textarea aria-label="문의 내용" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} rows={5} className={`${fieldClass} resize-none`} placeholder="문의 내용을 입력해주세요." />
        {error && <p role="alert" className="text-[12px] text-destructive">{error}</p>}
        <button type="button" onClick={() => void handleSubmit()} disabled={busy} className="w-full bg-primary text-primary-foreground py-3 text-sm font-bold disabled:opacity-50">문의 접수</button>
      </div>
    </div>
  );
}
