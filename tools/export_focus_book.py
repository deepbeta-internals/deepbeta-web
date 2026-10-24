"""Export the Brainy Paper Desk book (focus 5 assets) to data/focus-book.json for the static site.

Two sources, same output:

    # local book of record (default: ../brainy-deepbeta/reports/paperdesk)
    python tools/export_focus_book.py
    python tools/export_focus_book.py --reports /srv/brainy/reports/paperdesk

    # live server, HTTP Basic auth from the environment (never on the command line)
    BRAINY_USER=... BRAINY_PASSWORD=... python tools/export_focus_book.py --url https://brainy.deepbeta.mn

Only numbers the public page shows are exported - no alerts, journals, drivers or open-ticket levels.
"""
from __future__ import annotations

import argparse
import base64
import json
import math
import os
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_REPORTS = ROOT.parent / 'brainy-deepbeta' / 'reports' / 'paperdesk'
DEFAULT_OUT = ROOT / 'data' / 'focus-book.json'
SYMBOLS = ('GOLD', 'NAS100', 'WTI', 'BTCUSD', 'ETHUSD')

KPI_EQUITY = ('equity', 'balance', 'unrealized', 'return_pct', 'annualized_pct', 'sharpe', 'sortino',
              'psr_vs_0', 'max_dd_pct', 'current_dd_pct', 'calmar', 'exposure_now', 'open_risk_now',
              'n_open_now', 'days', 'best_day_pct', 'worst_day_pct')
KPI_TRADES = ('n', 'n_closed', 'n_open', 'pnl', 'pnl_realized', 'pnl_open', 'win_rate', 'profit_factor',
              'avg_r', 'avg_r_ci90', 'costs_spread', 'costs_funding')
ASSET_KEYS = ('n', 'n_closed', 'n_open', 'pnl', 'pnl_realized', 'pnl_open', 'win_rate', 'profit_factor',
              'avg_r', 'best', 'worst')
COINFLIP_KEYS = ('n_sims', 'actual', 'mean', 'p05', 'p50', 'p95', 'percentile', 'p_value', 'all_flipped')
CONFIG_KEYS = ('start', 'initial_equity', 'symbols', 'families', 'risk_pct_strong', 'risk_pct_weak',
               'sl_atr', 'tp_atr', 'leverage', 'leverage_mode', 'margin_model', 'max_total_margin_pct')


def _unix(v) -> int | None:
    """ISO string / pandas Timestamp / epoch seconds -> epoch seconds (naive times are UTC)."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return None if isinstance(v, float) and not math.isfinite(v) else int(v)
    if hasattr(v, 'value') and hasattr(v, 'tz_localize'):  # pandas Timestamp
        return None if v != v else int(v.value // 10 ** 9)
    dt = datetime.fromisoformat(str(v).replace('Z', '+00:00'))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return int(dt.timestamp())


def _num(v, nd=2):
    if v is None:
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(f):
        return None
    return round(f, nd) if nd else int(round(f))


def _pick(d: dict, keys) -> dict:
    d = d or {}
    return {k: d.get(k) for k in keys if k in d}


# ------------------------------------------------------------------------------ sources

def load_local(reports: Path):
    import pandas as pd

    an = json.loads((reports / 'analytics.json').read_text(encoding='utf-8'))
    st_path = reports / 'state.json'
    st = json.loads(st_path.read_text(encoding='utf-8')) if st_path.exists() else {}
    E = pd.read_parquet(reports / 'equity.parquet')
    points = [{'time': _unix(t), 'equity': r.equity, 'balance': r.balance, 'dd': r.drawdown_pct,
               'long': r.long_notional, 'short': r.short_notional, 'n_open': r.n_open}
              for t, r in zip(E.index, E.itertuples(index=False))]
    T = pd.read_parquet(reports / 'trades.parquet')
    trades = [{'symbol': r['symbol'], 'status': r['status'], 'exit_time': _unix(r['exit_time']),
               'pnl': r['pnl']} for r in T[['symbol', 'status', 'exit_time', 'pnl']].to_dict('records')]
    overview = dict(an, deployed_at=st.get('deployed_at'), config=an.get('config') or st.get('config'))
    return overview, points, trades


def load_remote(url: str):
    user, pw = os.environ.get('BRAINY_USER', ''), os.environ.get('BRAINY_PASSWORD', '')
    if not (user and pw):
        sys.exit('set BRAINY_USER and BRAINY_PASSWORD for --url')
    token = base64.b64encode(f'{user}:{pw}'.encode()).decode()

    def get(path):
        req = urllib.request.Request(url.rstrip('/') + path, headers={'Authorization': 'Basic ' + token})
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode('utf-8'))

    overview = get('/paperdesk/api/overview')
    points = get('/paperdesk/api/equity?res=1h').get('points', [])
    trades = get('/paperdesk/api/trades?limit=5000').get('rows', [])
    trades = [{'symbol': r.get('symbol'), 'status': r.get('status'), 'exit_time': _unix(r.get('exit_time')),
               'pnl': r.get('pnl')} for r in trades]
    return overview, points, trades


# ------------------------------------------------------------------------------ build

def build(overview: dict, points: list, trades: list) -> dict:
    points = sorted((p for p in points if p.get('time') is not None), key=lambda p: p['time'])
    if not points:
        sys.exit('no equity points in the book')
    cfg = _pick(overview.get('config'), CONFIG_KEYS)
    start_t, end_t = points[0]['time'], points[-1]['time']

    series = {'t': [], 'equity': [], 'balance': [], 'dd': [], 'long': [], 'short': [], 'open': []}
    for p in points:
        series['t'].append(int(p['time']))
        series['equity'].append(_num(p.get('equity'), 0))
        series['balance'].append(_num(p.get('balance'), 0))
        series['dd'].append(_num(p.get('dd'), 3))
        series['long'].append(_num(p.get('long'), 0))
        series['short'].append(_num(p.get('short'), 0))
        series['open'].append(_num(p.get('n_open'), 0))

    # cumulative P&L per asset: closed tickets step in at their exit, open tickets are marked at the last point
    by_symbol = {r.get('symbol'): r for r in overview.get('by_symbol') or []}
    assets = []
    for sym in cfg.get('symbols') or SYMBOLS:
        closed = sorted((t for t in trades if t['symbol'] == sym and t['status'] == 'closed'
                         and t['exit_time'] is not None and _num(t['pnl']) is not None),
                        key=lambda t: t['exit_time'])
        open_pnl = sum(_num(t['pnl']) or 0.0 for t in trades if t['symbol'] == sym and t['status'] == 'open')
        cum, curve = 0.0, [[start_t, 0.0]]
        for t in closed:
            cum += float(t['pnl'])
            if t['exit_time'] == curve[-1][0]:
                curve[-1][1] = round(cum, 2)
            else:
                curve.append([t['exit_time'], round(cum, 2)])
        curve.append([max(end_t, curve[-1][0]), round(cum + open_pnl, 2)])
        row = _pick(by_symbol.get(sym), ASSET_KEYS)
        row.update(symbol=sym, leverage=(cfg.get('leverage') or {}).get(sym), curve=curve)
        assets.append(row)

    kpi = _pick(overview.get('equity'), KPI_EQUITY)
    kpi.update(_pick(overview.get('trades'), KPI_TRADES))
    return {
        'v': 1,
        'exported_utc': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S'),
        'as_of': overview.get('as_of'),
        'deployed_at': overview.get('deployed_at'),
        'config': cfg,
        'kpi': kpi,
        'coinflip': _pick(overview.get('random_baseline'), COINFLIP_KEYS),
        'monthly': [_pick(m, ('month', 'return_pct', 'pnl', 'n_closed', 'win_rate'))
                    for m in overview.get('monthly') or []],
        'assets': assets,
        'series': series,
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    src = ap.add_mutually_exclusive_group()
    src.add_argument('--reports', type=Path, default=DEFAULT_REPORTS, help='paperdesk reports directory')
    src.add_argument('--url', help='Brainy base URL, e.g. https://brainy.deepbeta.mn')
    ap.add_argument('--out', type=Path, default=DEFAULT_OUT)
    a = ap.parse_args()

    overview, points, trades = load_remote(a.url) if a.url else load_local(a.reports)
    book = build(overview, points, trades)
    a.out.parent.mkdir(parents=True, exist_ok=True)
    a.out.write_text(json.dumps(book, separators=(',', ':')), encoding='utf-8')
    k = book['kpi']
    print(f"{a.out.relative_to(ROOT) if a.out.is_relative_to(ROOT) else a.out}: as of {book['as_of']} | "
          f"equity {k.get('equity')} | {len(book['series']['t'])} points | "
          f"{sum(x.get('n', 0) or 0 for x in book['assets'])} tickets | {a.out.stat().st_size // 1024} KB")


if __name__ == '__main__':
    main()
