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
})();
