/* Deep Beta Technology LLC — interactions */
(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* ---- year ---- */
  const y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();

  /* ---- formatting helpers ---- */
  const fmt = d => d.toTimeString().slice(0, 8);
  const fmtPx = v => {
    const a = Math.abs(v);
    if (a >= 1000) return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (a >= 1)    return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return v.toFixed(4);
  };
  const fmtVol = v => {
    if (!Number.isFinite(v)) return '';
    return 'vol24 ' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  /* ---- live data sources ----
     Crypto:  Binance public REST (no key, CORS-enabled) — last price, 24h % change, 24h quote volume.
     Macro:   optional JSON proxy endpoint you host (keeps any API keys server-side). Configure via
                <meta name="deepbeta-macro-url" content="https://…"> or window.DEEPBETA_MACRO_URL.
              Expected shape: { "AAPL": { "price": 309.4, "changePct": -1.84, "volume": 12345 }, … }
              When unset/unreachable, macro cards keep their static snapshot from data-px/data-chg. */
  const CRYPTO_API = 'https://api.binance.com/api/v3/ticker/24hr';
  const CRYPTO_REFRESH_MS = 10000;
  const MACRO_REFRESH_MS = 30000;
  const macroEndpoint =
    (window.DEEPBETA_MACRO_URL || '').trim() ||
    ($('meta[name="deepbeta-macro-url"]')?.content || '').trim();

  /* ---- card rendering ---- */
  const cards = $$('.card');
  const cardBySym = new Map();
  cards.forEach(c => {
    const sym = c.dataset.sym;
    cardBySym.set(sym, c);
    c._px = parseFloat(c.dataset.px);
    c._chg = parseFloat(c.dataset.chg);
    c._vol = NaN;
    c._volLabel = c.dataset.vol || ''; // static fallback label for macro (e.g. "yfinance", "fmp")
  });

  const renderCard = c => {
    const dir = c._chg >= 0 ? 'up' : 'down';
    const sign = c._chg >= 0 ? '+' : '';
    const vol = Number.isFinite(c._vol) ? fmtVol(c._vol) : c._volLabel;
    c.innerHTML = `
      <span class="sym">${c.dataset.sym}</span>
      <span class="px">${fmtPx(c._px)}</span>
      <span class="chg ${dir}">${sign}${c._chg.toFixed(2)}% (24h)</span>
      <span class="vol">${vol}</span>`;
  };

  const flash = c => {
    c.classList.remove('tick-up', 'tick-down');
    // force reflow so the animation restarts even on consecutive ticks
    void c.offsetWidth;
    c.classList.add(c._dir === 'up' ? 'tick-up' : 'tick-down');
  };

  const applyQuote = (sym, { price, changePct, volume }) => {
    const c = cardBySym.get(sym);
    if (!c) return;
    if (Number.isFinite(price)) {
      c._dir = price >= c._px ? 'up' : 'down';
      c._px = price;
    }
    if (Number.isFinite(changePct)) c._chg = changePct;
    if (Number.isFinite(volume)) c._vol = volume;
    renderCard(c);
    if (c._dir) flash(c);
  };

  /* track last successful data time per row so the clock reflects feed freshness */
  const rowFreshAt = {}; // { crypto: Date, macro: Date }
  const markRowLive = (rowClass, when) => {
    rowFreshAt[rowClass] = when || new Date();
  };
  const renderClocks = () => {
    $$('.ticker-row').forEach(row => {
      const clock = row.querySelector('[data-clock]');
      if (!clock) return;
      const fresh = rowFreshAt[row.dataset.class];
      clock.textContent = 'LIVE · ' + fmt(fresh || new Date());
    });
  };

  /* initial paint from static snapshot so nothing is blank before fetch resolves */
  cards.forEach(renderCard);

  /* ---- fetch: crypto (Binance) ---- */
  const cryptoSyms = ['BTCUSD', 'ETHUSD', 'SOLUSD', 'BNBUSD', 'XRPUSD'].filter(s => cardBySym.has(s));
  const toBinance = sym => sym.replace(/USD$/, 'USDT'); // BTCUSD -> BTCUSDT
  const fetchCrypto = async () => {
    if (!cryptoSyms.length) return;
    try {
      const pairs = cryptoSyms.map(toBinance);
      const url = `${CRYPTO_API}?symbols=${encodeURIComponent(JSON.stringify(pairs))}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Binance ${res.status}`);
      const data = await res.json();
      const byPair = new Map(data.map(d => [d.symbol, d]));
      cryptoSyms.forEach(sym => {
        const d = byPair.get(toBinance(sym));
        if (!d) return;
        applyQuote(sym, {
          price: parseFloat(d.lastPrice),
          changePct: parseFloat(d.priceChangePercent),
          volume: parseFloat(d.quoteVolume),
        });
      });
      markRowLive('crypto', new Date());
      renderClocks();
    } catch (err) {
      /* keep last good values; surface for debugging only */
      console.warn('[deepbeta] crypto feed unavailable:', err.message);
    }
  };

  /* ---- fetch: macro (optional proxy) ---- */
  const macroSyms = ['DXY', 'SP500', 'NASDAQ', 'AAPL', 'NVDA'].filter(s => cardBySym.has(s));
  const fetchMacro = async () => {
    if (!macroEndpoint || !macroSyms.length) return;
    try {
      const res = await fetch(macroEndpoint, { cache: 'no-store' });
      if (!res.ok) throw new Error(`macro ${res.status}`);
      const data = await res.json();
      let any = false;
      macroSyms.forEach(sym => {
        const q = data && data[sym];
        if (!q) return;
        any = true;
        applyQuote(sym, {
          price: parseFloat(q.price),
          changePct: parseFloat(q.changePct),
          volume: q.volume != null ? parseFloat(q.volume) : NaN,
        });
      });
      if (any) { markRowLive('macro', new Date()); renderClocks(); }
    } catch (err) {
      console.warn('[deepbeta] macro feed unavailable:', err.message);
    }
  };

  /* clock ticks every second; shows current time until a feed reports fresh data,
     then reflects that feed's last update time */
  renderClocks();
  setInterval(renderClocks, 1000);

  /* kick off feeds */
  fetchCrypto();
  fetchMacro();
  setInterval(fetchCrypto, CRYPTO_REFRESH_MS);
  if (macroEndpoint) setInterval(fetchMacro, MACRO_REFRESH_MS);

  /* ---- count-up perf metrics ---- */
  const countUp = el => {
    const target = parseFloat(el.dataset.count);
    const dec    = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const dur    = 1100;
    const t0     = performance.now();
    const sign   = target < 0 ? '-' : '';
    const abs    = Math.abs(target);
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = abs * eased;
      el.textContent = sign + v.toFixed(dec) + suffix;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  $$('.perf-v[data-count]').forEach(el => io.observe(el));

  /* ---- equity curve SVG ---- */
  const drawChart = () => {
    const svg = $('.chart'); if (!svg) return;
    const W = 1200, H = 360, PAD = 14;
    const N = 260;
    let v = 10000;
    const pts = [];
    let mx = v, mn = v;
    // pseudo random walk biased upward
    let seed = 7;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < N; i++) {
      const r = (rand() - 0.46) * 0.024; // slight positive drift
      v = v * (1 + r);
      pts.push(v);
      if (v > mx) mx = v;
      if (v < mn) mn = v;
    }
    const x = i => PAD + (i / (N - 1)) * (W - 2 * PAD);
    const y = val => {
      const k = (val - mn) / (mx - mn || 1);
      return H - PAD - k * (H - 2 * PAD);
    };
    let d = `M ${x(0).toFixed(1)} ${y(pts[0]).toFixed(1)}`;
    for (let i = 1; i < N; i++) d += ` L ${x(i).toFixed(1)} ${y(pts[i]).toFixed(1)}`;

    let area = d + ` L ${x(N-1).toFixed(1)} ${H-PAD} L ${x(0).toFixed(1)} ${H-PAD} Z`;

    svg.innerHTML = `
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#f5c518" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#f5c518" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#g1)"></path>
      <path d="${d}" fill="none" stroke="#f5c518" stroke-width="2"></path>
    `;
  };
  drawChart();
  window.addEventListener('resize', () => requestAnimationFrame(drawChart));

  /* ---- i18n (EN default) ----
     English is snapshotted from the markup itself. Only keys listed below are
     translated; anything too technical to translate well is deliberately
     omitted and falls back to the original English. */
  const I18N = {
    mn: {
      'nav.models': 'моделүүд',
      'nav.assets': 'хөрөнгө',
      'nav.stack': 'архитектур',
      'nav.performance': 'гүйцэтгэл',
      'nav.research': 'судалгаа',
      'nav.partners': 'хамтын ажиллагаа',
      'nav.contact': 'холбоо барих',
      'hero.kicker': '<span class="dot"></span> DEEP BETA TECHNOLOGY LLC · ДЭВШИЛТЭТ АНАЛИТИК · AI ШИЙДЛҮҮД',
      'hero.h1': '<span class="num">13</span> квант ML модель. <span class="acc">Нэг бэктест хийгдсэн</span> альфа хөдөлгүүр.',
      'hero.lede': 'Deep Beta Technology LLC нь дэвшилтэт аналитик, санхүүгийн бүтээгдэхүүний нарийвчилсан бэктест, байгууллагын түвшний AI шийдлүүдийг хүргэдэг. UP, BREAKOUT, REGRESSION зэрэг 13 төрөлжсөн machine-learning модель хөрөнгө бүрийг бар тутамд үнэлж, сигналуудыг хязгаарлагдмал эрсдэлийн удирдлага болон орчин үеийн гүйцэтгэлийн давхаргаар дамжуулдаг.',
      'hero.ctaBrainy': '▶ Brainy платформ нээх',
      'hero.ctaBacktest': 'Бэктестийн үр дүн үзэх',
      'hero.founder': 'Үүсгэн байгуулагч · <a href="https://www.linkedin.com/in/nyamochirbold/" target="_blank" rel="noopener">Nyam-Ochir Bold</a>',
      'models.h2': '<span class="bar"></span> 13 МОДЕЛИЙН БҮЛ · НЭГ ПЛАТФОРМ',
      'models.sub': 'Модель бүрийг тусад нь сургаж, walk-forward валидаци хийж, Sharpe / Calmar / Drawdown / Return үзүүлэлтээр эрэмбэлдэг.',
      'assets.h2': '<span class="bar"></span> ХӨРӨНГИЙН ХАМРАЛТ · ГЛОБАЛ КРОСС-АССЕТ',
      'assets.sub': 'АНУ-ын томоохон хувьцаанаас Ази-Номхон далай, крипто мажорс хүртэл — нэг feature пайплайн, нэг эрсдэлийн бүртгэл.',
      'assets.us': 'АНУ-ын хувьцаа',
      'assets.apac': 'Ази-Номхон далай',
      'assets.idx': 'Индекс ба фьючерс',
      'assets.cmd': 'Түүхий эд',
      'assets.crypto': 'Крипто мажорс',
      'features.h2': '<span class="bar"></span> FEATURE ENGINE · МУЛЬТИМОДАЛ ОРОЛТ',
      'features.sub': 'Feature-үүдийг үндсэн хэсгүүдэд үүсгэж, модель бар харахаас өмнө нэгтгэдэг.',
      'stack.h2': '<span class="bar"></span> АРХИТЕКТУР · СУДАЛГААНААС ГҮЙЦЭТГЭЛ ХҮРТЭЛ',
      'stack.sub': 'Давхарга бүрийг тусад нь тестлэх, солих боломжтой.',
      'perf.h2': '<span class="bar"></span> ГҮЙЦЭТГЭЛ · БЭКТЕСТ ХИЙГДСЭН МОДЕЛУУД',
      'perf.sub': 'Продакшн моделийн бүлийн валидацийн цонхны нэгдсэн үзүүлэлтүүд. Зөвхөн жишиг — өнгөрсөн гүйцэтгэл ирээдүйн үр дүнг баталгаажуулахгүй.',
      'perf.cta': '▶ Багцын бэктест ажиллуулах',
      'firm.h2': '<span class="bar"></span> КОМПАНИ',
      'firm.p': 'Deep Beta Technology LLC нь байгууллагуудад дэвшилтэт аналитик, санхүүгийн бүтээгдэхүүний бэктест, AI шийдлүүдийг хүргэдэг технологийн компани юм. Манай үйлчилгээ Treasury буюу мөнгөн хөрөнгийн удирдлага, байгууллагын AI шийдлүүд, квант ML ба AI алгоритмын арилжааг хамардаг. Судалгаа, эрсдэл, гүйцэтгэлийн стек нь глобал кросс-ассет зах зээлд зориулсан 13 моделийн machine-learning хөдөлгүүртэй, дотоод "Brainy" платформ дээр бүрэн ажилладаг.',
      'firm.model': 'Бид зөвхөн технологийн нийлүүлэгчийн хувиар ажилладаг: үйлчлүүлэгчид манай шийдэл, үйлчилгээ, квант моделүүдийг лицензийн төлбөрөөр ашигладаг. Бид үйлчлүүлэгчийн данс, хөрөнгийг хэзээ ч кастодид (custody) авдаггүй, ашиг хуваадаггүй.',
      'founder.h3': 'Үүсгэн байгуулагч',
      'founder.p': '<b>Ням-Очир Болд (Nyam-Ochir Bold)</b> — Deep Beta Technology LLC-г удирдаж буй квант судлаач, инженер.',
      'founder.note': 'Deep Beta-г үүсгэн байгуулахаас өмнө Ням-Очир гадаад квант хөрөнгө оруулалтын байгууллагуудтай хамтран ажиллаж, хувьцаа, түүхий эд, форекс, дериватив, опционы зах зээлд өндөр гүйцэтгэлтэй ML стратеги, иж бүрэн бэктест хөгжүүлж байсан. Эдгээр нь үүсгэн байгуулагчийн хувийн хамтын ажиллагаа бөгөөд Deep Beta Technology LLC-ийн түншлэл биш.',
      'partners.h2': '<span class="bar"></span> ҮҮСГЭН БАЙГУУЛАГЧИЙН ӨМНӨХ ХАМТЫН АЖИЛЛАГАА',
      'partners.sub': 'Deep Beta Technology LLC байгуулагдахаас өмнө үүсгэн байгуулагчийн хувиараа хамтран ажиллаж байсан байгууллагууд. Эдгээр нь Deep Beta Technology LLC-ийн түншлэл биш.',
      'partners.tag': 'ӨМНӨХ ХАМТЫН АЖИЛЛАГАА',
      'partners.eip': 'Европ болон дэлхийн санхүүгийн зах зээлд үйл ажиллагаа явуулдаг хөрөнгө оруулалтын холдинг компани.',
      'partners.anna': 'Системтэй стратеги, санхүүгийн инновацид төвлөрсөн альтернатив хөрөнгө оруулалтын сан.',
      'partners.dfg': 'Квант хөрөнгө оруулалт, AI стратеги, Номхон далай дамнасан хөрөнгийн удирдлага.',
      'cta.h2': 'Brainy платформыг туршаад үзээрэй.',
      'cta.sub': 'Бүх DeepBeta universe-ийн шууд мониторинг, бэктест, моделийн эрэмбэ, багцын нэгтгэл.',
      'footer.legal': '© <span data-year></span> Deep Beta Technology LLC. Бүх эрх хуулиар хамгаалагдсан. Технологийн нийлүүлэгч — бид шийдэл, үйлчилгээ борлуулж, квант моделүүдээ лицензийн төлбөрөөр ашиглуулдаг; үйлчлүүлэгчийн данс, хөрөнгийг хэзээ ч кастодид авдаггүй, ашиг хуваадаггүй. Зөвхөн судалгаа, мэдээллийн зориулалттай. Хөрөнгө оруулалтын зөвлөгөө биш. Өнгөрсөн гүйцэтгэл ирээдүйн үр дүнг баталгаажуулахгүй.',
    },
    ko: {
      'nav.models': '모델',
      'nav.assets': '자산',
      'nav.features': '피처',
      'nav.stack': '스택',
      'nav.performance': '성과',
      'nav.research': '리서치',
      'nav.partners': '파트너',
      'nav.contact': '문의',
      'hero.kicker': '<span class="dot"></span> DEEP BETA TECHNOLOGY LLC · 고급 애널리틱스 · AI 솔루션',
      'hero.h1': '<span class="num">13</span>개 퀀트 ML 모델. <span class="acc">하나의 백테스트된</span> 알파 엔진.',
      'hero.lede': 'Deep Beta Technology LLC는 고급 애널리틱스, 금융 상품에 대한 엄격한 백테스팅, 엔터프라이즈급 AI 솔루션을 제공합니다. UP, BREAKOUT, REGRESSION을 비롯한 13개의 전문 머신러닝 모델이 매 바(bar)마다 모든 자산을 스코어링하고, 시그널은 제약 기반 리스크 관리와 최신 실행 레이어를 거칩니다.',
      'hero.ctaBrainy': '▶ Brainy 플랫폼 실행',
      'hero.ctaBacktest': '백테스트 결과 보기',
      'hero.founder': '설립자 · <a href="https://www.linkedin.com/in/nyamochirbold/" target="_blank" rel="noopener">Nyam-Ochir Bold</a>',
      'models.h2': '<span class="bar"></span> 13개 모델 패밀리 · 하나의 플랫폼',
      'models.sub': '각 모델은 독립적으로 학습되고 워크포워드 검증을 거치며 Sharpe / Calmar / Drawdown / Return 기준으로 랭킹됩니다.',
      'assets.h2': '<span class="bar"></span> 자산 커버리지 · 글로벌 크로스애셋',
      'assets.sub': '미국 대형주부터 아시아·태평양, 주요 암호화폐까지 — 하나의 피처 파이프라인, 하나의 리스크 북.',
      'assets.us': '미국 주식',
      'assets.apac': '아시아·태평양',
      'assets.idx': '지수 & 선물',
      'assets.cmd': '원자재',
      'assets.crypto': '주요 암호화폐',
      'features.h2': '<span class="bar"></span> 피처 엔진 · 멀티모달 입력',
      'features.sub': '피처는 주요 파트별로 생성되어 모델이 바(bar)를 보기 전에 융합됩니다.',
      'stack.h2': '<span class="bar"></span> 아키텍처 · 리서치에서 실행까지',
      'stack.sub': '각 레이어는 독립적으로 테스트하고 교체할 수 있습니다.',
      'perf.h2': '<span class="bar"></span> 성과 · 백테스트된 모델',
      'perf.sub': '프로덕션 모델 패밀리의 검증 구간 집계치입니다. 참고용이며, 과거 성과가 미래 결과를 보장하지 않습니다.',
      'perf.cta': '▶ 포트폴리오 백테스트 실행',
      'firm.h2': '<span class="bar"></span> 회사 소개',
      'firm.p': 'Deep Beta Technology LLC는 기업에 고급 애널리틱스, 금융 상품 백테스팅, AI 솔루션을 제공하는 기술 기업입니다. 서비스는 트레저리(자금) 관리, 엔터프라이즈 AI 솔루션, 퀀트 ML & AI 알고리즘 트레이딩을 아우릅니다. 리서치·리스크·실행 스택은 글로벌 크로스애셋 시장을 위한 13개 모델 머신러닝 엔진과 함께 내부 "Brainy" 플랫폼에서 엔드투엔드로 구동됩니다.',
      'firm.model': '당사는 순수 기술 공급자로 운영됩니다. 고객은 라이선스 비용으로 당사의 솔루션·서비스·퀀트 모델을 이용하며, 당사는 고객의 계좌나 자산을 수탁(커스터디)하지 않고 수익을 배분하지도 않습니다.',
      'founder.h3': '설립자',
      'founder.p': '<b>Nyam-Ochir Bold</b> — Deep Beta Technology LLC를 이끄는 퀀트 리서처이자 엔지니어.',
      'founder.note': 'Deep Beta 설립 이전, Nyam-Ochir는 해외 퀀트 투자 기관들과 협업하며 주식·원자재·외환·파생상품·옵션 시장 전반에 걸쳐 고성능 ML 기반 전략과 엔드투엔드 백테스팅을 제공했습니다. 이는 설립자의 개인적 협업이며 Deep Beta Technology LLC의 파트너십이 아닙니다.',
      'partners.h2': '<span class="bar"></span> 설립자의 과거 협업',
      'partners.sub': 'Deep Beta Technology LLC 설립 이전에 설립자가 개인적으로 협업한 기관들입니다. Deep Beta Technology LLC의 파트너십이 아닙니다.',
      'partners.tag': '과거 협업',
      'partners.eip': '유럽 및 글로벌 금융시장에서 활동하는 투자 지주회사.',
      'partners.anna': '시스터매틱 전략과 금융 혁신에 집중하는 대체투자 펀드.',
      'partners.dfg': '퀀트 투자, AI 전략, 태평양을 잇는 자본 운용.',
      'cta.h2': 'Brainy 플랫폼을 사용해 보세요.',
      'cta.sub': '모든 DeepBeta 유니버스에 대한 실시간 모니터링, 백테스트, 모델 랭킹, 포트폴리오 집계.',
      'footer.legal': '© <span data-year></span> Deep Beta Technology LLC. 모든 권리 보유. 기술 공급자 — 솔루션과 서비스를 판매하고 퀀트 모델을 라이선스 비용으로 제공하며, 고객의 계좌나 자산을 수탁하지 않고 수익을 배분하지 않습니다. 연구/정보 제공 목적. 투자 자문이 아닙니다. 과거 성과는 미래 결과를 보장하지 않습니다.',
    },
  };

  const enSnapshot = {};
  $$('[data-i18n]').forEach(el => { enSnapshot[el.dataset.i18n] = el.innerHTML; });

  const applyLang = lang => {
    $$('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const translated = lang !== 'en' && I18N[lang] && I18N[lang][key];
      el.innerHTML = translated || enSnapshot[key];
    });
    document.documentElement.lang = lang;
    $$('.lang-switch button').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    // footer year lives inside a translated block — refill after swapping
    const yr = $('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();
    try { localStorage.setItem('deepbeta-lang', lang); } catch {}
  };

  $$('.lang-switch button').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));

  let savedLang = 'en';
  try { savedLang = localStorage.getItem('deepbeta-lang') || 'en'; } catch {}
  if (savedLang !== 'en' && I18N[savedLang]) applyLang(savedLang);
})();
