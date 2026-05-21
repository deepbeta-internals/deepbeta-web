# Deepbeta Web

Deepbeta Web is a premium single-page marketing site for **Deepbeta.co**, designed for deployment at **deepbeta.mn**. It is built with Next.js, TypeScript, and Tailwind CSS, and uses a warm dark amber palette tailored to the Deepbeta brand.

## Features

- Sticky navigation with smooth scrolling between sections
- Hero section with project stats and call-to-action buttons
- Responsive grid covering 13 quant ML projects
- About, process, technology, contact, and footer sections
- Google Fonts via Inter and Space Grotesk
- Vercel deployment configuration and GitHub Actions workflow

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Scripts

- `npm run dev` — start the local development server
- `npm run lint` — run Next.js linting
- `npm run build` — create the production build/export
- `npm run start` — start the production server

## Deployment

The repository includes:

- `vercel.json` for single-page rewrites
- `.github/workflows/deploy.yml` to deploy to Vercel on pushes to `main`

To enable GitHub Actions deployment, add these repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
