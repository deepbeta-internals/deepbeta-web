# Deepbeta Web

Marketing site for **DeepBeta Capital** — `www.deepbeta.com` · `deepbeta.mn`.

A 13-model quantitative ML investing platform. The site links to the internal
**Brainy** platform at `https://brainy.deepbeta.mn/`.

## Stack

Static — no bundler. One standard-library Python step at deploy generates the `/mn/` and
`/ko/` pages (see *Languages & SEO*); on any other host, run it into the output directory too.

- [index.html](index.html) — the home page: who we are and what we do, in eight short chapters
- [technology/index.html](technology/index.html), [results/index.html](results/index.html),
  [platform/index.html](platform/index.html) — the detail pages
- [styles.css](styles.css), [script.js](script.js) — shared by every page
- `logo/` — brand assets (the page sets the wordmark as live text; the icons and `og-image.jpg` come from here)
- `i18n/mn.json`, `i18n/ko.json` — Mongolian / Korean page text and meta tags
- `robots.txt`, `sitemap.xml`, `favicon.ico`
- `data/focus-book.json` — the focus 5 paper book behind the performance chart
- `data/brainy-platform.json` — the Brainy endpoint catalogue behind the platform section
- `tools/` — exporters that write the two JSON files, and the language-page builder (not deployed)

## Page structure & design conventions

**The home page introduces the company; the detail lives one click away.** A first-time visitor
should learn who we are, what we do, how it works, what it has shown and how to reach us in
about ten screens. Model cards, pipeline layers, charts and API routes belong on the detail pages,
with a short summary and a link from the home page. Before adding a block to `index.html`, ask
whether a visitor deciding to talk to us needs it, or whether it belongs on a detail page.

Each page is told as numbered chapters. A chapter is a `<section data-chapter="NN">` with a
`.chap-tag` (number + name) and a headline.

**Home (`/`, `index.html`)**

| # | id | What it says |
|---|----|--------------|
| 00 | `#top` (hero) | The one-line claim and what we do in plain words, over the ridgeline terrain and the live tape |
| 01 | `#company` | The belief statement, who we are (one paragraph, four facts), mission / vision / promise (the one chapter on paper) |
| — | `.numbers` | What runs every day: markets, calls, risk per trade, custody |
| 02 | `#services` | The three practices, with partners and showcases |
| 03 | `#approach` | The daily run in six plain steps, and the platform band (links to /technology/, /platform/) |
| 04 | `#difference` | A desk by hand and with DeepBeta (from the pitch deck) |
| 05 | `#record` | The three account results, the coin-flip fact, a link to /results/ |
| 06 | `#founder` | The founder and the founder's former collaborations (`#partners`) |
| 07 | `#contact` | Contact |

**Detail pages** — each opens with a `.page-top` chapter (the page's `h1` and an "on this page"
`.toc`) and closes with the `.next` band (the other pages and the contact).

| Page | Chapters |
|------|----------|
| `/technology/` | 01 `#engine`: models (`#models`), selection (`#selection`), inputs (`#features`), markets and session clocks (`#assets`) · 02 `#stack`: the daily run, side pipelines, integrations, the seven layers · 03 `#principles` |
| `/results/` | 01 `#performance`: the four steps (`#ladder`), daily checks (`#checks`), evidence (`#evidence`) · 02 `#book`: the focus 5 paper book |
| `/platform/` | 01 `#platform`: access (`#access`), quick start (`#api`), desks (`#desks`), endpoint explorer (`#endpoints`) |

- **Shared header and footer.** They are copied into all four pages and must stay identical
  (only the language links differ, pointing at that page's translations): the builder fails if
  they drift. Change them in all four files at once. Links to the site's own pages are
  root-absolute (`/#services`, `/results/`); the builder moves them under `/mn/` and `/ko/`.

- **Showcases.** A practice row in `#services` can end with `.practice-case` lines: the client's
  mark (`.logo-plate`, files in `logo/clients/`) and one sentence saying what was built. Marks are
  shown in their own colours on transparent (no plate behind them; use a transparent PNG), and a
  mark links to the client's website in a new tab (`<a class="logo-plate" href="…"
  target="_blank" rel="noopener">`). Each practice row is a `<div>` whose `.practice-go` link
  covers the row, which is what lets a link sit inside it. Label the relationship as it is:
  "Partner" for a firm that applies our solutions (Tavan Bogd Capital, tavanbogdcapital.com),
  "Showcase" for work built for a client (Unu Munkhiin Ekhlel LLC — Өнө мөнхийн эхлэл ХХК in
  Mongolian — art21.mn). Name a firm only with their consent, and claim only what is true of
  the relationship. A mark with its own alt text per language gets a `data-i18n` key
  (`case.tbc.logo`, `case.unu.logo`).
  When a name must stay private, use `.logo-plate.is-withheld` (an abstract blurred mark) and a
  sentence that names nobody. Never blur a real logo with CSS: the page source would still name the firm. A practice with
  no client yet says so (`.practice-case.is-open`). The Mongolian page swaps in the Cyrillic logo
  through the `case.tbc.logo` string.
- **The green full stop.** The wordmark is "DeepBeta." with a green dot, so every headline closes
  with `<span class="pt">.</span>`. Keep it on new headlines, in all three languages.
- **Type.** Inter Tight for headlines, Inter for text, JetBrains Mono only for evidence
  (numbers, labels, code). Colours are the custom properties at the top of `styles.css`.
- **Motion.** `data-rv` fades an element in when it scrolls into view (`style="--d:1"` staggers
  it); `data-count="13"` counts a numeral up. Everything is visible without JavaScript and still
  when the visitor prefers reduced motion.
- **The chapter rail** on wide screens is built by `script.js` from the `data-chapter`
  sections (only on pages with two or more). The nav marks the current page's link, and on the
  home page the link of the chapter on screen; a chapter can borrow another's link with `data-nav`.
- **Nothing shown as live unless it is.** The tape stays hidden until the price feed answers,
  and the session clocks are computed in the browser from regular exchange hours.
- The hero terrain is decoration drawn from noise, not data. Performance numbers appear only in
  `#record` (home) and on `/results/`, each next to its date and its caveat.

## Dated figures (update by hand)

Some sections state results as of a fixed date. They are plain HTML, not live data, and each
carries its date on the page. They come from the Brainy record as presented in the pitch deck
of 11 Nov 2026 (figures as of 9 Nov 2026). When the record moves on, update the English text in
`index.html` and the same keys in `i18n/mn.json` and `i18n/ko.json`:

| Where | Keys | What |
|-------|------|------|
| `/` `.numbers`, `#approach`, `#difference` | `num.*`, `how.*`, `diff.*` | What runs every day, the six steps, the before / after table |
| `/` `#record` | `ev.sub`, `res.*`, `fact.2.*` | The three account results (same keys as on /results/) |
| `/technology/` `#stack` | `glance.*`, `clock.*`, `lane.*`, `flows.*` | The daily run, its clock, the three side pipelines, integrations |
| `/technology/` `#selection` | `select.*`, `split.*`, `lesson.*`, `team.p` | How a model is chosen (70 / 20 / 10, the October lesson) |
| `/results/` `#performance` | `ladder.*`, `check.*` | The four steps to real money, the daily checks |
| `/results/` `#evidence` | `ev.*`, `res.*`, `fact.*` | Results by kind of account, and what the live record shows |

The result tiles are written out twice (home and /results/) with the same keys: change both
English copies together.

Rules for these blocks: every result names its account type (real money, demo, paper), its
start date and its caveat; a pro-forma figure says so; nothing is called live. The countdown
in the daily clock is computed in the browser from 00:00 UTC, when the daily candle closes.

## Languages & SEO

Each page in each language is its own URL so search engines index all of them:
`/`, `/technology/`, `/results/`, `/platform/` in English, and the same under `/mn/` and `/ko/`.
The translated pages are **generated** by [tools/build_i18n_pages.py](tools/build_i18n_pages.py):
for each English page it swaps in the translations from `i18n/<lang>.json` (every element with
a `data-i18n` key; keys without a translation stay English), rewrites `<html lang>`, the title,
description, canonical and social tags (the head tags marked `data-seo`; per-page title and
description come from `meta.pages` in the JSON) and moves links to the site's own pages under
`/<lang>/`. It fails the deploy if the markup stops matching or if the shared header or footer
differs between pages, so a broken page never ships.

**The generated pages are committed** (`mn/…`, `ko/…`), so a local preview and a branch deploy
both have them. After any change to an English page or `i18n/*.json`, regenerate and commit
them with the change:

```bash
python3 tools/build_i18n_pages.py .
git add mn ko
```

Never edit the pages under `mn/` or `ko/` by hand; the next run overwrites them.

- To change or add a translation, edit `i18n/<lang>.json`, not `script.js`.
- New translatable text needs a `data-i18n="key"` and an entry in each JSON. A key can be used
  on several pages (the nav, the result tiles).
- Use root-absolute paths (`/styles.css`, `/data/…`, `/results/`) in the pages and `script.js`:
  the same markup is served from `/mn/` and `/ko/`.
- Adding a page: create `<name>/index.html` with the shared header and footer, add `<name>` to
  `PAGES` in the builder, its title and description to `meta.pages` in each JSON, its three URLs
  to `sitemap.xml`, and the folder to the copy step in the deploy workflow.
- The canonical host is `https://www.deepbeta.mn/` — the canonical/hreflang tags, JSON-LD,
  `sitemap.xml` and `robots.txt` all use it.

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

The `#book` chapter of `/results/` draws the Brainy **Paper Desk** book of the five focus
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

The `/platform/` page has the access instructions (key, browser sign-in,
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
desk, add its card to `platform/index.html` with a matching `data-svc` id.

## Local preview

```bash
python3 tools/build_i18n_pages.py .   # rewrites mn/ and ko/ (committed); re-run after edits
python3 -m http.server 8080
# then open http://localhost:8080  (and /technology/, /results/, /platform/, /mn/, /ko/ …)
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
- Settings → Pages → Source is currently **"Deploy from a branch"** (`main`, `/`): every push publishes
  the repo root as it is, which is why the generated `mn/` and `ko/` pages are committed.
- [.github/workflows/pages.yml](.github/workflows/pages.yml) also deploys on every push and every 3 hours
  (it refreshes the paper book when the `BRAINY_API_KEY` secret is set). Both produce the same pages.
  Switching the source to "GitHub Actions" would make the workflow the only deployer.
- `CNAME` contains `www.deepbeta.mn`; the apex `deepbeta.mn` should only have GitHub's four A records
  (185.199.108–111.153) so it redirects to `www` over HTTPS.

## Brainy access for visitors

The Brainy platform is linked from the header, the home page's platform band, the
/platform/ page, the contact section and the footer. No credential is on the page or in its source: every desk shows
Brainy's own sign-in form, and keys are issued on request via
nyam-ochir@deepbeta.mn.

## Notes

- DeepAlpha was a previously cooperated organization and is **no longer**
  associated with DeepBeta Capital. Current entity: **DeepBeta Capital**.
- Founder: Nyam-Ochir Bold ·
  [LinkedIn](https://www.linkedin.com/in/nyamochirbold/) ·
  [Upwork](https://www.upwork.com/fl/nyamochirbold).
