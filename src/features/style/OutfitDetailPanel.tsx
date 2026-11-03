import { useEffect } from "react";
import type React from "react";
import { X, ChevronRight, ChevronDown } from "lucide-react";
import type { Product, Outfit, ShopPrice } from "../../app/App";
import { ContactForm } from "../account/ContactForm";
export function OutfitDetailPanel({
  outfit,
  onClose,
  onSelectProduct,
  products,
  getShopPrices,
  fmt,
}: {
  outfit: Outfit;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  products: Product[];
  getShopPrices: (product: Product) => ShopPrice[];
  fmt: (value: number) => string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const items = outfit.items
    .map((oi) => ({ item: oi, product: products.find((p) => p.id === oi.productId)! }))
    .filter((x) => x.product);

  return (
    <div
      className="fixed inset-0 z-[70] flex"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} style={{ backdropFilter: "blur(2px)" }} />

      {/* Panel — slides in from right on desktop, bottom-sheet on mobile */}
      <div className="relative ml-auto h-full w-full sm:max-w-[820px] bg-background flex flex-col md:flex-row overflow-hidden"
        style={{ boxShadow: "-8px 0 48px rgba(0,0,0,0.18)" }}>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 bg-white/90 hover:bg-white transition-colors text-foreground"
          style={{ borderRadius: "4px" }}
        >
          <X size={16} />
        </button>

        {/* LEFT — outfit photo */}
        <div className="relative md:w-[46%] shrink-0 h-56 md:h-full overflow-hidden bg-secondary">
          <img
            src={outfit.img}
            alt={outfit.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {outfit.tags.map((t) => (
                <span key={t} className="text-[10px] font-bold tracking-wider text-white/80 bg-white/15 backdrop-blur-sm px-2 py-0.5"
                  style={{ borderRadius: "3px" }}>
                  #{t}
                </span>
              ))}
            </div>
            <p className="text-white text-base font-bold leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
              {outfit.title}
            </p>
          </div>
        </div>

        {/* RIGHT — items + info */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">{outfit.style}</span>
              <span className="text-muted-foreground/40 text-[10px]">·</span>
              <span className="text-[10px] text-muted-foreground">{outfit.season} 시즌</span>
            </div>
            <h2 className="text-lg font-bold mb-3 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
              {outfit.title}
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{outfit.stylistNote}</p>
          </div>

          <div className="px-6 pt-5 pb-8">
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-4">
              이 코디 구성 아이템 · {items.length}개
            </p>

            <div className="space-y-3">
              {items.map(({ item, product }) => {
                const cheapest = getShopPrices(product)[0];
                return (
                  <div
                    key={product.id}
                    className="flex gap-3.5 p-3.5 border border-border hover:border-foreground/30 hover:bg-secondary/50 cursor-pointer transition-all group"
                    style={{ borderRadius: "5px" }}
                    onClick={() => onSelectProduct(product)}
                  >
                    {/* Role badge */}
                    <div className="shrink-0 self-start">
                      <div className="w-[72px] h-[90px] overflow-hidden bg-secondary"
                        style={{ borderRadius: "3px" }}>
                        <img src={product.img} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <p className="text-center text-[9px] font-bold tracking-wider text-muted-foreground mt-1.5 uppercase">
                        {item.role}
                      </p>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground mb-0.5">{product.brand}</p>
                      <p className="text-[13px] font-medium text-foreground leading-snug mb-1.5">{product.name}</p>
                      <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">{product.subtitle}</p>

                      <div className="flex items-baseline gap-2">
                        <span className="text-[13px] font-bold">{fmt(cheapest.price)}</span>
                        {product.originalPrice && (
                          <span className="text-[11px] line-through text-muted-foreground">{fmt(product.originalPrice)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[9px] font-bold bg-secondary text-muted-foreground px-1.5 py-0.5 tracking-wider">
                          {cheapest.shop} 최저가
                        </span>
                        {cheapest.isFree && (
                          <span className="text-[10px] text-green-700 font-medium">무료배송</span>
                        )}
                      </div>
                    </div>

                    <div className="self-center shrink-0">
                      <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total price */}
            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
              <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">전체 코디 최저 합산가</p>
              <p className="text-base font-bold">
                {fmt(items.reduce((sum, { product }) => sum + getShopPrices(product)[0].price, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Footer Page Modal ────────────────────────────────────────────────────────

export const footerPageContent: Record<string, { title: string; body: React.ReactNode }> = {
  "주문 조회": {
    title: "주문 조회",
    body: (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground leading-relaxed">주문번호 또는 이메일로 주문 현황을 확인하세요.</p>
        <div className="space-y-3">
          <input className="w-full border border-border px-4 py-3 text-sm bg-input-background outline-none focus:border-primary" placeholder="주문번호 입력 (예: D2025-000123)" />
          <input className="w-full border border-border px-4 py-3 text-sm bg-input-background outline-none focus:border-primary" placeholder="가입 이메일 입력" />
          <button className="w-full bg-primary text-primary-foreground py-3 text-sm font-bold">조회하기</button>
        </div>
        <div className="bg-secondary p-4 text-xs text-muted-foreground space-y-1">
          <p className="font-bold text-foreground mb-2">배송 단계 안내</p>
          <p>결제완료 → 상품준비 → 배송중 → 배송완료</p>
          <p>평균 배송 기간: 결제 후 2~4 영업일</p>
        </div>
      </div>
    ),
  },
  "배송 안내": {
    title: "배송 안내",
    body: (
      <div className="space-y-5 text-sm">
        {[
          { q: "배송 기간", a: "결제 완료 후 2~4 영업일 이내 출고됩니다. 주말·공휴일은 출고일에서 제외됩니다." },
          { q: "배송비", a: "50,000원 이상 구매 시 무료배송. 미만 시 배송비 3,000원이 부과됩니다." },
          { q: "배송 조회", a: "출고 완료 후 CJ대한통운 기준 문자로 송장번호가 발송됩니다." },
          { q: "도서산간 지역", a: "제주 및 도서산간 지역은 추가 배송비 3,000원이 발생할 수 있습니다." },
          { q: "해외 배송", a: "현재 국내 배송만 지원합니다. 해외 배송은 추후 도입 예정입니다." },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-border pb-4">
            <p className="font-bold mb-1">{q}</p>
            <p className="text-muted-foreground leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    ),
  },
  "교환·반품": {
    title: "교환·반품 안내",
    body: (
      <div className="space-y-5 text-sm">
        <div className="bg-accent/10 border border-accent/30 p-4 text-xs">
          <p className="font-bold text-accent mb-1">교환·반품 신청 가능 기간</p>
          <p className="text-muted-foreground">상품 수령 후 <strong className="text-foreground">7일 이내</strong> 신청 가능합니다.</p>
        </div>
        {[
          { q: "교환 가능 조건", a: "미착용·미세탁 상태, 택 부착, 포장재 보관 시 교환 가능합니다." },
          { q: "반품 배송비", a: "단순 변심의 경우 왕복 배송비 6,000원이 고객 부담입니다. 상품 불량·오배송 시 무료." },
          { q: "교환 불가 품목", a: "속옷류, 수영복, 귀걸이 등 위생 관련 제품은 교환·반품이 불가합니다." },
          { q: "환불 처리", a: "반품 상품 도착 후 검수 완료 시 2~3 영업일 이내 환불 처리됩니다." },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-border pb-4">
            <p className="font-bold mb-1">{q}</p>
            <p className="text-muted-foreground leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    ),
  },
  "자주 묻는 질문": {
    title: "자주 묻는 질문",
    body: (
      <div className="space-y-3 text-sm">
        {[
          { q: "회원가입 없이 구매할 수 있나요?", a: "비회원 구매도 가능하나, 멤버십 혜택(적립금, 쿠폰, 가격 알림)은 회원에게만 제공됩니다." },
          { q: "가격 알림은 어떻게 설정하나요?", a: "상품 상세 페이지의 벨 아이콘을 눌러 원하는 가격을 설정하면 해당 가격 도달 시 알림을 보내드립니다." },
          { q: "여러 쇼핑몰 가격 비교 기준은 무엇인가요?", a: "각 쇼핑몰의 실시간 API 데이터를 기반으로 최저가를 집계합니다. 쿠폰·포인트 적용가는 반영되지 않습니다." },
          { q: "적립금은 어떻게 사용하나요?", a: "마이페이지 → 적립금 메뉴에서 확인 및 결제 시 사용 가능합니다. 최소 사용 금액은 1,000원입니다." },
          { q: "앱은 따로 있나요?", a: "현재 모바일 웹을 최적화하여 제공 중입니다. 앱은 2025년 하반기 출시 예정입니다." },
        ].map(({ q, a }, i) => (
          <details key={i} className="border border-border group">
            <summary className="px-4 py-3 cursor-pointer font-medium flex items-center justify-between list-none">
              {q}
              <ChevronDown size={14} className="text-muted-foreground group-open:rotate-180 transition-transform" />
            </summary>
            <p className="px-4 pb-4 text-muted-foreground leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    ),
  },
  "1:1 문의": {
    title: "1:1 문의",
    body: <ContactForm />,
  },
  "회사 소개": {
    title: "회사 소개",
    body: (
      <div className="space-y-6 text-sm">
        <p className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>D<span className="text-accent">.</span>aily</p>
        <p className="text-muted-foreground leading-relaxed">D.aily는 패션을 사랑하는 사람들을 위한 스마트 쇼핑 플랫폼입니다. 무신사, 29CM, W컨셉 등 국내 주요 패션 플랫폼의 가격을 실시간으로 비교하고, 12개월 가격 추이 데이터를 제공해 최적의 타이밍에 구매할 수 있도록 도와드립니다.</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[["7+", "제휴 쇼핑몰"], ["50,000+", "등록 상품"], ["200,000+", "월간 사용자"]].map(([n, l]) => (
            <div key={l} className="bg-secondary p-4">
              <p className="text-xl font-bold text-accent">{n}</p>
              <p className="text-xs text-muted-foreground mt-1">{l}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-4 space-y-2 text-xs text-muted-foreground">
          <p><span className="font-medium text-foreground">회사명</span>: 주식회사 데일리패션</p>
          <p><span className="font-medium text-foreground">대표</span>: 고재영</p>
          <p><span className="font-medium text-foreground">사업자등록번호</span>: 123-45-67890</p>
          <p><span className="font-medium text-foreground">주소</span>: 서울특별시 성동구 성수이로 10길, 데일리빌딩 5F</p>
          <p><span className="font-medium text-foreground">이메일</span>: hello@daily-fashion.kr</p>
        </div>
      </div>
    ),
  },
  "이용약관": {
    title: "이용약관",
    body: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        {[
          ["제1조 (목적)", "본 약관은 주식회사 데일리패션(이하 '회사')이 제공하는 D.aily 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다."],
          ["제2조 (정의)", "'서비스'란 회사가 제공하는 패션 가격 비교 및 쇼핑 정보 플랫폼을 의미합니다. '이용자'란 본 약관에 따라 서비스를 이용하는 모든 자를 말합니다."],
          ["제3조 (약관의 효력)", "본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력이 발생합니다. 회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일이 지난 시점부터 효력이 발생합니다."],
          ["제4조 (서비스 이용)", "서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다. 단, 정기 점검 등 필요한 경우 일정 기간 서비스가 중단될 수 있습니다."],
        ].map(([title, body]) => (
          <div key={title as string} className="border-b border-border pb-4">
            <p className="font-bold text-foreground mb-1">{title}</p>
            <p>{body}</p>
          </div>
        ))}
        <p className="text-xs">시행일자: 2025년 1월 1일</p>
      </div>
    ),
  },
  "개인정보처리방침": {
    title: "개인정보처리방침",
    body: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        {[
          ["수집하는 개인정보 항목", "회원가입 시: 이메일, 비밀번호, 닉네임\n소셜 로그인 시: 이름, 이메일(제공 동의한 경우)\n서비스 이용 시: 접속 IP, 쿠키, 이용 내역"],
          ["개인정보 수집 목적", "회원 식별 및 서비스 제공, 가격 알림 발송, 맞춤 스타일 추천, 고객 문의 응대"],
          ["보유 및 이용 기간", "회원 탈퇴 시까지 보유합니다. 단, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다."],
          ["개인정보 삭제 요청", "마이페이지 → 계정 설정 → 회원 탈퇴를 통해 언제든지 개인정보 삭제를 요청하실 수 있습니다."],
        ].map(([title, body]) => (
          <div key={title as string} className="border-b border-border pb-4">
            <p className="font-bold text-foreground mb-1">{title}</p>
            <p className="whitespace-pre-line">{body}</p>
          </div>
        ))}
        <p className="text-xs">개인정보 보호 담당자: privacy@daily-fashion.kr</p>
      </div>
    ),
  },
  "파트너십": {
    title: "파트너십",
    body: (
      <div className="space-y-6 text-sm">
        <p className="text-muted-foreground leading-relaxed">D.aily와 함께 성장하실 패션 브랜드, 쇼핑몰, 크리에이터를 환영합니다.</p>
        <div className="grid grid-cols-1 gap-3">
          {[
            { type: "브랜드 입점", desc: "D.aily 플랫폼에 브랜드 상품을 등록하고 월 20만 이상의 패션 구매자에게 노출하세요." },
            { type: "쇼핑몰 제휴", desc: "가격 데이터 API 연동을 통해 쇼핑몰 트래픽을 높이고 전환율을 개선할 수 있습니다." },
            { type: "크리에이터 협업", desc: "패션 인플루언서, 스타일리스트와의 콜라보레이션 기회를 제공합니다." },
          ].map(({ type, desc }) => (
            <div key={type} className="border border-border p-4">
              <p className="font-bold mb-1">{type}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-secondary p-4">
          <p className="font-bold mb-2">문의처</p>
          <p className="text-muted-foreground text-xs">partnership@daily-fashion.kr</p>
          <p className="text-muted-foreground text-xs mt-1">영업일 기준 3일 이내 회신 드립니다.</p>
        </div>
      </div>
    ),
  },
};


