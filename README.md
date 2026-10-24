# Deepbeta Web

Marketing site for **DeepBeta Capital** — `www.deepbeta.com` · `deepbeta.mn`.

A 13-model quantitative ML investing platform. The site links to the internal
**Brainy** platform at `https://brainy.deepbeta.mn/`.

## Stack

Pure static — no build step.

- [index.html](index.html)
- [styles.css](styles.css)
- [script.js](script.js)
- `logo/` — brand assets
- `data/focus-book.json` — the focus 5 paper book behind the performance chart

## Performance chart · focus 5 paper book

The `#performance` section draws the Brainy **Paper Desk** book of the five focus
products (GOLD, NAS100, WTI, BTCUSD, ETHUSD): KPI tiles, equity / drawdown /
exposure panes, P&L by asset and the coin-flip baseline. The page reads a static
snapshot; refresh it with [tools/export_focus_book.py](tools/export_focus_book.py)
(needs Python with `pandas` + `pyarrow` for the local mode) and commit the JSON:

```bash
# from the local book of record (default ../brainy-deepbeta/reports/paperdesk)
python tools/export_focus_book.py
python tools/export_focus_book.py --reports /path/to/reports/paperdesk

# or straight from the live server (HTTP Basic auth, read from the environment)
BRAINY_USER=... BRAINY_PASSWORD=... python tools/export_focus_book.py --url https://brainy.deepbeta.mn
```

Only the numbers the page shows are exported — no alerts, journals, drivers or
open-ticket levels.

## Local preview

```bash
python3 -m http.server 8080
# then open http://localhost:8080
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

### GitHub Pages
- Settings → Pages → Source: `main` / root.
- Add a `CNAME` file containing `deepbeta.mn`.

## Brainy demo access

The Brainy platform is linked from the hero and CTA. Credentials are **not**
rendered as visible text on the page — they live only in an HTML comment at
the top of `index.html` so view-source still exposes them. **Remove that
comment before the public DNS cutover** or move the platform behind an auth
landing.

```
URL:  https://brainy.deepbeta.mn/
Pass: ii11120304
```

## Notes

- DeepAlpha was a previously cooperated organization and is **no longer**
  associated with DeepBeta Capital. Current entity: **DeepBeta Capital**.
- Founder: Nyam-Ochir Bold ·
  [LinkedIn](https://www.linkedin.com/in/nyamochirbold/) ·
  [Upwork](https://www.upwork.com/fl/nyamochirbold).
