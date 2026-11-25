#!/usr/bin/env python3
"""Pre-render the Mongolian and Korean pages from the English ones.

Search engines index URLs, not JavaScript state, so each language gets its own pages:

    /            /technology/        /results/        /platform/        English (committed as is)
    /mn/         /mn/technology/     /mn/results/     /mn/platform/     Mongolian
    /ko/         /ko/technology/     /ko/results/     /ko/platform/     Korean

For every i18n/<lang>.json and every page in PAGES this writes <out>/<lang>/<page>/index.html with:
  - <html lang>, <title>, meta description, canonical, og:* and twitter:* rewritten
    (the head tags marked data-seo="..."; per-page title and description from meta.pages)
  - the inner HTML of every [data-i18n] element replaced by its translation
    (keys without a translation stay English)
  - links to the site's own pages ("/", "/#contact", "/results/" ...) moved under /<lang>/,
    so a visitor stays in their language while navigating
  - the language switch pointing at the current page

Before writing anything it checks that the header and the footer are the same on every English
page (apart from the language switch, which points at each page's own translations), so the
shared parts cannot drift apart.

Standard library only, so it runs on the bare GitHub Actions runner.

    python3 tools/build_i18n_pages.py _site     # CI: next to the copied static files
    python3 tools/build_i18n_pages.py .         # the repo root: mn/ and ko/ are committed, so re-run after any edit
"""
from __future__ import annotations

import difflib
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://www.deepbeta.mn"
EN_LOCALE = "en_US"

# "" is the home page (index.html); the others are <name>/index.html. Adding a page: add it here,
# add its meta to each i18n/<lang>.json under meta.pages, to sitemap.xml and to the deploy workflow.
PAGES = ("", "technology", "results", "platform")

SEO_TAG = re.compile(r'<(meta|link)\b[^>]*\sdata-seo="([\w-]+)"[^>]*>')
TITLE = re.compile(r'(<title data-seo="title">)(.*?)(</title>)', re.S)
# an element carrying data-i18n, up to its closing tag; valid because no translated element
# nests another element of the same tag name (checked below)
I18N_EL = re.compile(r'<([a-zA-Z][\w-]*)\b([^>]*?\sdata-i18n="([^"]+)"[^>]*)>(.*?)</\1>', re.S)
A_TAG = re.compile(r'<a\b[^>]*>')
HREF = re.compile(r'\shref="([^"]*)"')
PAGE_HREF = re.compile(r'/(?:(?:' + '|'.join(p for p in PAGES if p) + r')/)?(?:#[\w-]*)?')
SHARED = {
    "header": re.compile(r'<header class="site-head".*?</header>', re.S),
    "footer": re.compile(r'<footer class="footer">.*?</footer>', re.S),
}
LANG_SWITCH = re.compile(r'<div class="lang-switch".*?</div>', re.S)


class BuildError(Exception):
    pass


def page_path(lang: str, page: str) -> str:
    """/, /technology/, /mn/, /mn/technology/ ..."""
    return "/" + "".join(f"{part}/" for part in (lang, page) if part)


def set_attr(tag: str, attr: str, value: str) -> str:
    new, n = re.subn(rf'\s{attr}="[^"]*"', f' {attr}="{html.escape(value, quote=True)}"', tag, count=1)
    if n != 1:
        raise BuildError(f"no {attr}= in {tag}")
    return new


def localize_links(out: str, lang: str) -> str:
    """Move links to the site's own pages under /<lang>/. Language-switch links, assets and
    external links are left alone."""
    def fix(m: re.Match) -> str:
        tag = m.group(0)
        h = HREF.search(tag)
        if "data-lang=" in tag or not h or not PAGE_HREF.fullmatch(h.group(1)):
            return tag
        return tag[: h.start(1)] + f"/{lang}" + tag[h.start(1):]
    return A_TAG.sub(fix, out)


def check_shared(templates: dict[str, str]) -> None:
    """The header and the footer must be identical on every page, language switch aside."""
    def block(page: str, name: str) -> str:
        found = SHARED[name].findall(templates[page])
        if len(found) != 1:
            raise BuildError(f"{page_path('', page)}: expected one <{name}>, found {len(found)}")
        return LANG_SWITCH.sub(lambda m: HREF.sub("", m.group(0)), found[0])

    home = PAGES[0]
    for name in SHARED:
        ref = block(home, name)
        for page in PAGES[1:]:
            other = block(page, name)
            if other != ref:
                diff = [d for d in difflib.unified_diff(ref.splitlines(), other.splitlines(), lineterm="", n=0)
                        if d[:1] in "+-" and d[:3] not in ("+++", "---")]
                home_line = next((d[1:].strip() for d in diff if d[0] == "-"), "(nothing)")
                page_line = next((d[1:].strip() for d in diff if d[0] == "+"), "(nothing)")
                raise BuildError(f"the {name} of {page_path('', page)} differs from the home page's; keep the "
                                 f"shared parts identical.\n  home page: {home_line}\n  {page_path('', page)}: {page_line}")


def render(template: str, page: str, lang: str, spec: dict, locales: dict[str, str]) -> tuple[str, set[str], list[str]]:
    meta, strings = spec["meta"], spec["strings"]
    page_meta = meta["pages"].get(page or "home")
    if not page_meta:
        raise BuildError(f'i18n/{lang}.json has no meta.pages["{page or "home"}"]')
    url = SITE + page_path(lang, page)
    notes: list[str] = []

    out, n = re.subn(r'<html lang="en">', f'<html lang="{lang}">', template, count=1)
    if n != 1:
        raise BuildError('<html lang="en"> not found')

    # head: title, description, canonical, locales
    out, n = TITLE.subn(lambda m: m.group(1) + html.escape(page_meta["title"], quote=False) + m.group(3), out)
    if n != 1:
        raise BuildError('<title data-seo="title"> not found exactly once')

    alt_locales = iter(v for k, v in locales.items() if k != lang)
    seen: dict[str, int] = {}

    def seo(m: re.Match) -> str:
        tag, kind = m.group(0), m.group(2)
        seen[kind] = seen.get(kind, 0) + 1
        attr = "href" if m.group(1) == "link" else "content"
        value = {
            "title": page_meta["title"],
            "description": page_meta["description"],
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
        raise BuildError(f'no <link rel="alternate" hreflang="{lang}" href="{url}">')

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
    keys = set(re.findall(r'\sdata-i18n="([^"]+)"', template))
    untranslated = len(keys - used)
    if untranslated:
        notes.append(f"{untranslated} key(s) stay English: {', '.join(sorted(keys - used))}")

    out = localize_links(out, lang)

    # language switch: move the active state to this page
    out, n = re.subn(r' class="active" aria-current="page"', "", out)
    if n != 1:
        raise BuildError("active language link not found exactly once")
    out, n = re.subn(rf'(data-lang="{lang}")>', r'\1 class="active" aria-current="page">', out)
    if n != 1:
        raise BuildError(f'language link data-lang="{lang}" not found exactly once')

    return out, used, notes


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__.strip().splitlines()[0], file=sys.stderr)
        print("usage: build_i18n_pages.py OUT_DIR", file=sys.stderr)
        return 2
    out_dir = Path(argv[1])
    templates = {page: (ROOT / page / "index.html").read_text(encoding="utf-8") for page in PAGES}
    check_shared(templates)
    specs = {p.stem: json.loads(p.read_text(encoding="utf-8")) for p in sorted((ROOT / "i18n").glob("*.json"))}
    if not specs:
        raise BuildError("no i18n/*.json files")
    locales = {"en": EN_LOCALE, **{lang: s["meta"]["ogLocale"] for lang, s in specs.items()}}

    for lang, spec in specs.items():
        used_anywhere: set[str] = set()
        for page in PAGES:
            try:
                html_out, used, notes = render(templates[page], page, lang, spec, locales)
            except BuildError as e:
                raise BuildError(f"{page_path(lang, page)}: {e}") from None
            used_anywhere |= used
            dest = out_dir / lang / page / "index.html" if page else out_dir / lang / "index.html"
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(html_out, encoding="utf-8", newline="")
            print(f"{lang}: wrote {dest}" + "".join(f"\n    note: {n}" for n in notes))
        unused = sorted(set(spec["strings"]) - used_anywhere)
        if unused:
            print(f"{lang}: note: unused keys (no matching element on any page): {', '.join(unused)}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv))
    except BuildError as e:
        print(f"build_i18n_pages: {e}", file=sys.stderr)
        sys.exit(1)
