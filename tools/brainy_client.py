"""Minimal client for the Brainy platform, shared by the export tools.

Credentials come from the environment, or from the repo's .env file for local runs, and are only
ever sent as request headers - never put on the command line and never written to the exported
files.

    BRAINY_API_KEY=...                     # access key, sent as the X-Access-Key header (preferred)
    BRAINY_USER=... BRAINY_PASSWORD=...    # legacy HTTP Basic; Brainy ignores the user name
"""
from __future__ import annotations

import base64
import json
import os
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRAINY_URL = 'https://brainy.deepbeta.mn'


def load_env(path: Path = ROOT / '.env') -> None:
    """Fill os.environ from the KEY=VALUE lines of .env; variables already set win."""
    if not path.exists():
        return
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"\''))


def auth_headers() -> dict:
    load_env()
    key = os.environ.get('BRAINY_API_KEY', '').strip()
    if key:
        return {'X-Access-Key': key}
    password = os.environ.get('BRAINY_PASSWORD', '')
    if password:
        user = os.environ.get('BRAINY_USER', '') or 'brainy'
        return {'Authorization': 'Basic ' + base64.b64encode(f'{user}:{password}'.encode()).decode()}
    return {}


def require_auth() -> dict:
    headers = auth_headers()
    if not headers:
        raise SystemExit('set BRAINY_API_KEY (environment or .env) to read the live Brainy server')
    return headers


def request(url: str, headers: dict, timeout: float = 60):
    req = urllib.request.Request(url, headers={'Accept': 'application/json',
                                               'User-Agent': 'deepbeta-web-export', **headers})
    return urllib.request.urlopen(req, timeout=timeout)


def get_json(url: str, headers: dict, timeout: float = 60):
    with request(url, headers, timeout) as r:
        return json.loads(r.read().decode('utf-8'))
