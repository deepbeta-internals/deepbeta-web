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

  /* ---- focus 5 paper book ----
     The Brainy Paper Desk book, limited to the five focus products: KPI tiles, equity / drawdown /
     exposure panes on one crosshair, P&L by asset and the coin-flip baseline.
     Data: data/focus-book.json, written by tools/export_focus_book.py. Point it elsewhere with
       <meta name="deepbeta-book-url" content="https://…"> or window.DEEPBETA_BOOK_URL. */
  const bookRoot = $('[data-book-root]');
  const bookUrl =
    (window.DEEPBETA_BOOK_URL || '').trim() ||
    ($('meta[name="deepbeta-book-url"]')?.content || '').trim() ||
    'data/focus-book.json';

  /* asset hues: fixed per asset (never by rank), validated for CVD on the #1b1f27 card surface */
  const ASSETS = {
    GOLD:   { color: '#c98500', name: 'Gold',       kind: 'CFD' },
    NAS100: { color: '#3987e5', name: 'Nasdaq 100', kind: 'CFD' },
    WTI:    { color: '#199e70', name: 'WTI crude',  kind: 'CFD' },
    BTCUSD: { color: '#d95926', name: 'Bitcoin',    kind: 'crypto' },
    ETHUSD: { color: '#9085e9', name: 'Ether',      kind: 'crypto' },
  };
  const COL = { eq: '#f5c518', bal: '#9a9582', dd: '#e66767', long: '#3987e5', short: '#e66767', surface: '#1b1f27' };
  const RES_S = { '1h': 3600, '4h': 14400, '1d': 86400 };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MINUS = '−';

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const isNum = v => typeof v === 'number' && Number.isFinite(v);
  const sgn = (v, plus = true) => (v < 0 ? MINUS : plus && v > 0 ? '+' : '');
  const usd = (v, plus = false) => sgn(Math.round(v), plus) + '$' + Math.abs(Math.round(v)).toLocaleString('en-US');
  const pctf = (v, d = 2, plus = true) => sgn(+v.toFixed(d), plus) + Math.abs(v).toFixed(d) + '%';
  const fixed = (v, d) => sgn(+v.toFixed(d), false) + Math.abs(v).toFixed(d);
  const compact = v => {
    const a = Math.abs(v);
    const s = a >= 1e6 ? (a / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
            : a >= 1e3 ? (a / 1e3).toFixed(a >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K'
            : String(Math.round(a));
    return (v < 0 && s !== '0' ? MINUS : '') + s;
  };
  const tone = v => (isNum(v) && v > 0 ? 'up' : isNum(v) && v < 0 ? 'down' : '');
  const ordinal = n => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; };
  const pctile = v => {
    const r = Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : Math.min(v, 99.9).toFixed(1);
    return r + ordinal(Math.floor(+r));
  };
  const two = n => String(n).padStart(2, '0');
  const dayLabel = t => { const d = new Date(t * 1000); return `${d.getUTCDate()} ${MON[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}`; };
  const whenLabel = (t, res) => {
    const d = new Date(t * 1000);
    return res === '1d' ? dayLabel(t) : `${dayLabel(t)} ${two(d.getUTCHours())}:${two(d.getUTCMinutes())}`;
  };

  /* last point of every 1h / 4h / 1d bucket, like the desk's own resample */
  const resample = (S, res) => {
    const step = RES_S[res], keys = Object.keys(S), out = {};
    keys.forEach(k => { out[k] = []; });
    for (let i = 0, n = S.t.length; i < n; i++) {
      if (i === n - 1 || Math.floor(S.t[i + 1] / step) !== Math.floor(S.t[i] / step)) keys.forEach(k => out[k].push(S[k][i]));
    }
    return out;
  };
  const niceTicks = (lo, hi, n) => {
    const raw = (hi - lo) / Math.max(1, n), p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    const step = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p, out = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  };
  const nearest = (arr, v) => {
    let lo = 0, hi = arr.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (arr[m] <= v) lo = m; else hi = m; }
    return v - arr[lo] <= arr[hi] - v ? lo : hi;
  };
  const curveAt = (curve, t) => { // step value of a [[t, v], …] curve at time t
    let lo = 0, hi = curve.length - 1;
    if (t < curve[0][0]) return 0;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (curve[m][0] <= t) lo = m; else hi = m - 1; }
    return curve[lo][1];
  };
  const linePath = (xs, ys) => {
    let d = '';
    for (let i = 0; i < xs.length; i++) d += (i ? 'L' : 'M') + xs[i].toFixed(1) + ' ' + ys[i].toFixed(1);
    return d;
  };
  /* exposure: real bars when there is room for a 2px gap, a right-continuous step area when dense */
  const barsPath = (xs, vals, Y, pw) => {
    const n = xs.length, slot = pw / Math.max(1, n - 1), y0 = Y(0).toFixed(1);
    let d = '';
    if (slot >= 4) {
      const w = Math.min(24, slot - 2);
      for (let i = 0; i < n; i++) {
        if (!vals[i]) continue;
        const x1 = Math.max(0, xs[i] - w / 2), x2 = Math.min(pw, xs[i] + w / 2);
        d += `M${x1.toFixed(1)} ${y0}V${Y(vals[i]).toFixed(1)}H${x2.toFixed(1)}V${y0}Z`;
      }
      return d;
    }
    d = `M0 ${y0}`;
    for (let i = 0; i < n; i++) {
      const y = Y(vals[i]).toFixed(1);
      d += `L${(i ? xs[i - 1] : 0).toFixed(1)} ${y}L${xs[i].toFixed(1)} ${y}`;
    }
    return d + `L${pw} ${y0}Z`;
  };

  if (bookRoot) {
    const part = name => $(`[data-book="${name}"]`, bookRoot);
    const plot = part('plot'), legend = part('legend'), rows = part('assets');
    const reduceMotion = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const state = { data: null, assets: [], view: 'book', res: '4h', S: null, idx: null, pin: null, hover: null, geo: null, w: 0 };

    /* -- static parts -- */
    const noteHtml = b => {
      const c = b.config || {}, lev = c.leverage || {}, syms = state.assets.map(a => a.symbol);
      const levOf = kind => [...new Set(syms.filter(s => ASSETS[s].kind === kind).map(s => lev[s]).filter(isNum))]
        .map(v => Math.round(v) + '×').join(' / ');
      const hz = (c.families || []).map(f => String(f).replace(/^focus_/, '')).join(' · ');
      const rs = c.risk_pct_strong, rw = c.risk_pct_weak;
      return [
        `Deployed <b>${esc(b.deployed_at || c.start || '')}</b> (book replayed from the frozen models up to the first live run, then journalled live)`,
        `<b>${esc(syms.join(' · '))}</b>${hz ? ` on <b>${esc(hz)}</b> horizons` : ''}`,
        rs === rw ? `risk <b>${esc(rs)}%</b> of balance at the stop on every trade`
                  : `risk <b>${esc(rs)}%</b> of balance at the stop on very strong calls, <b>${esc(rw)}%</b> on strong`,
        `SL <b>${esc(c.sl_atr)}×ATR</b> · TP <b>${esc(c.tp_atr)}×ATR</b>`,
        `leverage ${esc(c.leverage_mode || '')} <b>${levOf('CFD')} CFD / ${levOf('crypto')} crypto</b>, ${esc(c.margin_model || '')} margin`,
        'positions close at signal expiry',
        `as of <b>${esc(String(b.as_of || '').slice(0, 16))} UTC</b>`,
      ].join(' · ');
    };

    const tiles = [];
    const renderKpis = b => {
      const k = b.kpi || {}, cf = b.coinflip || {};
      const or = (v, f) => (isNum(v) ? f(v) : '—');
      const ci = k.avg_r_ci90;
      const spread = k.costs_spread || 0, funding = k.costs_funding || 0;
      const start = Date.parse(`${(b.config || {}).start}T00:00:00Z`), since = isNum(start) ? dayLabel(start / 1000).replace(/ /g, ' ') : 'start';
      const defs = [
        ['Equity', k.equity, v => usd(v), 'acc', `${or(k.return_pct, v => pctf(v))} since ${esc(since)}`,
         'Marked-to-market equity of the paper book: closed P&L plus open tickets at the last price'],
        ['P&L', k.pnl, v => usd(v, true), tone(k.pnl), `realised ${or(k.pnl_realized, v => usd(v, true))} · open ${or(k.pnl_open, v => usd(v, true))}`,
         'Net of spread and overnight funding'],
        ['Max drawdown', k.max_dd_pct, v => pctf(v, 2, false), '', `now ${or(k.current_dd_pct, v => pctf(v, 2, false))}`,
         'Worst peak-to-trough fall of hourly marked equity'],
        ['Sharpe', k.sharpe, v => v.toFixed(2), '', `Sortino ${or(k.sortino, v => v.toFixed(2))} · PSR ${or(k.psr_vs_0, v => Math.round(v * 100) + '%')}`,
         'Daily equity returns, annualised ×√365. PSR = probability the true Sharpe is above 0'],
        ['Win rate', isNum(k.win_rate) ? k.win_rate * 100 : null, v => v.toFixed(1) + '%', '', `PF ${or(k.profit_factor, v => v.toFixed(2))} · ${esc(k.n_closed ?? '—')} closed`,
         'Share of closed tickets with positive net P&L. PF = gross wins / gross losses'],
        ['Avg R', k.avg_r, v => fixed(v, 3), tone(k.avg_r), Array.isArray(ci) ? `90% CI ${fixed(ci[0], 2)} … ${fixed(ci[1], 2)}` : 'per closed ticket',
         'Mean net P&L per closed ticket in units of its risk at the stop (bootstrap 90% interval)'],
        ['Vs coin-flip', isNum(cf.percentile) ? cf.percentile * 100 : null, v => pctile(v) + ' pct', '', `p = ${esc(cf.p_value ?? '—')} · edge ${or(cf.actual - cf.mean, v => usd(v, true))}`,
         'Where the book ranks among books with the same tickets but sides drawn by a fair coin'],
        ['Costs', spread + funding, v => usd(v), '', `spread ${usd(spread)} · funding ${usd(funding)}`,
         'Total trading costs already deducted from P&L'],
      ];
      part('kpis').innerHTML = defs.map(([label, , , cls, sub, title]) => `
        <div class="kpi" title="${esc(title)}">
          <div class="kpi-k">${esc(label)}</div>
          <div class="kpi-v ${cls}"></div>
          <div class="kpi-s">${sub}</div>
        </div>`).join('');
      $$('.kpi-v', part('kpis')).forEach((el, i) => {
        const [, v, f] = defs[i];
        el.textContent = isNum(v) ? f(v) : '—';
        if (isNum(v)) tiles.push({ el, v, f });
      });
    };
    const countTiles = () => {
      if (reduceMotion) return;
      const t0 = performance.now(), dur = 1100;
      const tick = t => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        tiles.forEach(({ el, v, f }) => { el.textContent = f(k < 1 ? v * e : v); });
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const renderMonths = b => {
      const months = b.monthly || [], asOfMonth = String(b.as_of || '').slice(0, 7);
      if (!months.length) { part('months').hidden = true; return; }
      part('months').innerHTML = `
        <div class="mo"><div class="mo-k">month</div><div class="mo-v muted">return</div><div class="mo-s">closed · win</div></div>` +
        months.map(m => {
          const [y, mo] = String(m.month).split('-');
          const label = `${MON[+mo - 1] || mo} '${String(y).slice(2)}${m.month === asOfMonth ? ' · mtd' : ''}`;
          return `<div class="mo">
            <div class="mo-k">${esc(label)}</div>
            <div class="mo-v ${tone(m.return_pct)}">${isNum(m.return_pct) ? pctf(m.return_pct) : '—'}</div>
            <div class="mo-s">${esc(m.n_closed ?? 0)} · ${isNum(m.win_rate) ? Math.round(m.win_rate * 100) + '%' : '—'}</div>
          </div>`;
        }).join('');
    };

    const sparkPath = curve => {
      const tA = curve[0][0], tB = curve[curve.length - 1][0] || tA + 1;
      let lo = 0, hi = 0;
      curve.forEach(([, v]) => { lo = Math.min(lo, v); hi = Math.max(hi, v); });
      const span = hi - lo || 1, X = t => ((t - tA) / (tB - tA || 1)) * 100, Y = v => 2 + ((hi - v) / span) * 22;
      let d = '';
      curve.forEach(([t, v], i) => { d += i ? `H${X(t).toFixed(2)}V${Y(v).toFixed(2)}` : `M0 ${Y(v).toFixed(2)}`; });
      return { d: d + 'H100', zero: Y(0).toFixed(2) };
    };
    const renderAssets = () => {
      rows.innerHTML = state.assets.map(a => {
        const m = ASSETS[a.symbol], sp = sparkPath(a.curve);
        const pnl = isNum(a.pnl) ? a.pnl : a.curve[a.curve.length - 1][1];
        const desc = `${m.name} · ${m.kind}${isNum(a.leverage) ? ' ' + Math.round(a.leverage) + '×' : ''}`;
        return `<li class="asset-row" role="button" tabindex="0" aria-pressed="false" data-sym="${esc(a.symbol)}" style="--c:${m.color}"
                    aria-label="${esc(a.symbol)} ${esc(m.name)}, P&amp;L ${usd(pnl, true)}. Show in the by-asset chart">
          <div class="ar-top">
            <div class="ar-name"><span class="key dot"></span><span class="ar-sym">${esc(a.symbol)}</span><span class="ar-desc">${esc(desc)}</span></div>
            <div class="ar-pnl ${tone(pnl)}">${usd(pnl, true)}</div>
          </div>
          <div class="ar-bot">
            <svg class="ar-spark" viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">
              <line x1="0" x2="100" y1="${sp.zero}" y2="${sp.zero}"/><path d="${sp.d}"/>
            </svg>
            <div class="ar-stats"><b>${esc(a.n ?? '—')}</b> trades · win <b>${isNum(a.win_rate) ? Math.round(a.win_rate * 100) + '%' : '—'}</b><br>
              PF <b>${isNum(a.profit_factor) ? a.profit_factor.toFixed(2) : '—'}</b> · avg R <b>${isNum(a.avg_r) ? fixed(a.avg_r, 2) : '—'}</b></div>
          </div>
        </li>`;
      }).join('');
    };

    const renderCoinflip = cf => {
      const box = part('coinflip');
      if (!cf || ![cf.p05, cf.p50, cf.p95, cf.actual].every(isNum)) {
        box.innerHTML = '<p class="cf-note">The coin-flip baseline appears once the book has closed tickets.</p>';
        return;
      }
      let lo = Math.min(cf.p05, cf.actual), hi = Math.max(cf.p95, cf.actual);
      const pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
      const P = v => ((v - lo) / (hi - lo)) * 100;
      const at = P(cf.actual);
      const lblPos = at > 70 ? 'right:0' : at < 30 ? 'left:0' : 'left:50%;transform:translateX(-50%)';
      const beats = isNum(cf.percentile) ? pctile(cf.percentile * 100).replace(/[a-z]+$/, '') + '%' : '—';
      box.innerHTML = `
        <div class="cf-track" role="img" aria-label="Book ${usd(cf.actual, true)} against coin-flip books from ${usd(cf.p05, true)} (5th percentile) to ${usd(cf.p95, true)} (95th)">
          <span class="cf-rail"></span>
          <span class="cf-band" style="left:${P(cf.p05).toFixed(2)}%;width:${(P(cf.p95) - P(cf.p05)).toFixed(2)}%"></span>
          <span class="cf-mark" style="left:${P(cf.p50).toFixed(2)}%"></span>
          <span class="cf-book" style="left:${at.toFixed(2)}%"></span>
          <span class="cf-lbl" style="${lblPos}">book ${usd(cf.actual, true)}</span>
        </div>
        <div class="cf-axis">
          <span style="left:${P(cf.p05).toFixed(2)}%">p5 ${usd(cf.p05, true)}</span>
          <span style="left:${P(cf.p95).toFixed(2)}%;transform:translateX(-100%)">p95 ${usd(cf.p95, true)}</span>
        </div>
        <p class="cf-note">Every closed ticket kept its timing, size, stop, target and costs; only the side was re-drawn by a fair coin
          (${esc((cf.n_sims ?? 0).toLocaleString('en-US'))} books — band: middle 90%, tick: median). The book beats <b>${beats}</b> of them
          (p = ${esc(cf.p_value ?? '—')}).${isNum(cf.all_flipped) ? ` All sides flipped: <b>${usd(cf.all_flipped, true)}</b>.` : ''}</p>`;
    };

    /* -- chart -- */
    const hline = (g, y, cls = 'grid') => { const yy = Math.round(y) + 0.5; return `<line class="${cls}" x1="0" x2="${g.pw}" y1="${yy}" y2="${yy}"/>`; };
    const axisText = (g, y, s) => `<text x="${g.pw + 8}" y="${(y + 3.5).toFixed(1)}">${esc(s)}</text>`;
    const paneLabel = (y, s) => `<text class="pane-label" x="0" y="${y}">${esc(s)}</text>`;
    const tag = (g, y, s, fill, light) => {
      const h = 17, yy = Math.max(1, Math.min(g.yAxis - h, y - h / 2));
      return `<rect x="${g.pw + 3}" y="${yy.toFixed(1)}" width="${g.R - 5}" height="${h}" rx="3" fill="${fill}"/>` +
             `<text class="tag-txt${light ? ' light' : ''}" x="${g.pw + 8}" y="${(yy + 12).toFixed(1)}">${esc(s)}</text>`;
    };
    const ticksAway = (g, ticks, Y, fmt, avoid) => ticks.map(v => {
      const y = Y(v);
      return hline(g, y, v === 0 ? 'base' : 'grid') + (avoid.some(a => Math.abs(a - y) < 13) ? '' : axisText(g, y, fmt(v)));
    }).join('');

    const xAxis = g => {
      let lines = '', labels = '';
      const pxDay = g.pw / Math.max(1, (g.t1 - g.t0) / 86400);
      const first = Math.floor(g.t0 / 86400) * 86400;
      for (let t = first; t <= g.t1; t += 86400) {
        if (t + 86400 <= g.t0) continue; // the first bucket can close after midnight of the first day
        const d = new Date(t * 1000), dom = d.getUTCDate(), x = g.X(Math.max(t, g.t0));
        let s;
        if (dom === 1) {
          s = MON[d.getUTCMonth()] + (d.getUTCMonth() === 0 ? ` '${String(d.getUTCFullYear()).slice(2)}` : '');
          if (x > 0.5) lines += `<line class="grid" x1="${Math.round(x) + 0.5}" x2="${Math.round(x) + 0.5}" y1="${g.top}" y2="${g.yAxis}"/>`;
        } else if (dom === 15 && pxDay >= 3.2) s = '15';
        else continue;
        const anchor = x < 16 ? 'start' : x > g.pw - 16 ? 'end' : 'middle';
        labels += `<text x="${x.toFixed(1)}" y="${g.yAxis + 17}" text-anchor="${anchor}">${s}</text>`;
      }
      return lines + `<line class="base" x1="0" x2="${g.pw}" y1="${g.yAxis + 0.5}" y2="${g.yAxis + 0.5}"/>` + labels;
    };

    const bookPanes = (g, S, H1, H2, H3, GAP) => {
      const n = S.t.length, init = (state.data.config || {}).initial_equity || 100000;
      let s = '';
      /* equity (marked) + balance (realised) */
      let lo = init, hi = init;
      for (let i = 0; i < n; i++) { lo = Math.min(lo, S.equity[i], S.balance[i]); hi = Math.max(hi, S.equity[i], S.balance[i]); }
      const pad = (hi - lo) * 0.08 || 1; lo -= pad; hi += pad;
      const p1 = g.top, Y1 = v => p1 + ((hi - v) / (hi - lo)) * H1;
      const eqLast = S.equity[n - 1], eqTag = Y1(eqLast);
      s += ticksAway(g, niceTicks(lo, hi, g.narrow ? 3 : 5), Y1, compact, [eqTag]);
      const eqD = linePath(g.xs, S.equity.map(Y1));
      s += `<path class="fade" d="${eqD}L${g.pw} ${p1 + H1}L0 ${p1 + H1}Z" fill="url(#bk-eq)"/>`;
      const yi = Math.round(Y1(init)) + 0.5;
      s += `<line class="start" x1="0" x2="${g.pw}" y1="${yi}" y2="${yi}"/><text class="inl" x="6" y="${yi + 14}">start ${usd(init)}</text>`;
      s += `<path d="${linePath(g.xs, S.balance.map(Y1))}" fill="none" stroke="${COL.bal}" stroke-width="1.25" stroke-opacity="0.8" stroke-linejoin="round"/>`;
      s += `<path class="draw" pathLength="1" d="${eqD}" fill="none" stroke="${COL.eq}" stroke-width="2" stroke-linejoin="round"/>`;
      s += tag(g, eqTag, g.narrow ? compact(eqLast) : Math.round(eqLast).toLocaleString('en-US'), COL.eq, false);

      /* drawdown from peak */
      const p2 = p1 + H1 + GAP;
      let ddLo = 0;
      for (let i = 0; i < n; i++) ddLo = Math.min(ddLo, S.dd[i]);
      ddLo = ddLo < 0 ? ddLo * 1.15 : -1;
      const Y2 = v => p2 + (v / ddLo) * H2;
      const ddLast = S.dd[n - 1], ddTag = Y2(ddLast);
      s += paneLabel(p2 - 10, 'Drawdown from peak, %');
      s += ticksAway(g, niceTicks(ddLo, 0, 2), Y2, v => (v === 0 ? '0' : fixed(v, 1)), [ddTag]);
      const ddD = linePath(g.xs, S.dd.map(Y2));
      s += `<path class="fade" d="${ddD}L${g.pw} ${p2}L0 ${p2}Z" fill="${COL.dd}" fill-opacity="0.16"/>`;
      s += `<path d="${ddD}" fill="none" stroke="${COL.dd}" stroke-width="1.5" stroke-linejoin="round"/>`;
      s += tag(g, ddTag, pctf(ddLast, g.narrow ? 1 : 2, false), COL.dd, true);

      /* gross exposure: long above zero, short below */
      const p3 = p2 + H2 + GAP;
      let mxL = 0, mxS = 0;
      for (let i = 0; i < n; i++) { mxL = Math.max(mxL, S.long[i]); mxS = Math.max(mxS, S.short[i]); }
      const top3 = mxL * 1.08 || 1, bot3 = mxS * 1.08 || 1;
      const Y3 = v => p3 + ((top3 - v) / (top3 + bot3)) * H3;
      let lTag = Y3(S.long[n - 1]), sTag = Y3(-S.short[n - 1]);
      if (sTag - lTag < 19) { const mid = (lTag + sTag) / 2; lTag = mid - 9.5; sTag = mid + 9.5; }
      s += paneLabel(p3 - 10, g.narrow ? 'Gross exposure, $' : 'Gross exposure, $ · long above zero, short below');
      s += ticksAway(g, niceTicks(-bot3, top3, 2), Y3, compact, [lTag, sTag]);
      s += `<path class="fade" d="${barsPath(g.xs, S.long, Y3, g.pw)}" fill="${COL.long}" fill-opacity="0.75"/>`;
      s += `<path class="fade" d="${barsPath(g.xs, S.short.map(v => -v), Y3, g.pw)}" fill="${COL.short}" fill-opacity="0.75"/>`;
      s += tag(g, lTag, compact(S.long[n - 1]), COL.long, true) + tag(g, sTag, compact(-S.short[n - 1]), COL.short, true);

      g.Y = { eq: Y1, dd: Y2 };
      return s;
    };

    const assetPane = (g, HA) => {
      const p = g.top;
      let lo = 0, hi = 0, s = '';
      state.assets.forEach(a => a.curve.forEach(([, v]) => { lo = Math.min(lo, v); hi = Math.max(hi, v); }));
      const pad = (hi - lo) * 0.08 || 1; lo -= pad; hi += pad;
      const Y = v => p + ((hi - v) / (hi - lo)) * HA;
      niceTicks(lo, hi, g.narrow ? 4 : 6).forEach(v => {
        s += hline(g, Y(v), v === 0 ? 'base' : 'grid');
        s += `<text class="inl" x="0" y="${(Y(v) - 5).toFixed(1)}">${v === 0 ? '$0' : sgn(v) + '$' + compact(Math.abs(v))}</text>`;
      });
      /* end labels: keep the hue on the dot and leader, the text in ink; spread so they never overlap */
      const ends = state.assets.map(a => ({ a, v: a.curve[a.curve.length - 1][1] }))
        .map(e => ({ ...e, y: Y(e.v), ly: Y(e.v) })).sort((x, y) => x.y - y.y);
      for (let i = 1; i < ends.length; i++) ends[i].ly = Math.max(ends[i].ly, ends[i - 1].ly + 16);
      const over = ends.length ? ends[ends.length - 1].ly - (p + HA - 4) : 0;
      if (over > 0) ends.forEach(e => { e.ly -= over; });
      for (let i = ends.length - 2; i >= 0; i--) ends[i].ly = Math.min(ends[i].ly, ends[i + 1].ly - 16);
      ends.forEach(({ a, v, y, ly }) => {
        const c = ASSETS[a.symbol].color;
        let d = '';
        a.curve.forEach(([t, cv], i) => {
          const x = g.X(Math.min(Math.max(t, g.t0), g.t1)).toFixed(1), yy = Y(cv).toFixed(1);
          d += i ? `H${x}V${yy}` : `M${x} ${yy}`;
        });
        s += `<g class="a-line" data-sym="${esc(a.symbol)}">
          <path class="draw" pathLength="1" d="${d}H${g.pw}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
          <path d="M${g.pw + 4} ${y.toFixed(1)}L${g.pw + 9} ${ly.toFixed(1)}" stroke="${c}" stroke-width="1" fill="none"/>
          <circle cx="${g.pw}" cy="${y.toFixed(1)}" r="4" fill="${c}" stroke="${COL.surface}" stroke-width="2"/>
          <text class="end-label" x="${g.pw + 12}" y="${(ly + 4).toFixed(1)}">${esc(a.symbol)}</text>
          <text class="end-val" x="${g.W - 2}" y="${(ly + 4).toFixed(1)}" text-anchor="end">${g.narrow ? sgn(v) + compact(Math.abs(v)) : usd(v, true)}</text>
        </g>`;
      });
      g.Y = { asset: Y };
      return s;
    };

    const renderChart = () => {
      const S = state.S, W = plot.clientWidth;
      if (!S || !W || S.t.length < 2) return;
      state.w = W;
      const n = S.t.length, narrow = W < 560, isBook = state.view === 'book';
      const R = isBook ? (narrow ? 52 : 68) : (narrow ? 92 : 136);
      const top = 10, GAP = 30, XA = 26, H1 = narrow ? 190 : 250, H2 = narrow ? 58 : 74, H3 = H2;
      const H = top + H1 + GAP + H2 + GAP + H3 + XA;
      const t0 = S.t[0], t1 = S.t[n - 1], pw = W - R;
      const X = t => ((t - t0) / (t1 - t0 || 1)) * pw;
      const g = { W, H, R, pw, top, yAxis: H - XA, t0, t1, X, xs: S.t.map(X), narrow };
      const body = isBook ? bookPanes(g, S, H1, H2, H3, GAP) : assetPane(g, H1 + GAP + H2 + GAP + H3);
      const dots = isBook
        ? `<circle data-k="bal" r="3" fill="${COL.bal}" stroke="${COL.surface}" stroke-width="2"/>
           <circle data-k="eq" r="4.5" fill="${COL.eq}" stroke="${COL.surface}" stroke-width="2"/>
           <circle data-k="dd" r="3.5" fill="${COL.dd}" stroke="${COL.surface}" stroke-width="2"/>`
        : state.assets.map(a => `<circle data-k="${esc(a.symbol)}" r="4" fill="${ASSETS[a.symbol].color}" stroke="${COL.surface}" stroke-width="2"/>`).join('');
      plot.innerHTML = `<svg class="bc-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
        <defs><linearGradient id="bk-eq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${COL.eq}" stop-opacity="0.24"/><stop offset="1" stop-color="${COL.eq}" stop-opacity="0.02"/>
        </linearGradient></defs>
        ${xAxis(g)}${body}
        <g class="hover" visibility="hidden">
          <line class="xhair" y1="${top}" y2="${g.yAxis}"/>${dots}
          <rect class="xlabel-bg" y="${g.yAxis + 4}" height="18" rx="3"/>
          <text class="xlabel" y="${g.yAxis + 17}" text-anchor="middle"></text>
        </g>
      </svg>`;
      plot.setAttribute('aria-label', isBook
        ? 'Paper book equity, drawdown and exposure over time. Use the left and right arrow keys to step through time.'
        : 'Cumulative P&L of each focus asset over time. Use the left and right arrow keys to step through time.');
      state.geo = g;
      showIdx(state.idx);
      applyFocus();
    };

    const renderLegend = i => {
      const S = state.S, j = i == null ? S.t.length - 1 : i, t = S.t[j];
      const item = (kind, color, label, val, sym) =>
        `<span class="lg"${sym ? ` data-sym="${esc(sym)}"` : ''}>${kind ? `<span class="key ${kind}" style="background:${color}"></span>` : ''}${esc(label)} <b>${esc(val)}</b></span>`;
      let html = `<span class="lg-when">${esc(whenLabel(t, state.res))} UTC</span>`;
      if (state.view === 'book') {
        html += item('line', COL.eq, 'equity (marked)', usd(S.equity[j])) +
                item('line', COL.bal, 'balance (realised)', usd(S.balance[j])) +
                item('box', COL.dd, 'drawdown', pctf(S.dd[j], 2, false)) +
                item('box', COL.long, 'long', usd(S.long[j])) +
                item('box', COL.short, 'short', usd(S.short[j])) +
                item(null, null, 'open', String(S.open[j]));
      } else {
        let total = 0;
        state.assets.forEach(a => { const v = curveAt(a.curve, t); total += v; html += item('dot', ASSETS[a.symbol].color, a.symbol, usd(v, true), a.symbol); });
        html += item(null, null, 'total', usd(total, true));
      }
      legend.innerHTML = html;
    };

    function showIdx(i) {
      state.idx = i;
      const g = state.geo, hv = $('.hover', plot);
      if (g && hv) {
        if (i == null) hv.setAttribute('visibility', 'hidden');
        else {
          const S = state.S, t = S.t[i], x = g.xs[i].toFixed(1);
          hv.setAttribute('visibility', 'visible');
          const line = $('.xhair', hv); line.setAttribute('x1', x); line.setAttribute('x2', x);
          $$('circle', hv).forEach(c => {
            const k = c.dataset.k;
            const y = k === 'eq' ? g.Y.eq(S.equity[i]) : k === 'bal' ? g.Y.eq(S.balance[i]) : k === 'dd' ? g.Y.dd(S.dd[i])
                    : g.Y.asset(curveAt(state.assets.find(a => a.symbol === k).curve, t));
            c.setAttribute('cx', x); c.setAttribute('cy', y.toFixed(1));
          });
          const txt = $('.xlabel', hv), bg = $('.xlabel-bg', hv);
          txt.textContent = whenLabel(t, state.res);
          const w = (txt.getComputedTextLength?.() || 90) + 14;
          const lx = Math.max(0, Math.min(g.W - w, g.xs[i] - w / 2));
          bg.setAttribute('x', lx.toFixed(1)); bg.setAttribute('width', w.toFixed(1));
          txt.setAttribute('x', (lx + w / 2).toFixed(1));
        }
      }
      renderLegend(i);
      applyFocus();
    }

    function applyFocus() {
      const f = state.view === 'assets' ? state.hover || state.pin : null;
      $$('.a-line', plot).forEach(n => n.classList.toggle('dim', !!f && n.dataset.sym !== f));
      $$('.hover circle', plot).forEach(c => c.classList.toggle('dim', !!f && !!ASSETS[c.dataset.k] && c.dataset.k !== f));
      $$('.lg[data-sym]', legend).forEach(n => n.classList.toggle('dim', !!f && n.dataset.sym !== f));
      $$('.asset-row', rows).forEach(r => r.setAttribute('aria-pressed', String(r.dataset.sym === state.pin)));
    }

    /* -- controls -- */
    const setSeg = (name, attr, val) => $$('button', part(name)).forEach(b => {
      const on = b.dataset[attr] === val;
      b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on));
    });
    const setView = v => { state.view = v; if (v === 'book') state.pin = null; setSeg('view', 'view', v); renderChart(); };
    const setRes = r => { state.res = r; setSeg('res', 'res', r); state.S = resample(state.data.series, r); state.idx = null; renderChart(); };
    const togglePin = sym => {
      state.pin = state.pin === sym ? null : sym;
      if (state.pin && state.view !== 'assets') setView('assets'); else applyFocus();
    };
    const hoverSym = sym => { if (sym !== state.hover) { state.hover = sym; applyFocus(); } };

    const pointAt = e => {
      const g = state.geo; if (!g) return;
      const x = Math.max(0, Math.min(g.pw, e.clientX - plot.getBoundingClientRect().left));
      showIdx(nearest(state.S.t, g.t0 + (x / g.pw) * (g.t1 - g.t0)));
    };

    const wire = () => {
      part('view').addEventListener('click', e => { const b = e.target.closest('button[data-view]'); if (b) setView(b.dataset.view); });
      part('res').addEventListener('click', e => { const b = e.target.closest('button[data-res]'); if (b) setRes(b.dataset.res); });
      plot.addEventListener('pointermove', pointAt);
      plot.addEventListener('pointerdown', pointAt);
      plot.addEventListener('pointerleave', () => showIdx(null));
      plot.addEventListener('blur', () => showIdx(null));
      plot.addEventListener('keydown', e => {
        const n = state.S.t.length, step = e.shiftKey ? 10 : 1;
        let i = state.idx ?? n - 1;
        if (e.key === 'ArrowLeft') i = Math.max(0, i - step);
        else if (e.key === 'ArrowRight') i = Math.min(n - 1, i + step);
        else if (e.key === 'Home') i = 0;
        else if (e.key === 'End') i = n - 1;
        else if (e.key === 'Escape') { showIdx(null); return; }
        else return;
        e.preventDefault(); showIdx(i);
      });
      rows.addEventListener('click', e => { const r = e.target.closest('.asset-row'); if (r) togglePin(r.dataset.sym); });
      rows.addEventListener('keydown', e => {
        const r = e.target.closest('.asset-row');
        if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); togglePin(r.dataset.sym); }
      });
      rows.addEventListener('pointerover', e => hoverSym(e.target.closest('.asset-row')?.dataset.sym || null));
      rows.addEventListener('pointerleave', () => hoverSym(null));
      legend.addEventListener('pointerover', e => hoverSym(e.target.closest('[data-sym]')?.dataset.sym || null));
      legend.addEventListener('pointerleave', () => hoverSym(null));

      if ('ResizeObserver' in window) new ResizeObserver(() => { if (plot.clientWidth !== state.w) requestAnimationFrame(renderChart); }).observe(plot);
      else window.addEventListener('resize', () => requestAnimationFrame(renderChart));

      /* draw the curve in and count the tiles up once, when the book first scrolls into view */
      if (!reduceMotion && 'IntersectionObserver' in window) {
        plot.classList.add('armed');
        const seen = new IntersectionObserver(entries => {
          if (!entries.some(e => e.isIntersecting)) return;
          seen.disconnect();
          requestAnimationFrame(() => requestAnimationFrame(() => {
            plot.classList.add('revealing'); plot.classList.remove('armed');
            setTimeout(() => plot.classList.remove('revealing'), 2000);
            countTiles();
          }));
        }, { threshold: 0.2 });
        seen.observe(plot);
      }
    };

    const initBook = b => {
      if (!b || !b.series || !Array.isArray(b.series.t) || b.series.t.length < 2) throw new Error('book has no equity series');
      state.data = b;
      state.assets = (b.assets || []).filter(a => ASSETS[a.symbol] && Array.isArray(a.curve) && a.curve.length);
      part('note').innerHTML = noteHtml(b);
      renderKpis(b);
      renderMonths(b);
      renderAssets();
      renderCoinflip(b.coinflip);
      wire();
      bookRoot.classList.remove('is-loading');
      setRes(state.res);
    };

    fetch(bookUrl, { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error(`book ${r.status}`); return r.json(); })
      .then(initBook)
      .catch(err => {
        console.warn('[deepbeta] paper book unavailable:', err.message);
        bookRoot.classList.remove('is-loading');
        bookRoot.classList.add('is-empty');
        $('.book-empty', bookRoot).hidden = false;
      });
  }

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
      'perf.h2': '<span class="bar"></span> ГҮЙЦЭТГЭЛ · ФОКУС 5 · ЗАГВАР АРИЛЖААНЫ БАГЦ',
      'perf.sub': 'Манай таван фокус бүтээгдэхүүн — GOLD, NAS100, WTI, BTCUSD, ETHUSD-ийн 1, 2, 4 өдрийн хугацаат сигнал бүрийг $100K-ийн загвар (paper) багц дээр шууд 15 минутын үнэ, спред, санхүүжилтийн зардлыг тооцон арилжсан. Энэ нь бодит данс биш, загвар арилжаа — өнгөрсөн гүйцэтгэл ирээдүйн үр дүнг баталгаажуулахгүй.',
      'perf.cta': '▶ Paper desk нээх',
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
      'perf.h2': '<span class="bar"></span> 성과 · 포커스 5 모의 트레이딩 북',
      'perf.sub': '다섯 개 포커스 상품(GOLD, NAS100, WTI, BTCUSD, ETHUSD)의 1·2·4일 호라이즌 시그널을 모두 실시간 15분 가격과 스프레드·펀딩 비용을 반영해 $100K 모의(페이퍼) 북에서 거래했습니다. 실제 계좌가 아닌 모의 거래이며, 과거 성과가 미래 결과를 보장하지 않습니다.',
      'perf.cta': '▶ 페이퍼 데스크 열기',
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
