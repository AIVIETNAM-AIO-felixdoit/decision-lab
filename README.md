<h1 align="center">Decision Lab</h1>

<p align="center">A small decision workspace for comparing options against weighted criteria.<br>Built for the Sanity Challenge, Path Two.</p>

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?logo=react&amp;logoColor=white">
  <img alt="TypeScript 5" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&amp;logoColor=white">
  <img alt="Vite 6" src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&amp;logoColor=white">
  <img alt="Sanity 5" src="https://img.shields.io/badge/Sanity-5-F03E2F?logo=sanity&amp;logoColor=white">
  <img alt="Deployed on Netlify" src="https://img.shields.io/badge/Deployed_on-Netlify-00C7B7?logo=netlify&amp;logoColor=white">
</p>

<h2 align="center">Challenge submission</h2>

<p align="center">
  <a href="https://dev.to/felixdoit/decision-lab-making-tradeoffs-visible-with-sanity-2fbm">Read the DEV submission</a> |
  <a href="https://decision-lab-sanity.netlify.app/">Try the live demo</a>
</p>

## Run locally

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The app reads published decisions from the public Sanity dataset and also includes an example. New decisions created inside the app are local drafts saved in that browser; author published decisions in Studio.

## Connect Sanity

1. Project `f2yoycw9` and the public `production` dataset are configured. The public project ID is also the frontend fallback, so a static build works without deployment environment variables. A private dataset would need a server-side API layer; this app intentionally does not expose an API token in browser code.
2. In Sanity project settings, add the frontend origin shown by Vite to CORS origins. For the current local server this is `http://127.0.0.1:5173`. Do **not** enable credentials for this read-only frontend. If Vite shows `http://localhost:5173`, add that origin too.
3. Run `npm run studio`, open `http://localhost:3333`, and sign in to create and publish a Decision document. Sanity allows this Studio origin by default.

```env
VITE_SANITY_PROJECT_ID=your_project_id
VITE_SANITY_DATASET=production
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

Restart Vite after changing `.env`. Published decisions appear in the sidebar. The example remains available.

## Deploy the frontend

The current demo is [decision-lab-sanity.netlify.app](https://decision-lab-sanity.netlify.app/). To update it, run `npm run build`, then upload the contents of `dist` (or a new ZIP of it) with [Netlify Drop](https://app.netlify.com/drop). Add `https://decision-lab-sanity.netlify.app` under Sanity Manage → API → CORS Origins with credentials **off**. The Studio remains local at `http://localhost:3333` until separately deployed.

The app uses a public dataset and requires no frontend API token. It does not have authentication, so published decisions are visible to anyone who visits the URL.

### Content model

- **Decision:** question, context, category, criteria, and options.
- **Criterion:** name, importance (1–5), and optional description.
- **Option:** name, summary, color, and scores.
- **Score:** exact criterion **name**, value (1–5), and evidence note.

In Studio, add a score to each option for every criterion. Use the exact criterion name in its score entry. The comparison app calculates a weighted average: `sum(score × importance) / (5 × sum(importance)) × 100`. Importance sliders are temporary what-if adjustments and do not mutate published content.

## Build

```bash
npm run build
npm run studio:build
```
