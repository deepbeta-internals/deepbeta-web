/* DeepBeta Capital — interactions */
(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* ---- year ---- */
  const y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();

  /* ---- live clock for ticker rows ---- */
  const fmt = d => d.toTimeString().slice(0,8);
  const updateClocks = () => $$('[data-clock]').forEach(el => el.textContent = 'LIVE · ' + fmt(new Date()));
  updateClocks(); setInterval(updateClocks, 1000);

  /* ---- ticker cards ---- */
  const fmtPx = v => {
    const a = Math.abs(v);
    if (a >= 1000) return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (a >= 1)    return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return v.toFixed(4);
  };
  const volFor = sym => {
    const map = {
      BTCUSD: 'vol24 2,323,381,584.36', ETHUSD: 'vol24 807,525,391.79',
      SOLUSD: 'vol24 145,942,796.01',   BNBUSD: 'vol24 309,759,979.22',
      XRPUSD: 'vol24 152,031,481.66',
      DXY:    'yfinance', SP500: 'fmp', NASDAQ: 'fmp', AAPL: 'fmp', NVDA: 'fmp',
    };
    return map[sym] || '';
  };
  $$('.card').forEach(c => {
    const sym = c.dataset.sym;
    const px  = parseFloat(c.dataset.px);
    const chg = parseFloat(c.dataset.chg);
    c._px = px;
    const dir = chg >= 0 ? 'up' : 'down';
    const sign = chg >= 0 ? '+' : '';
    c.innerHTML = `
      <span class="sym">${sym}</span>
      <span class="px">${fmtPx(px)}</span>
      <span class="chg ${dir}">${sign}${chg.toFixed(2)}% (24h)</span>
      <span class="vol">${volFor(sym)}</span>`;
  });

  /* simulated tick drift, very subtle */
  setInterval(() => {
    $$('.card').forEach(c => {
      const drift = (Math.random() - 0.5) * 0.0008;
      c._px = c._px * (1 + drift);
      const pxEl = c.querySelector('.px');
      if (pxEl) pxEl.textContent = fmtPx(c._px);
    });
  }, 2500);

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
