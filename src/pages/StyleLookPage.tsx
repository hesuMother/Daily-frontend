import type { Outfit } from "../app/App";

// ─── Constants ────────────────────────────────────────────────────────────────

export const categories = ["전체", "상의", "하의", "신상품"];

export const outfits: Outfit[] = [
  // ── 캐주얼 ──────────────────────────────────────────────────────────────────
  {
    id: 1, style: "캐주얼",
    title: "여유로운 린넨 데일리룩",
    tags: ["오버핏", "린넨", "내추럴"],
    img: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=700&h=950&fit=crop&auto=format",
    season: "SS",
    stylistNote: "린넨 셔츠의 자연스러운 구김과 와이드 데님의 조합. 여름 일상에 최적화된 편안한 무드로, 슬리퍼나 샌들을 더하면 완성됩니다.",
    items: [{ productId: 1, role: "상의" }, { productId: 2, role: "하의" }],
  },
  {
    id: 2, style: "캐주얼",
    title: "크루넥 슬랙스 세미캐주얼",
    tags: ["세미캐주얼", "무드있는", "데이트룩"],
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=700&h=950&fit=crop&auto=format",
    season: "FW",
    stylistNote: "스웨트셔츠를 슬랙스와 매치해 캐주얼하지만 정돈된 인상을 줍니다. 출퇴근이나 캐주얼 미팅에 두루 활용 가능한 조합입니다.",
    items: [{ productId: 4, role: "상의" }, { productId: 5, role: "하의" }],
  },
  {
    id: 3, style: "캐주얼",
    title: "헤비 티셔츠 린넨 팬츠 여름룩",
    tags: ["여름룩", "서머", "라이트"],
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&h=950&fit=crop&auto=format",
    season: "SS",
    stylistNote: "두툼한 코튼 티셔츠와 리넨 팬츠의 소재 대비가 포인트. 둘 다 통기성이 좋아 더운 날씨에도 쾌적하게 입을 수 있습니다.",
    items: [{ productId: 8, role: "상의" }, { productId: 7, role: "하의" }],
  },
  // ── 스트릿 ──────────────────────────────────────────────────────────────────
  {
    id: 4, style: "스트릿",
    title: "바시티 재킷 데님 스트릿룩",
    tags: ["바시티", "아카이브", "그래픽"],
    img: "https://images.unsplash.com/photo-1529139574466-a303027614b?w=700&h=950&fit=crop&auto=format",
    season: "FW",
    stylistNote: "커버낫 바시티 재킷과 와이드 데님의 클래식 조합. 올드스쿨 무드를 살리면서도 와이드 실루엣으로 현대적인 핏을 완성합니다.",
    items: [{ productId: 6, role: "아우터" }, { productId: 2, role: "하의" }],
  },
  {
    id: 5, style: "스트릿",
    title: "크루넥 데님 스케이트 무드",
    tags: ["스케이트", "루즈핏", "하이틴"],
    img: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=700&h=950&fit=crop&auto=format",
    season: "AW",
    stylistNote: "볼드한 크루넥 스웨트셔츠를 와이드 데님과 매치. 오버사이즈 핏을 활용해 스트릿 감성을 극대화할 수 있습니다.",
    items: [{ productId: 4, role: "상의" }, { productId: 2, role: "하의" }],
  },
  {
    id: 6, style: "스트릿",
    title: "헤비 티셔츠 오버핏 빈티지룩",
    tags: ["빈티지", "오버핏", "미국무드"],
    img: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=700&h=950&fit=crop&auto=format",
    season: "SS",
    stylistNote: "260g 두께의 헤비 티셔츠를 크게 입어 빈티지 감성 연출. 데님과 매치하면 90년대 스트릿 무드가 자연스럽게 완성됩니다.",
    items: [{ productId: 8, role: "상의" }, { productId: 2, role: "하의" }],
  },
  // ── 오피스룩 ────────────────────────────────────────────────────────────────
  {
    id: 7, style: "오피스룩",
    title: "울 코트 슬랙스 시크 오피스룩",
    tags: ["비즈니스", "럭셔리", "시크"],
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&h=950&fit=crop&auto=format",
    season: "FW",
    stylistNote: "아더에러 울 코트를 테일러드 슬랙스와 매치한 완성도 높은 비즈니스 룩. 중요한 미팅이나 프레젠테이션에 자신감을 더해줍니다.",
    items: [{ productId: 3, role: "아우터" }, { productId: 5, role: "하의" }],
  },
  {
    id: 8, style: "오피스룩",
    title: "린넨 셔츠 슬랙스 스마트 캐주얼",
    tags: ["스마트캐주얼", "비즈니스캐주얼", "클린"],
    img: "https://images.unsplash.com/photo-1600275669439-14e40452d20b?w=700&h=950&fit=crop&auto=format",
    season: "SS",
    stylistNote: "린넨 셔츠를 슬랙스에 살짝 넣거나 내추럴하게 아웃하여 스마트 캐주얼 완성. 사무실부터 팀 회식까지 활용도가 높은 조합입니다.",
    items: [{ productId: 1, role: "상의" }, { productId: 5, role: "하의" }],
  },
  // ── 미니멀 ──────────────────────────────────────────────────────────────────
  {
    id: 9, style: "미니멀",
    title: "울 코트 린넨 팬츠 모던 미니멀",
    tags: ["무채색", "드레이프", "모던"],
    img: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=700&h=950&fit=crop&auto=format",
    season: "FW",
    stylistNote: "아더에러의 울 코트와 리넨 와이드 팬츠의 드레이프 대비가 아름다운 조합. 컬러를 오트밀이나 블랙으로 통일하면 더욱 세련됩니다.",
    items: [{ productId: 3, role: "아우터" }, { productId: 7, role: "하의" }],
  },
  {
    id: 10, style: "미니멀",
    title: "헤비 티 슬랙스 화이트 미니멀",
    tags: ["화이트톤", "베이직", "에센셜"],
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&h=950&fit=crop&auto=format",
    season: "SS",
    stylistNote: "흰색 헤비 코튼 티셔츠와 블랙 슬랙스의 가장 완결된 미니멀 공식. 불필요한 디테일을 모두 걷어낸 본질에 충실한 스타일링입니다.",
    items: [{ productId: 8, role: "상의" }, { productId: 5, role: "하의" }],
  },
  // ── 스포티 ──────────────────────────────────────────────────────────────────
  {
    id: 11, style: "스포티",
    title: "크루넥 데님 스포티 캐주얼",
    tags: ["애슬레저", "스포티", "캠퍼스"],
    img: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=700&h=950&fit=crop&auto=format",
    season: "AW",
    stylistNote: "스웨트셔츠를 데님과 매치한 캠퍼스 무드. 스니커즈와 함께하면 스포티한 에너지를 자연스럽게 표현할 수 있습니다.",
    items: [{ productId: 4, role: "상의" }, { productId: 2, role: "하의" }],
  },
  {
    id: 12, style: "스포티",
    title: "헤비 티 리넨 팬츠 활동적 이지룩",
    tags: ["이지웨어", "릴렉스핏", "애슬레저"],
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&h=950&fit=crop&auto=format",
    season: "SS",
    stylistNote: "카키나 그레이 헤비 티셔츠에 리넨 팬츠를 매치한 이지 스포티룩. 편안하면서도 정돈된 느낌으로 주말 액티비티에 적합합니다.",
    items: [{ productId: 8, role: "상의" }, { productId: 7, role: "하의" }],
  },
];

export const banners = [
  {
    id: 1,
    title: "오늘의 스타일",
    subtitle: "D.aily Collection 2025",
    desc: "매일을 특별하게 만드는 패션 아이템",
    cta: "컬렉션 보기",
    img: "https://images.unsplash.com/photo-1660827915367-2cf03881e58b?w=1400&h=700&fit=crop&auto=format",
  },
  {
    id: 2,
    title: "아우터 시즌",
    subtitle: "Outerwear Season",
    desc: "완벽한 레이어링을 위한 아우터 컬렉션",
    cta: "지금 쇼핑하기",
    img: "https://images.unsplash.com/photo-1652590480678-ad2baa51f76c?w=1400&h=700&fit=crop&auto=format",
  },
];

// ─── Main App ─────────────────────────────────────────────────────────────────


