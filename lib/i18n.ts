export type Lang = "en" | "mn" | "ko";

export const LANGS: { code: Lang; label: string; path: string }[] = [
  { code: "en", label: "EN", path: "/" },
  { code: "mn", label: "МН", path: "/mn" },
  { code: "ko", label: "한국어", path: "/ko" },
];

// Technical terms (project names, model names, benchmark labels, tech stack,
// walk-forward, feature engineering, etc.) intentionally stay in English where
// a translation would be weak or non-standard.

const en = {
  meta: {
    title: "Deep Beta Technology LLC | Advanced Analytics & AI Solutions",
    description:
      "Deep Beta Technology LLC delivers treasury management, AI solutions, and quant ML & AI algorithmic trading to enterprises. Advanced analytics and backtesting on financial products.",
  },
  nav: {
    tagline: "Advanced Analytics & AI Solutions",
    links: {
      about: "About",
      projects: "Projects",
      process: "Process",
      technology: "Technology",
      contact: "Contact",
    },
    requestAccess: "Request Access",
  },
  hero: {
    h1Gradient: "Advanced Analytics & AI,",
    h1Rest: "Engineered.",
    paragraph:
      "Deep Beta Technology LLC delivers advanced analytics, rigorous backtesting on financial products, and AI solutions to enterprises. Our platform combines 13 quantitative ML models across alpha research, risk, and execution infrastructure.",
    exploreProjects: "Explore Projects",
    contactUs: "Contact Us",
    mandateLabel: "Enterprise Mandate",
    mandateText:
      "Advanced analytics, financial backtesting, and AI solutions powering systematic enterprise workflows.",
    highlights: [
      "Quant ML & AI algorithmic trading",
      "Treasury management solutions",
      "Enterprise-grade AI solutions",
    ],
  },
  stats: [
    "13 Quant ML Projects",
    "4 Asset Classes",
    "200+ Features Engineered",
    "AI-Driven",
  ],
  about: {
    label: "About",
    heading:
      "An advanced analytics and AI partner built for systematic enterprise edge.",
    paragraph:
      "Deep Beta Technology LLC is a technology firm delivering advanced analytics, backtesting on financial products, and AI solutions to enterprises. The platform is designed around disciplined data handling, robust feature engineering, and portfolio-aware model deployment. We operate strictly as a technology vendor: clients license our solutions, services, and quant models for a fee — we never hold client accounts or assets in custody, and we never split profits.",
    pillars: [
      "Quant ML and AI algorithmic trading for systematic enterprise strategies",
      "Backtesting on financial products backed by rigorous walk-forward validation",
      "Treasury management solutions for liquidity, FX, and risk oversight",
      "Ensemble methods and AI solutions built to adapt across asset classes and market regimes",
    ],
  },
  projects: {
    label: "13 Quant ML Projects",
    heading: "A research suite spanning the full quantitative trading stack.",
    paragraph:
      "Each project targets a distinct source of edge, from market regime detection and feature-rich forecasting to execution intelligence and portfolio construction.",
    chip: "Project",
  },
  process: {
    label: "How It Works",
    heading:
      "A three-stage pipeline designed for research velocity and deployment discipline.",
    stepTemplate: "Step {n}",
    steps: [
      {
        title: "Data Ingestion & Feature Engineering",
        detail:
          "Alternative, macro, price, options, and microstructure data are normalized into 200+ engineered features.",
      },
      {
        title: "Model Selection & Ensemble",
        detail:
          "Thirteen competing algorithms are evaluated, blended, and stress-tested across multiple market regimes.",
      },
      {
        title: "Execution & Risk Management",
        detail:
          "Signals flow into live trading integration with portfolio controls, execution monitoring, and risk overlays.",
      },
    ],
  },
  tech: {
    label: "Technology Stack",
    heading: "Purpose-built infrastructure for quantitative machine learning.",
    paragraph:
      "The stack combines research tooling, model training frameworks, data services, and production packaging for repeatable quantitative workflows.",
  },
  contact: {
    label: "Get In Touch",
    heading:
      "Partner with Deep Beta Technology LLC for advanced analytics and AI solutions.",
    paragraph:
      "Reach out to discuss enterprise AI partnerships, financial product backtesting, treasury management, advanced analytics solutions, and quantitative research collaboration.",
    requestAccess: "Request Access",
    disclaimer:
      "Legal disclaimer: Deep Beta Technology LLC is a technology provider. We sell solutions and services and license our quantitative models for a fee — we never hold client accounts or assets in custody, and we never enter profit-sharing arrangements. Our advanced analytics, backtesting, software, and AI infrastructure are for informational and enterprise use only. Not financial advice. For qualified investors only.",
  },
  footer: {
    links: {
      projects: "Projects",
      research: "Research",
      about: "About",
      contact: "Contact",
      privacy: "Privacy Policy",
      terms: "Terms",
    },
    rights: "© 2025 Deep Beta Technology LLC. All rights reserved.",
    businessModel:
      "Technology provider — no client asset custody, no profit sharing.",
    disclaimer: "Not financial advice. For qualified investors only.",
  },
};

export type Dict = typeof en;

const mn: Dict = {
  meta: {
    title: "Deep Beta Technology LLC | Дэвшилтэт аналитик ба AI шийдлүүд",
    description:
      "Deep Beta Technology LLC нь байгууллагуудад Treasury буюу мөнгөн хөрөнгийн удирдлага, AI шийдлүүд, квант ML ба AI алгоритмын арилжааны шийдлүүдийг хүргэдэг. Санхүүгийн бүтээгдэхүүний дэвшилтэт аналитик ба бэктест.",
  },
  nav: {
    tagline: "Дэвшилтэт аналитик ба AI шийдлүүд",
    links: {
      about: "Бидний тухай",
      projects: "Төслүүд",
      process: "Үйл явц",
      technology: "Технологи",
      contact: "Холбоо барих",
    },
    requestAccess: "Хандалт хүсэх",
  },
  hero: {
    h1Gradient: "Дэвшилтэт аналитик ба AI,",
    h1Rest: "инженерчлэлээр бүтээгдсэн.",
    paragraph:
      "Deep Beta Technology LLC нь байгууллагуудад дэвшилтэт аналитик, санхүүгийн бүтээгдэхүүний нарийвчилсан бэктест (backtesting), AI шийдлүүдийг хүргэдэг. Манай платформ альфа судалгаа, эрсдэл, гүйцэтгэлийн дэд бүтцийг хамарсан 13 квант ML моделийг нэгтгэдэг.",
    exploreProjects: "Төслүүдийг үзэх",
    contactUs: "Холбоо барих",
    mandateLabel: "Байгууллагын мандат",
    mandateText:
      "Байгууллагын системтэй ажлын урсгалыг тэтгэх дэвшилтэт аналитик, санхүүгийн бэктест, AI шийдлүүд.",
    highlights: [
      "Квант ML ба AI алгоритмын арилжаа",
      "Treasury буюу мөнгөн хөрөнгийн удирдлагын шийдлүүд",
      "Байгууллагын түвшний AI шийдлүүд",
    ],
  },
  stats: [
    "13 квант ML төсөл",
    "4 хөрөнгийн ангилал",
    "200+ инженерчилсэн feature",
    "AI-д суурилсан",
  ],
  about: {
    label: "Бидний тухай",
    heading:
      "Байгууллагын системтэй давуу талд зориулагдсан дэвшилтэт аналитик ба AI түнш.",
    paragraph:
      "Deep Beta Technology LLC нь байгууллагуудад дэвшилтэт аналитик, санхүүгийн бүтээгдэхүүний бэктест, AI шийдлүүдийг хүргэдэг технологийн компани юм. Платформ нь сахилга баттай өгөгдлийн боловсруулалт, найдвартай feature engineering, багцын хяналтад суурилсан моделийн нэвтрүүлэлт дээр тулгуурладаг. Бид зөвхөн технологийн нийлүүлэгчийн хувиар ажилладаг: үйлчлүүлэгчид манай шийдэл, үйлчилгээ, квант моделүүдийг лицензийн төлбөрөөр ашигладаг бөгөөд бид үйлчлүүлэгчийн данс, хөрөнгийг хэзээ ч өөрийн хадгаламжид (custody) авдаггүй, ашиг хуваадаггүй.",
    pillars: [
      "Байгууллагын системтэй стратегид зориулсан квант ML ба AI алгоритмын арилжаа",
      "Нарийвчилсан walk-forward валидацид суурилсан санхүүгийн бүтээгдэхүүний бэктест",
      "Хөрвөх чадвар, валют, эрсдэлийн хяналтад зориулсан Treasury буюу мөнгөн хөрөнгийн удирдлагын шийдлүүд",
      "Хөрөнгийн ангилал, зах зээлийн горим бүрт дасан зохицох ансамбль аргууд ба AI шийдлүүд",
    ],
  },
  projects: {
    label: "13 квант ML төсөл",
    heading: "Квант арилжааны бүх давхаргыг хамарсан судалгааны багц.",
    paragraph:
      "Төсөл бүр зах зээлийн горим таних, feature-ээр баялаг таамаглалаас эхлээд гүйцэтгэлийн интеллект, багц бүрдүүлэлт хүртэл давуу талын тус тусын эх үүсвэрт чиглэдэг.",
    chip: "Төсөл",
  },
  process: {
    label: "Хэрхэн ажилладаг вэ",
    heading:
      "Судалгааны хурд ба нэвтрүүлэлтийн сахилга батад зориулсан гурван шаттай пайплайн.",
    stepTemplate: "Алхам {n}",
    steps: [
      {
        title: "Өгөгдөл цуглуулалт ба feature engineering",
        detail:
          "Алтернатив, макро, үнэ, опцион, микроструктурын өгөгдлийг 200+ инженерчилсэн feature болгон нормчилдог.",
      },
      {
        title: "Модель сонголт ба ансамбль",
        detail:
          "Өрсөлдөгч 13 алгоритмыг үнэлж, хослуулан, зах зээлийн олон горимд стресс-тест хийдэг.",
      },
      {
        title: "Гүйцэтгэл ба эрсдэлийн удирдлага",
        detail:
          "Сигналууд багцын хяналт, гүйцэтгэлийн мониторинг, эрсдэлийн давхарга бүхий шууд арилжааны интеграцид дамждаг.",
      },
    ],
  },
  tech: {
    label: "Технологийн стек",
    heading: "Квант машин сургалтад зориулан бүтээсэн дэд бүтэц.",
    paragraph:
      "Уг стек нь судалгааны хэрэгсэл, модель сургалтын фреймворк, өгөгдлийн үйлчилгээ, продакшн савлагааг давтагдахуйц квант ажлын урсгалд нэгтгэдэг.",
  },
  contact: {
    label: "Холбоо барих",
    heading:
      "Дэвшилтэт аналитик ба AI шийдлийн чиглэлээр Deep Beta Technology LLC-тэй хамтран ажиллаарай.",
    paragraph:
      "Байгууллагын AI түншлэл, санхүүгийн бүтээгдэхүүний бэктест, Treasury буюу мөнгөн хөрөнгийн удирдлага, дэвшилтэт аналитик шийдэл, квант судалгааны хамтын ажиллагааны талаар бидэнтэй холбогдоорой.",
    requestAccess: "Хандалт хүсэх",
    disclaimer:
      "Хуулийн анхааруулга: Deep Beta Technology LLC нь технологийн нийлүүлэгч юм. Бид шийдэл, үйлчилгээ борлуулж, квант моделүүдээ лицензийн төлбөрөөр ашиглуулдаг — үйлчлүүлэгчийн данс, хөрөнгийг хэзээ ч өөрийн хадгаламжид (custody) авдаггүй бөгөөд ашиг хуваах нөхцөлөөр ажилладаггүй. Манай дэвшилтэт аналитик, бэктест, програм хангамж, AI дэд бүтэц нь зөвхөн мэдээллийн болон байгууллагын хэрэглээнд зориулагдсан. Энэ нь санхүүгийн зөвлөгөө биш. Зөвхөн мэргэшсэн хөрөнгө оруулагчдад зориулав.",
  },
  footer: {
    links: {
      projects: "Төслүүд",
      research: "Судалгаа",
      about: "Бидний тухай",
      contact: "Холбоо барих",
      privacy: "Нууцлалын бодлого",
      terms: "Үйлчилгээний нөхцөл",
    },
    rights: "© 2025 Deep Beta Technology LLC. Бүх эрх хуулиар хамгаалагдсан.",
    businessModel:
      "Технологийн нийлүүлэгч — үйлчлүүлэгчийн хөрөнгийг хадгалдаггүй, ашиг хуваадаггүй.",
    disclaimer:
      "Санхүүгийн зөвлөгөө биш. Зөвхөн мэргэшсэн хөрөнгө оруулагчдад зориулав.",
  },
};

const ko: Dict = {
  meta: {
    title: "Deep Beta Technology LLC | 고급 애널리틱스 & AI 솔루션",
    description:
      "Deep Beta Technology LLC는 기업에 트레저리(자금) 관리, AI 솔루션, 퀀트 ML & AI 알고리즘 트레이딩을 제공합니다. 금융 상품에 대한 고급 애널리틱스와 백테스팅.",
  },
  nav: {
    tagline: "고급 애널리틱스 & AI 솔루션",
    links: {
      about: "소개",
      projects: "프로젝트",
      process: "프로세스",
      technology: "기술",
      contact: "문의",
    },
    requestAccess: "액세스 요청",
  },
  hero: {
    h1Gradient: "고급 애널리틱스 & AI,",
    h1Rest: "엔지니어링으로 완성하다.",
    paragraph:
      "Deep Beta Technology LLC는 기업 고객에게 고급 애널리틱스, 금융 상품에 대한 엄격한 백테스팅, AI 솔루션을 제공합니다. 우리 플랫폼은 알파 리서치, 리스크, 실행 인프라 전반에 걸쳐 13개의 퀀트 ML 모델을 결합합니다.",
    exploreProjects: "프로젝트 살펴보기",
    contactUs: "문의하기",
    mandateLabel: "엔터프라이즈 미션",
    mandateText:
      "체계적인 엔터프라이즈 워크플로를 뒷받침하는 고급 애널리틱스, 금융 백테스팅, AI 솔루션.",
    highlights: [
      "퀀트 ML & AI 알고리즘 트레이딩",
      "트레저리(자금) 관리 솔루션",
      "엔터프라이즈급 AI 솔루션",
    ],
  },
  stats: [
    "13개 퀀트 ML 프로젝트",
    "4개 자산군",
    "200개 이상의 엔지니어링된 피처",
    "AI 기반",
  ],
  about: {
    label: "소개",
    heading: "체계적인 엔터프라이즈 경쟁력을 위한 고급 애널리틱스 & AI 파트너.",
    paragraph:
      "Deep Beta Technology LLC는 기업에 고급 애널리틱스, 금융 상품 백테스팅, AI 솔루션을 제공하는 기술 기업입니다. 플랫폼은 엄격한 데이터 관리, 견고한 피처 엔지니어링, 포트폴리오를 고려한 모델 배포를 중심으로 설계되었습니다. 당사는 순수 기술 공급자로 운영됩니다. 고객은 라이선스 비용으로 당사의 솔루션·서비스·퀀트 모델을 이용하며, 당사는 고객의 계좌나 자산을 수탁(커스터디)하지 않고 수익을 배분하지도 않습니다.",
    pillars: [
      "체계적인 엔터프라이즈 전략을 위한 퀀트 ML & AI 알고리즘 트레이딩",
      "엄격한 워크포워드(walk-forward) 검증에 기반한 금융 상품 백테스팅",
      "유동성·외환·리스크 관리를 위한 트레저리(자금) 관리 솔루션",
      "자산군과 시장 국면 전반에 적응하도록 설계된 앙상블 기법과 AI 솔루션",
    ],
  },
  projects: {
    label: "13개 퀀트 ML 프로젝트",
    heading: "퀀트 트레이딩 스택 전반을 아우르는 리서치 스위트.",
    paragraph:
      "각 프로젝트는 시장 국면 탐지와 피처 기반 예측부터 실행 인텔리전스, 포트폴리오 구성까지 서로 다른 엣지의 원천을 겨냥합니다.",
    chip: "프로젝트",
  },
  process: {
    label: "작동 방식",
    heading: "리서치 속도와 배포 규율을 위해 설계된 3단계 파이프라인.",
    stepTemplate: "{n}단계",
    steps: [
      {
        title: "데이터 수집 & 피처 엔지니어링",
        detail:
          "대체 데이터, 매크로, 가격, 옵션, 마이크로스트럭처 데이터를 200개 이상의 엔지니어링된 피처로 정규화합니다.",
      },
      {
        title: "모델 선택 & 앙상블",
        detail:
          "13개의 경쟁 알고리즘을 평가·블렌딩하고 여러 시장 국면에 걸쳐 스트레스 테스트합니다.",
      },
      {
        title: "실행 & 리스크 관리",
        detail:
          "시그널은 포트폴리오 통제, 실행 모니터링, 리스크 오버레이를 갖춘 실시간 트레이딩 통합으로 이어집니다.",
      },
    ],
  },
  tech: {
    label: "기술 스택",
    heading: "퀀트 머신러닝을 위해 특별히 구축된 인프라.",
    paragraph:
      "리서치 도구, 모델 학습 프레임워크, 데이터 서비스, 프로덕션 패키징을 결합해 반복 가능한 퀀트 워크플로를 지원합니다.",
  },
  contact: {
    label: "문의하기",
    heading:
      "고급 애널리틱스와 AI 솔루션을 위해 Deep Beta Technology LLC와 협력하세요.",
    paragraph:
      "엔터프라이즈 AI 파트너십, 금융 상품 백테스팅, 트레저리(자금) 관리, 고급 애널리틱스 솔루션, 퀀트 리서치 협업에 대해 문의해 주세요.",
    requestAccess: "액세스 요청",
    disclaimer:
      "법적 고지: Deep Beta Technology LLC는 기술 공급자입니다. 당사는 솔루션과 서비스를 판매하고 퀀트 모델을 라이선스 비용 기반으로 제공하며, 고객의 계좌나 자산을 수탁(커스터디)하지 않고 수익 배분 방식으로도 참여하지 않습니다. 당사의 고급 애널리틱스, 백테스팅, 소프트웨어, AI 인프라는 정보 제공 및 기업 용도로만 제공됩니다. 투자 자문이 아닙니다. 적격 투자자 전용입니다.",
  },
  footer: {
    links: {
      projects: "프로젝트",
      research: "리서치",
      about: "소개",
      contact: "문의",
      privacy: "개인정보 처리방침",
      terms: "이용약관",
    },
    rights: "© 2025 Deep Beta Technology LLC. 모든 권리 보유.",
    businessModel: "기술 공급자 — 고객 자산 수탁 및 수익 배분 없음.",
    disclaimer: "투자 자문이 아닙니다. 적격 투자자 전용입니다.",
  },
};

const dictionaries: Record<Lang, Dict> = { en, mn, ko };

export function getDict(lang: Lang): Dict {
  return dictionaries[lang] ?? en;
}
