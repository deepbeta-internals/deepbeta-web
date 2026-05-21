# Deepbeta Web

Premium Deepbeta.co landing page built with Next.js, TypeScript, and Tailwind CSS for deployment at `deepbeta.mn`.

## Local development

```bash
npm install
npm run dev
```

## Available scripts

- `npm run dev` — start the local development server
- `npm run build` — create a production build
- `npm run start` — serve the production build locally
- `npm run lint` — run Next.js linting

## Deployment

The repository includes:

- `vercel.json` for rewrite handling
- `.github/workflows/deploy.yml` for production deployment to Vercel on pushes to `main`

Configure the following GitHub Actions secrets before enabling automatic deployment:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
