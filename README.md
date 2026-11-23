# Deepbeta Web

Marketing site for **DeepBeta Capital** — `www.deepbeta.com` · `deepbeta.mn`.

A 13-model quantitative ML investing platform. The site links to the internal
**Brainy** platform at `https://brainy.deepbeta.mn/`.

## Stack

Static — no bundler. One standard-library Python step at deploy generates the `/mn/` and
`/ko/` pages (see *Languages & SEO*); on any other host, run it into the output directory too.

- [index.html](index.html)
- [styles.css](styles.css)
- [script.js](script.js)
- `logo/` — brand assets (the page sets the wordmark as live text; the icons and `og-image.jpg` come from here)
- `i18n/mn.json`, `i18n/ko.json` — Mongolian / Korean page text and meta tags
- `robots.txt`, `sitemap.xml`, `favicon.ico`
- `data/focus-book.json` — the focus 5 paper book behind the performance chart
- `data/brainy-platform.json` — the Brainy endpoint catalogue behind the platform section
- `tools/` — exporters that write the two JSON files, and the language-page builder (not deployed)

## Page structure & design conventions

One page, told as numbered chapters. Each chapter is a `<section data-chapter="NN">` with a
`.chap-tag` (number + name) and a headline:

| # | id | What it says |
|---|----|--------------|
| 00 | `#top` (hero) | The one-line claim, over the generative ridgeline terrain and the live tape |
| 01 | `#thesis` | The belief statement, then mission / vision / promise (the one chapter on paper) |
| — | `.numbers` | DeepBeta in four numbers |
| 02 | `#practice` | The three practices |
| 03 | `#engine` | 13 models (`#models`), inputs (`#features`), markets and session clocks (`#assets`) |
| 04 | `#stack` | The seven-layer pipeline |
| 05 | `#performance` | The focus 5 paper book |
| 06 | `#platform` | Brainy desks, access and the endpoint explorer |
| 07 | `#firm` | The firm (`#research`), principles, founder's former collaborations (`#partners`) |
| 08 | `#contact` | Contact |

- **The green full stop.** The wordmark is "DeepBeta." with a green dot, so every headline closes
  with `<span class="pt">.</span>`. Keep it on new headlines, in all three languages.
- **Type.** Inter Tight for headlines, Inter for text, JetBrains Mono only for evidence
  (numbers, labels, code). Colours are the custom properties at the top of `styles.css`.
- **Motion.** `data-rv` fades an element in when it scrolls into view (`style="--d:1"` staggers
  it); `data-count="13"` counts a numeral up. Everything is visible without JavaScript and still
  when the visitor prefers reduced motion.
- **The chapter rail** on wide screens and the current nav link are built by `script.js` from
  the `data-chapter` sections; a chapter that has no nav link of its own names its parent with
  `data-nav` (the pipeline sits under "Engine").
- **Nothing shown as live unless it is.** The tape stays hidden until the price feed answers,
  and the session clocks are computed in the browser from regular exchange hours.
- The hero terrain is decoration drawn from noise, not data. Keep performance numbers in
  `#performance`, next to their paper-trading disclaimer.

## Dated figures (update by hand)

Some sections state results as of a fixed date. They are plain HTML, not live data, and each
carries its date on the page. They come from the Brainy record as presented in the pitch deck
of 11 Nov 2026 (figures as of 9 Nov 2026). When the record moves on, update the English text in
`index.html` and the same keys in `i18n/mn.json` and `i18n/ko.json`:

| Where | Keys | What |
|-------|------|------|
| `#stack` | `glance.*`, `clock.*`, `lane.*`, `flows.*` | The daily run, its clock, the three side pipelines, integrations |
| `#selection` | `select.*`, `split.*`, `lesson.*`, `team.p` | How a model is chosen (70 / 20 / 10, the October lesson) |
| `#performance` | `ladder.*`, `check.*` | The four steps to real money, the daily checks |
| `#evidence` | `ev.*`, `res.*`, `fact.*` | Results by kind of account, and what the live record shows |
| `#evidence` | `np.*` | What is not proven yet. Keep this block whenever results are shown |

Rules for these blocks: every result names its account type (real money, demo, paper), its
start date and its caveat; a pro-forma figure says so; nothing is called live. The countdown
in the daily clock is computed in the browser from 00:00 UTC, when the daily candle closes.

## Languages & SEO

Each language is its own URL so search engines index all three:
`/` (English, `index.html`), `/mn/` and `/ko/`. The two translated pages are **generated
at deploy time** by [tools/build_i18n_pages.py](tools/build_i18n_pages.py): it copies
`index.html`, swaps in the translations from `i18n/<lang>.json` (every element with a
`data-i18n` key; keys without a translation stay English) and rewrites `<html lang>`, the
title, description, canonical and social tags (the head tags marked `data-seo`). It fails
the deploy if the markup stops matching, so a broken page never ships.

- To change or add a translation, edit `i18n/<lang>.json`, not `script.js`.
- New translatable text in `index.html` needs a `data-i18n="key"` and an entry in each JSON.
- Use root-absolute paths (`/styles.css`, `/data/…`) in `index.html` and `script.js`:
  the same markup is served from `/mn/` and `/ko/`.
- The canonical host is `https://www.deepbeta.mn/` — the canonical/hreflang tags, JSON-LD,
  `sitemap.xml` and `robots.txt` all use it. Adding a page means adding it to `sitemap.xml`.

## Brainy access key

The exporters read the live server with the Brainy access key. Put it in `.env`
(git-ignored; see [.env.example](.env.example)) or export it in the shell:

```bash
BRAINY_API_KEY=...      # sent as the X-Access-Key header
```

It is a master key (admin role): it must never appear in `index.html`,
`script.js` or anything under `data/`. The exported JSON holds numbers, paths and
descriptions only.

## Performance chart · focus 5 paper book

The `#performance` section draws the Brainy **Paper Desk** book of the five focus
products (GOLD, NAS100, WTI, BTCUSD, ETHUSD): KPI tiles, equity / drawdown /
exposure panes, P&L by asset and the coin-flip baseline. The page reads a static
snapshot, `data/focus-book.json`, written by
[tools/export_focus_book.py](tools/export_focus_book.py):

```bash
# straight from the live Paper Desk (https://brainy.deepbeta.mn; key from .env)
python tools/export_focus_book.py --url

# or from the local book of record (default ../brainy-deepbeta/reports/paperdesk;
# needs pandas + pyarrow)
python tools/export_focus_book.py --reports /path/to/reports/paperdesk
```

Only the numbers the page shows are exported — no alerts, journals, drivers or
open-ticket levels.

**Automatic refresh.** The GitHub Pages workflow re-exports the book from the
live desk on every push and every 3 hours, then deploys. It needs the repository
secret `BRAINY_API_KEY` (Settings → Secrets and variables → Actions). Without the
secret, or when the desk is unreachable, the committed snapshot is deployed
instead, so commit a fresh export now and then as the fallback.

## Platform section · every desk, every endpoint

The `#platform` section has the access instructions (key, browser sign-in,
`X-Access-Key` header, curl / Python / Node quick start), a card per desk with
its link, and a filterable explorer of every endpoint with an example link and a
copy-as-curl button. The desk cards are static HTML in `index.html`; the endpoint
list comes from `data/brainy-platform.json`, written by
[tools/export_platform.py](tools/export_platform.py):

```bash
python tools/export_platform.py           # read the live OpenAPI specs
python tools/export_platform.py --check   # ...and GET every light endpoint once to prove the links answer
```

Desks covered: Brainy dashboard, Paper Desk, live chart (TradingView), technical
desk (`technical.deepbeta.mn`), agents board (`agents.deepbeta.mn`), IG trading,
options desk (`options.deepbeta.mn`), focus products, investor portal, live
dashboard, training GUI, server monitor and MLflow. Routes the OpenAPI specs
don't describe (live chart, agents, options, MLflow) are listed by hand in
`MANUAL` in the tool. New routes on the main API fall into the "Brainy
dashboard" group until they get a prefix in `ROUTES`.

The catalogue is regenerated by hand, not in CI, so the git diff can be reviewed
before it goes public. Server docstrings can name clients or internal files:
the tool prints a "review description" line for anything that looks like a file
path, and `DESCRIBE` overrides any wording that shouldn't be published. To add a
desk, add its card to `index.html` with a matching `data-svc` id.

## Local preview

```bash
python3 tools/build_i18n_pages.py .   # writes mn/ and ko/ (git-ignored); re-run after edits
python3 -m http.server 8080
# then open http://localhost:8080  (and /mn/, /ko/)
```

## Deploy to deepbeta.mn

Any static host works.

### Cloudflare Pages
1. Push this repo to GitHub/GitLab.
2. Cloudflare Pages → Create project → connect repo.
3. Build command: *(empty)* · Output dir: `/`.
4. Add custom domains `deepbeta.mn` and `www.deepbeta.com`.
5. Update DNS at your registrar per Cloudflare's instructions.

### Netlify
```bash
npx netlify deploy --prod --dir .
```
Then add `deepbeta.mn` and `www.deepbeta.com` as custom domains.

### GitHub Pages (current)
- Deployed by [.github/workflows/pages.yml](.github/workflows/pages.yml) (Settings → Pages → Source: GitHub Actions).
- `CNAME` contains `www.deepbeta.mn`; the apex `deepbeta.mn` should only have GitHub's four A records
  (185.199.108–111.153) so it redirects to `www` over HTTPS.

## Brainy access for visitors

The Brainy platform is linked from the header, the platform section, the contact
section and the footer. No credential is on the page or in its source: every desk shows
Brainy's own sign-in form, and keys are issued on request via
contact@deepbeta.mn.

## Notes

- DeepAlpha was a previously cooperated organization and is **no longer**
  associated with DeepBeta Capital. Current entity: **DeepBeta Capital**.
- Founder: Nyam-Ochir Bold ·
  [LinkedIn](https://www.linkedin.com/in/nyamochirbold/) ·
  [Upwork](https://www.upwork.com/fl/nyamochirbold).
