import { footerPageContent } from "../features/style/OutfitDetailPanel";
export function FooterPageModal({ page, onClose }: { page: string; onClose: () => void }) {
  void onClose;
  const content = footerPageContent[page];
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 md:px-8 py-10">
        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          {content?.title ?? page}
        </h1>
        {content?.body ?? <p className="text-muted-foreground text-sm">준비 중입니다.</p>}
      </div>
    </div>
  );
}

// ─── D.aily 자체 브랜드 뷰 ────────────────────────────────────────────────────

export const styleLabels: Record<string, { eng: string; desc: string }> = {
  캐주얼:  { eng: "Casual",  desc: "편안하고 자연스러운 일상 스타일" },
  스트릿:  { eng: "Street",  desc: "개성 넘치는 도시형 스트릿 패션" },
  오피스룩: { eng: "Office",  desc: "세련되고 단정한 비즈니스 무드" },
  미니멀:  { eng: "Minimal", desc: "군더더기 없는 깔끔한 베이직" },
  스포티:  { eng: "Sporty",  desc: "활동적이고 경쾌한 애슬레저" },
};


