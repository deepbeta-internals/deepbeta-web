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
