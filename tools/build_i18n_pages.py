#!/usr/bin/env python3
"""Pre-render the Mongolian and Korean pages from index.html.

Search engines index URLs, not JavaScript state, so each language gets its own page:

    /      English  (index.html, as committed)
    /mn/   Mongolian
    /ko/   Korean

For every i18n/<lang>.json this writes <out>/<lang>/index.html with:
  - <html lang>, <title>, meta description, canonical, og:* and twitter:* rewritten
    (the head tags marked data-seo="...")
  - the inner HTML of every [data-i18n] element replaced by its translation
    (keys without a translation stay English)
  - the language switch pointing at the current page

Standard library only, so it runs on the bare GitHub Actions runner.

    python3 tools/build_i18n_pages.py _site     # CI: next to the copied static files
    python3 tools/build_i18n_pages.py .         # the repo root: mn/ and ko/ are committed, so re-run after any edit
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://www.deepbeta.mn"
EN_LOCALE = "en_US"

SEO_TAG = re.compile(r'<(meta|link)\b[^>]*\sdata-seo="([\w-]+)"[^>]*>')
TITLE = re.compile(r'(<title data-seo="title">)(.*?)(</title>)', re.S)
# an element carrying data-i18n, up to its closing tag; valid because no translated element
# nests another element of the same tag name (checked below)
I18N_EL = re.compile(r'<([a-zA-Z][\w-]*)\b([^>]*?\sdata-i18n="([^"]+)"[^>]*)>(.*?)</\1>', re.S)


class BuildError(Exception):
    pass


def set_attr(tag: str, attr: str, value: str) -> str:
    new, n = re.subn(rf'\s{attr}="[^"]*"', f' {attr}="{html.escape(value, quote=True)}"', tag, count=1)
    if n != 1:
        raise BuildError(f"no {attr}= in {tag}")
    return new


def render(template: str, lang: str, spec: dict, locales: dict[str, str]) -> tuple[str, list[str]]:
    meta, strings = spec["meta"], spec["strings"]
    url = f"{SITE}/{lang}/"
    notes: list[str] = []

    out, n = re.subn(r'<html lang="en">', f'<html lang="{lang}">', template, count=1)
    if n != 1:
        raise BuildError('<html lang="en"> not found')

    # head: title, description, canonical, locales
    out, n = TITLE.subn(lambda m: m.group(1) + html.escape(meta["title"], quote=False) + m.group(3), out)
    if n != 1:
        raise BuildError('<title data-seo="title"> not found exactly once')

    alt_locales = iter(v for k, v in locales.items() if k != lang)
    seen: dict[str, int] = {}

    def seo(m: re.Match) -> str:
        tag, kind = m.group(0), m.group(2)
        seen[kind] = seen.get(kind, 0) + 1
        attr = "href" if m.group(1) == "link" else "content"
        value = {
            "title": meta["title"],
            "description": meta["description"],
            "canonical": url,
            "locale": meta["ogLocale"],
        }.get(kind)
        if kind == "locale-alt":
            value = next(alt_locales)
        if value is None:
            raise BuildError(f'unknown data-seo="{kind}"')
        return set_attr(tag, attr, value)

    out = SEO_TAG.sub(seo, out)
    for kind in ("title", "description", "canonical", "locale", "locale-alt"):
        if not seen.get(kind):
            raise BuildError(f'no head tag marked data-seo="{kind}"')
    if f'hreflang="{lang}" href="{url}"' not in out:
        raise BuildError(f'index.html has no <link rel="alternate" hreflang="{lang}" href="{url}">')

    # body: translated blocks
    expected = len(re.findall(r'\sdata-i18n="', template))
    used: set[str] = set()
    count = 0

    def tr(m: re.Match) -> str:
        nonlocal count
        count += 1
        tag, attrs, key, inner = m.groups()
        if re.search(rf'<{tag}\b', inner):
            raise BuildError(f'[data-i18n="{key}"] nests another <{tag}>; the regex parser cannot handle it')
        if key not in strings:
            return m.group(0)
        used.add(key)
        return f"<{tag}{attrs}>{strings[key]}</{tag}>"

    out = I18N_EL.sub(tr, out)
    if count != expected:
        raise BuildError(f"matched {count} of {expected} [data-i18n] elements")
    unused = sorted(set(strings) - used)
    if unused:
        notes.append(f"unused keys (no matching element): {', '.join(unused)}")
    untranslated = expected - len(used)
    if untranslated:
        notes.append(f"{untranslated} element(s) stay English")

    # language switch: move the active state to this page
    out, n = re.subn(r' class="active" aria-current="page"', "", out)
    if n != 1:
        raise BuildError("active language link not found exactly once")
    out, n = re.subn(rf'(data-lang="{lang}")>', r'\1 class="active" aria-current="page">', out)
    if n != 1:
        raise BuildError(f'language link data-lang="{lang}" not found exactly once')

    return out, notes


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__.strip().splitlines()[0], file=sys.stderr)
        print("usage: build_i18n_pages.py OUT_DIR", file=sys.stderr)
        return 2
    out_dir = Path(argv[1])
    template = (ROOT / "index.html").read_text(encoding="utf-8")
    specs = {p.stem: json.loads(p.read_text(encoding="utf-8")) for p in sorted((ROOT / "i18n").glob("*.json"))}
    if not specs:
        raise BuildError("no i18n/*.json files")
    locales = {"en": EN_LOCALE, **{lang: s["meta"]["ogLocale"] for lang, s in specs.items()}}

    for lang, spec in specs.items():
        page, notes = render(template, lang, spec, locales)
        dest = out_dir / lang / "index.html"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(page, encoding="utf-8", newline="")
        print(f"{lang}: wrote {dest}" + "".join(f"\n    note: {n}" for n in notes))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv))
    except BuildError as e:
        print(f"build_i18n_pages: {e}", file=sys.stderr)
        sys.exit(1)
