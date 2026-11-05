"""Export the Brainy platform endpoint catalogue to data/brainy-platform.json for the home page.

    python tools/export_platform.py            # read the live OpenAPI specs (BRAINY_API_KEY, env or .env)
    python tools/export_platform.py --check    # ...then GET every light endpoint once and report its status

The catalogue holds hosts, paths, methods, parameter names, one-line descriptions and sample "try"
links. It never holds a credential or a parameter default (defaults can name client mandates).
Routes the OpenAPI specs do not describe (live chart, agents board, options desk, MLflow) are listed
by hand in MANUAL below. Any new route on the main API that matches no ROUTES prefix lands in the
"brainy" group, so nothing the server adds is silently dropped.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from urllib.parse import quote, urlencode

from brainy_client import BRAINY_URL, ROOT, get_json, request, require_auth

TECH_URL = 'https://technical.deepbeta.mn'
AGENTS_URL = 'https://agents.deepbeta.mn'
OPTIONS_URL = 'https://options.deepbeta.mn'
DEFAULT_OUT = ROOT / 'data' / 'brainy-platform.json'

# spec id -> (OpenAPI document, host, path prefix the service is mounted under on that host)
SPECS = {
    'main': (f'{BRAINY_URL}/openapi.json', BRAINY_URL, ''),
    'livedash': (f'{BRAINY_URL}/livedash/openapi.json', BRAINY_URL, '/livedash'),
    'train': (f'{BRAINY_URL}/train/openapi.json', BRAINY_URL, '/train'),
    'technical': (f'{TECH_URL}/openapi.json', TECH_URL, ''),
}

# (service id, spec id, path prefixes) - first match wins. livedash and train mount the investor
# router again; those copies are skipped because the investor group already lists them.
ROUTES = (
    ('paperdesk', 'main', ('/paperdesk/',)),
    ('igtrading', 'main', ('/ig-trading/', '/api/paper/')),
    ('focus', 'main', ('/focus1d', '/api/focus_dashboard')),
    ('investor', 'main', ('/investor/',)),
    ('monitoring', 'main', ('/monitoring/',)),
    ('brainy', 'main', ('',)),
    ('livedash', 'livedash', ('/api/',)),
    ('train', 'train', ('/api/',)),
    ('technical', 'technical', ('',)),
)

# services without an OpenAPI document: (host, [(method, path, description, optional params), ...])
MANUAL = {
    'tradingview': (BRAINY_URL, [
        ('GET', '/tradingview/api/meta', 'Symbols, timeframes, default windows and the books the chart can draw', ''),
        ('GET', '/tradingview/api/quotes', 'Latest quote of every focus product', ''),
        ('GET', '/tradingview/api/chart/{symbol}', 'Candles with the paper-book, backtest-track or archived tickets and the newest calls', 'tf, book, days'),
        ('GET', '/tradingview/api/live/{symbol}', 'The forming candle, volume and live quote', 'tf'),
    ]),
    'agents': (AGENTS_URL, [
        ('GET', '/api/agents', 'The board: every agent, service, scheduled job, daemon and pipeline with its health', ''),
        ('GET', '/api/agents/{agent_id}', 'One agent: role, status, last / next run, cadence, errors and summary', ''),
        ('POST', '/api/agents/{agent_id}/run', 'Start one run of an agent now', ''),
        ('GET', '/api/events', 'Live activity feed across all agents', 'limit'),
        ('GET', '/health', 'Liveness probe - public, no key needed', ''),
    ]),
    'options': (OPTIONS_URL, [
        ('GET', '/api/state', 'Desk state: squeeze, direction lean, options activity, desk calls, term structure, move radar', ''),
        ('GET', '/api/alerts', 'Signal feed, newest first', 'after, n'),
        ('GET', '/api/alerts/stream', 'Signal feed as a server-sent event stream', 'after'),
    ]),
    'mlflow': (BRAINY_URL, [
        ('GET', '/mlflow/api/2.0/mlflow/experiments/search', 'MLflow REST API: tracked experiments (the full MLflow 2.0 REST surface is served here)', 'max_results, filter'),
    ]),
}
# one-liners for routes whose docstring is missing, is just the function name, names a client mandate
# or points at internal files. Keyed by the path as published (mount prefix included).
DESCRIBE = {
    '/assets': 'Every asset the inference API serves, with ticker and category',
    '/health': 'Liveness probe - public, no key needed',
    '/health/ready': 'Readiness probe: at least one usable model and feature set is on disk - public, no key needed',
    '/dashboard/assets': 'Dashboard asset universe with names, categories and key-market flags',
    '/dashboard/available_models': 'Trained model names for one symbol / family / horizon',
    '/dashboard/backtest': 'Backtest one (symbol, family, horizon, model) selection: equity, trades and metrics',
    '/dashboard/best_models_backtest': 'Best (family, horizon, model) per asset, ranked by validation backtest Sharpe / Calmar / drawdown / return',
    '/dashboard/best_up_assets': "Symbols that have a deployable best 'up' backtest entry at the interval",
    '/dashboard/cfd_prices': 'Dealable IG CFD quotes (bid / offer / spread / day stats) for the traded instruments, in model units',
    '/dashboard/manifest': 'Data manifest: raw, macro, feature and processed sets on disk',
    '/dashboard/model_garden': 'Model-garden coverage and tags (detail=true adds every combo row)',
    '/dashboard/model_garden/jobs': 'Recent model-garden build jobs',
    '/dashboard/ohlcv': 'OHLCV bars for one symbol and interval',
    '/dashboard/predictions': 'Time series of prediction vs. realised outcome and close price',
    '/dashboard/targets': 'Generated training targets for one symbol and family',
    '/dashboard/top_markets_assets': 'Curated top-markets symbol set used as the dashboard default filter',
    '/api/focus_dashboard/applied': 'The applied-models registry: the model each focus product serves',
    '/api/focus_dashboard/report': 'Generate the focus report as HTML or CSV (save=false skips the stored copy)',
    '/focus1d/api/horizons': '1d / 2d / 4d product families side by side for every focus product',
    '/focus1d/api/horizons/jobs': 'Running and recent horizon train / infer jobs',
    '/focus1d/api/horizons/infer/{symbol}/{k}': 'Start inference for one product at a k-day horizon',
    '/focus1d/api/horizons/train/{symbol}/{k}': 'Start training one product at a k-day horizon',
    '/focus1d/api/infer/{symbol}': 'Start inference for one focus 1D product',
    '/focus1d/api/jobs': 'Running and recent focus 1D train / infer jobs',
    '/focus1d/api/options/{symbol}': 'What 1-3 day Deribit option prices say, with model-vs-market EV - BTCUSD / ETHUSD',
    '/focus1d/api/overview': 'Focus 1D products at a glance, one row per asset',
    '/focus1d/api/sltp/{symbol}': 'Per-side stop / target bands at a given leverage - BTCUSD / ETHUSD',
    '/focus1d/api/train/{symbol}': 'Start training one focus 1D product (select_models=true runs the champion CV sweep first)',
    '/focus1d/horizons': 'The horizons page (HTML)',
    '/ig-trading/api/asset/{symbol}': 'One asset on the IG accounts: holdings, closed and unfilled tickets, by book / role / side, call quality',
    '/ig-trading/api/digest/{day}': 'The daily IG accounts digest (markdown) for a YYYY-MM-DD day',
    '/ig-trading/api/run': 'Launch one insights pass now (reads the IG demo accounts)',
    '/paperdesk/api/chart/{symbol}': 'Candles, calls, tickets and key features for one focus product',
    '/paperdesk/api/daily': 'The daily desk report as markdown (date=YYYY-MM-DD, newest by default)',
    '/paperdesk/api/equity': 'Equity, balance, drawdown, exposure, margin and open-risk curve (res=1h / 4h / 1d)',
    '/paperdesk/api/journal': 'Book journal events with counts by kind and origin',
    '/paperdesk/api/presets': 'The rule presets the what-if desk can compare',
    '/paperdesk/api/products': 'The focus product matrix with feature importance',
    '/paperdesk/api/run': 'Run the desk now (kind=mark by default)',
    '/paperdesk/api/runs': 'Recent desk runs, log tail and scheduler state',
    '/paperdesk/api/trades': 'Every ticket of the book, filterable by status, symbol, family and tier',
    '/monitoring/api/clients': 'Clients seen in the window',
    '/monitoring/api/endpoints': 'Per-route traffic in the window, filterable by service',
    '/monitoring/api/failures': 'Grouped failures and HTTP 5xx in the window',
    '/monitoring/api/ip_label': 'Label an IP address in the monitor',
    '/monitoring/api/overview': 'Server-monitor headline numbers for the window',
    '/monitoring/api/pipelines': 'Freshness of the data update, inference, paper desk and morning brief pipelines',
    '/monitoring/api/requests': 'Tail of the request log, filterable by IP, route, status and service',
    '/monitoring/api/security': 'Rejected (unauthenticated) requests by client and path',
    '/monitoring/api/system': 'Host CPU / memory / disk series, services, systemd units, collector and log files',
    '/monitoring/api/traffic': 'Request volume, status classes and p95 latency per time bucket',
    '/livedash/api/health': 'Liveness of the live dashboard service',
    '/livedash/api/journal': 'Live trading journal events',
    '/livedash/api/journal/report': 'Risk-compliance journal report against a mandate risk profile',
    '/train/api/assets': 'Assets available to train',
    '/train/api/backtest': 'Backtest a configuration',
    '/train/api/best': 'The best-per-ticker table',
    '/train/api/best/clear': 'Clear the best entry of one symbol',
    '/train/api/best/recompute': 'Recompute the best-per-ticker table',
    '/train/api/best/submit': 'Submit a configuration as the best for its ticker',
    '/train/api/comparison': 'Training, held-out validation and portfolio-backtest scorecards for one configuration',
    '/train/api/finalize': 'Re-fit the chosen configuration on the full history and persist it for live inference',
    '/train/api/health': 'Liveness of the training GUI service',
    '/train/api/models': 'Model names, families, horizons, intervals and feature sets on offer',
    '/train/api/train': 'Train a configuration',
}
DESCRIBE_TECHNICAL = {  # technical.deepbeta.mn paths collide with Brainy's, so they get their own table
    '/api/agents': 'Desk agents with health and start time',
    '/api/agents/{agent_id}/runs': 'Recent runs of one desk agent',
    '/api/agents/{agent_id}/run': 'Start one run of a desk agent now',
    '/api/asset/{sym}': 'Everything on one asset: quote, signal, technical summary, sentiment, AI read, macro, derivatives, lab',
    '/api/bars/{sym}': 'Completed bars for one asset (tf, n)',
    '/api/derivs': 'Crypto derivatives read for BTCUSD and ETHUSD',
    '/api/events': 'Desk event feed, filterable by asset and agent',
    '/api/indicators/{sym}': 'Indicator consensus, score and evidence for one asset and timeframe',
    '/api/lab': 'Indicator-lab summary across assets and timeframes',
    '/api/lab/{sym}/{tf}': 'Indicator-lab table for one asset and timeframe: score bands and out-of-sample tests',
    '/api/macro': 'Macro read: moves, tilts, regime, FX, calendar, event risk and treasuries',
    '/api/news': 'Recent news, filterable by asset (hours, limit)',
    '/api/overview': 'Desk overview: assets with quotes, health, macro, agents and performance',
    '/api/performance': 'Signal performance by asset, grade and block over the window',
    '/api/searches': 'Recent market searches run by the desk',
    '/api/signals': 'Signals issued by the desk, filterable by asset and window',
    '/api/stream': 'Live desk updates as a server-sent event stream',
}
SKIP_PATHS = {
    '/api/focus_dashboard/',  # trailing-slash alias of /api/focus_dashboard
    '/tradingview/api/technical/{symbol}', '/tradingview/api/view/{symbol}',  # the chart's JS calls them; 404 live
}

# sample values for path / required query parameters, so GET rows get a link that answers
SAMPLES = {'symbol': 'GOLD', 'sym': 'GOLD', 'symbols': 'GOLD,BTCUSD', 'n': '20', 'tf': '1h', 'k': '1',
           'agent_id': 'bar-feed', 'model_name': 'lightgbm'}
PATH_SAMPLES = {  # routes that only serve some products
    '/focus1d/api/sltp/{symbol}': {'symbol': 'BTCUSD'},
    '/focus1d/api/options/{symbol}': {'symbol': 'BTCUSD'},
}
TRY_QUERY = {  # extra query for the try link: keep side-effecting GETs read-only, give pickers a value
    '/api/focus_dashboard/report': {'save': 'false'},
    '/tradingview/api/chart/{symbol}': {'tf': '1h', 'book': 'record', 'days': '30'},
    '/mlflow/api/2.0/mlflow/experiments/search': {'max_results': '20'},
}
# never fetched by --check: computed on request (tens of seconds or more), file downloads, endless streams
HEAVY = {'/dashboard/backtest', '/dashboard/backtest_portfolio', '/dashboard/sltp_sweep',
         '/dashboard/efficient_frontier', '/dashboard/insights', '/dashboard/ranked_models',
         '/investor/api/backtest/{symbol}', '/api/focus_dashboard', '/api/focus_dashboard/report',
         '/api/focus_dashboard/oos_compare', '/train/api/comparison'}
FILES = {'/dashboard/backtest/trades_export', '/dashboard/live/trades_export'}
STREAMS = {'/api/stream', '/api/alerts/stream'}


def _sentence(o: dict) -> str:
    """First sentence of the route's docstring, else its summary; RST markup dropped."""
    text = (o.get('description') or '').strip()
    if text:
        para = ' '.join(text.split('\n\n')[0].split())
        m = re.match(r'(.+?(?<!\bvs)(?<!\be\.g)(?<!\bi\.e)[.!?])(\s|$)', para)
        text = m.group(1) if m else para
    text = re.sub(r'``|\*\*|`', '', text or o.get('summary') or '').strip().rstrip(':')
    text = re.sub(r'\s*\((?:see|cf\.)[^)]*\)', '', text)
    return text if len(text) <= 170 else text[:167].rsplit(' ', 1)[0] + '...'


def _fill(path: str, extra: dict | None = None) -> str | None:
    """Path with sample values in, or None when a parameter has no safe sample."""
    samples = {**SAMPLES, **PATH_SAMPLES.get(path, {})}
    names = re.findall(r'{(\w+)}', path)
    if any(n not in samples for n in names):
        return None
    for n in names:
        path = path.replace('{' + n + '}', quote(samples[n]))
    return path + ('?' + urlencode(extra) if extra else '')


def _row(method, host, path, desc, req=(), opt=()):
    row = {'m': method, 'p': path, 'd': desc}
    if req:
        row['req'] = list(req)
    if opt:
        row['opt'] = list(opt)
    if method == 'GET' and all(n in SAMPLES for n in req):
        tried = _fill(path, {**TRY_QUERY.get(path, {}), **{n: SAMPLES[n] for n in req}})
        if tried:
            row['try'] = host + tried
    flags = [f for f, paths in (('compute', HEAVY), ('file', FILES), ('stream', STREAMS)) if path in paths]
    if flags:
        row['x'] = flags
    return row


def build(headers: dict) -> dict:
    specs = {k: get_json(url, headers) for k, (url, _, _) in SPECS.items()}
    try:  # the newest IG digest day, so the digest row gets a working link
        SAMPLES['day'] = get_json(f'{BRAINY_URL}/ig-trading/api/pipeline?n=1', headers).get('digest_date') or ''
    except (urllib.error.URLError, ValueError):
        pass
    if not SAMPLES.get('day'):
        SAMPLES.pop('day', None)

    services: dict[str, dict] = {}
    for spec_id, (_, host, mount) in SPECS.items():
        for path, ops in specs[spec_id].get('paths', {}).items():
            for method, o in ops.items():
                if method not in ('get', 'post', 'put', 'patch', 'delete'):
                    continue
                sid = next((s for s, sp, pre in ROUTES if sp == spec_id and any(path.startswith(p) for p in pre)), None)
                if sid is None or path in SKIP_PATHS:
                    continue
                params = [p for p in o.get('parameters', []) if p.get('in') in ('path', 'query')
                          and p.get('name') not in ('access_key', 'endpoint_key')]
                req = [p['name'] for p in params if p.get('required') and p['in'] == 'query']
                opt = [p['name'] for p in params if not p.get('required') and p['in'] == 'query']
                full = mount + path
                desc = (DESCRIBE_TECHNICAL if spec_id == 'technical' else DESCRIBE).get(full) or _sentence(o)
                svc = services.setdefault(sid, {'host': host, 'endpoints': []})
                svc['endpoints'].append(_row(method.upper(), host, full, desc, req, opt))
    for sid, (host, rows) in MANUAL.items():
        svc = services.setdefault(sid, {'host': host, 'endpoints': []})
        for method, path, desc, opt in rows:
            if path in SKIP_PATHS:
                continue
            svc['endpoints'].append(_row(method, host, path, desc, opt=[s.strip() for s in opt.split(',') if s.strip()]))
    for svc in services.values():  # reads before writes, then by path
        svc['endpoints'].sort(key=lambda e: (e['m'] != 'GET', e['p']))
    return {
        'v': 1,
        'generated_utc': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S'),
        'versions': {k: specs[k].get('info', {}).get('version') for k in specs},
        'services': services,
    }


def check(catalogue: dict, headers: dict) -> int:
    rows = [(sid, e) for sid, s in catalogue['services'].items() for e in s['endpoints']
            if e.get('try') and not e.get('x')]

    def hit(item):
        sid, e = item
        try:
            with request(e['try'], headers, timeout=90) as r:
                return sid, e, r.status
        except urllib.error.HTTPError as err:
            return sid, e, err.code
        except Exception as err:  # noqa: BLE001 - timeouts, resets: report, don't stop
            return sid, e, type(err).__name__

    bad = 0
    with ThreadPoolExecutor(max_workers=2) as pool:  # gentle on the production server
        for sid, e, status in pool.map(hit, rows):
            ok = status == 200
            bad += not ok
            if not ok:
                print(f'  {status!s:>16}  {sid:<11} {e["try"]}')
    print(f'checked {len(rows)} GET links: {len(rows) - bad} ok, {bad} not ok')
    return bad


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--out', default=DEFAULT_OUT)
    ap.add_argument('--check', action='store_true', help='GET every light endpoint once and report its status')
    a = ap.parse_args()

    headers = require_auth()
    catalogue = build(headers)
    with open(a.out, 'w', encoding='utf-8') as f:
        json.dump(catalogue, f, ensure_ascii=False, indent=1)
    counts = {sid: len(s['endpoints']) for sid, s in catalogue['services'].items()}
    print(f'{a.out}: {sum(counts.values())} endpoints · ' + ' · '.join(f'{k} {v}' for k, v in counts.items()))
    # the page is public: surface docstrings that mention internal files so they get a DESCRIBE entry
    for sid, s in catalogue['services'].items():
        for e in s['endpoints']:
            if re.search(r'\w\.(py|json|joblib|parquet)\b|\b(reports|models|meta)/', e['d']):
                print(f'  review description ({sid} {e["p"]}): {e["d"]}')
    if a.check:
        sys.exit(1 if check(catalogue, headers) else 0)


if __name__ == '__main__':
    main()
