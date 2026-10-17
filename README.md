# GreetPrompt — AI Wishing Cards & Scene Prompt Studio ✨

[![Live Website](https://img.shields.io/badge/Live-greetprompt.com-amber?style=for-the-badge&logo=cloudflare)](https://greetprompt.com)
[![Cloudflare Workers AI](https://img.shields.io/badge/Powered%20By-Cloudflare%20Workers%20AI-orange?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**[GreetPrompt](https://greetprompt.com)** is a high-performance B2C Micro-SaaS for generating personalized, studio-grade AI wishing cards (Good Morning, Festivals like Ganesh Chaturthi & Diwali, Birthdays, Anniversaries, Devotional & Daily Motivation) with 24K gold foil typography in 15+ languages, optimized for 1-click direct sharing to WhatsApp.

Powered by **Cloudflare Workers**, **Workers AI (Meta Llama 3.1 8B & Stable Diffusion XL)**, and **Cloudflare Pages**.

---

## 🌟 Highlights & Capabilities

- 🌐 **Live Website**: Experience it live at [https://greetprompt.com](https://greetprompt.com).
- 🪷 **Multilingual AI Blessing Engine**: Generates authentic, culturally rich greetings powered by Meta Llama 3.1 8B across 15+ languages including Marathi (मराठी), Hindi (हिन्दी), Gujarati (ગુજરાતી), Punjabi (ਪੰਜਾਬੀ), Telugu (తెలుగు), Tamil (தமிழ்), Bengali (বাংলা), Arabic (العربية), Spanish, and English across 4 tones (*Devotional*, *Poetic*, *Cheerful*, *Formal*).
- 🪄 **AI Scene Prompt Crafter**: Context-aware prompt engine powered by Llama 3.2 3B Instruct that synthesizes high-fidelity visual photographic prompts tailored to time of day, cultural sphere, and festive theme.
- ⚡ **Sub-1.5s Generation**: Edge diffusion using `@cf/bytedance/stable-diffusion-xl-lightning` (4-step fast diffusion) with optional `@cf/stabilityai/stable-diffusion-xl-base-1.0` studio mode.
- 🎨 **24K Gold Typography & Vector Compositing**: Precise multi-line typography with Google Fonts (*Rozha One*, *Yatra One*, *Cinzel*, *Playfair Display*, *Kalam*, *Cairo*, *Poppins*), gold foil gradients, drop shadows, and automatic FOUT-safe rendering.
- 📱 **1-Click WhatsApp Direct Share**: Full Web Share API integration (`navigator.share({ files: [blob] })`) for mobile devices with automatic desktop fallback (direct HD card download + WhatsApp Web pre-filled caption).
- 🖼️ **4:5 Mobile Portrait Layout**: Perfectly proportioned for WhatsApp Status, Stories, and Instagram.
- 📲 **Progressive Web App (PWA)**: Offline-first service worker caching with standalone install support on mobile and desktop.
- 🔍 **SEO & AI Crawler Ready**: Fully optimized with JSON-LD structured data, Open Graph cards, `llms.txt`, and automated IndexNow instant indexing for Bing & Yandex.

---

## 🏗️ Project Architecture

```
greetprompt/
├── .github/
│   ├── workflows/                 # ci.yml (checks) + deploy-backend.yml (Worker deploy)
│   └── dependabot.yml             # Grouped npm + Actions dependency updates
├── backend/                       # Cloudflare Worker API
│   ├── src/
│   │   ├── index.ts               # Hono router (/api/ai/message, /api/ai/prompt-suggest, /api/presets, /api/generate)
│   │   ├── types.ts               # Request & response TypeScript schemas
│   │   ├── templates/             # Occasions, curated scene presets, quotes, cultural spheres
│   │   └── services/
│   │       ├── ai.ts              # Workers AI (Llama 3.1 8B, Llama 3.2 3B, SDXL Lightning)
│   │       ├── textOverlay.ts     # Edge SVG typography & gold accent compositor
│   │       └── storage.ts         # Pluggable R2 / Edge CDN caching layer
│   ├── wrangler.toml              # Cloudflare Worker binding configuration
│   └── package.json
└── frontend/                      # Cloudflare Pages React App
    ├── src/
    │   ├── components/            # OccasionPicker, ScenePicker, SmartPromptInput, CardPreview, VibePicker
    │   ├── services/              # localCopilotEngine, svgFontEmbed (font-safe PNG export)
    │   ├── App.tsx                # Adaptive time-of-day defaults, deep-linking state, 60fps card canvas
    │   ├── seo.ts                 # URL-driven <title>/canonical sync (never form-state driven)
    │   └── types.ts
    ├── seo.config.json            # Single source of truth for landing-page titles/descriptions
    ├── scripts/
    │   ├── generatePrerenderedPages.js  # Builds dist/<slug>/index.html with unique SEO meta
    │   ├── verifyBuild.js         # CI check: titles/canonicals/sitemap match seo.config.json
    │   └── pingIndexNow.cjs       # IndexNow / Bing instant indexing ping
    ├── public/
    │   ├── icon.svg               # Luxury PWA vector icon
    │   ├── manifest.json          # PWA manifest
    │   ├── sw.js                  # Service Worker with edge pre-caching
    │   ├── llms.txt               # LLM and AI agent documentation
    │   └── scenes/                # Curated studio visual scenes
    ├── functions/api/[[path]].ts  # Cloudflare Pages API proxy to Workers (API_WORKER_URL)
    ├── vite.config.ts             # Vite build configuration
    └── package.json
```

---

## 🚀 Local Development

### 1. Prerequisites
- **Node.js** (v18+)
- **Cloudflare Wrangler CLI** (`npm i -g wrangler`)

### 2. Backend Worker Setup
```bash
cd backend
npm install
npm run dev
# Worker starts at http://127.0.0.1:8787
```

### 3. Frontend Web App Setup
```bash
cd frontend
npm install
npm run dev
# Frontend starts at http://localhost:5173 (proxies /api to local worker)
```

> SEO note: landing pages (`/diwali/`, `/good-morning/`, …) are defined once in
> [`frontend/seo.config.json`](frontend/seo.config.json). `npm run build` generates
> the prerendered `dist/<slug>/index.html` pages from that file via
> `frontend/scripts/generatePrerenderedPages.js`. Keep all internal links,
> canonicals and the sitemap on the trailing-slash URLs.

---

## 🌐 Deployment to Cloudflare

### Deploy Backend (Cloudflare Worker)
```bash
cd backend
npm run typecheck
npx wrangler deploy
```
Optional: add an `ALLOWED_ORIGINS` comma-separated variable in `wrangler.toml`
to extend the CORS allowlist (defaults cover `greetprompt.com` + localhost dev).

### Deploy Frontend (Cloudflare Pages)
```bash
cd frontend
npm run build                       # tsc + vite build + prerendered landing pages
npx wrangler pages deploy dist --project-name cloudflare-wishes
```
Optional: set the `API_WORKER_URL` variable in the Pages project to point the
`/api/*` proxy at a different Worker (defaults to the current production API).

---

## 🔁 CI/CD (GitHub Actions)

Pipelines live in [`.github/workflows/`](.github/workflows):

| Workflow | Trigger | What it does |
| --- | --- | --- |
| [`ci.yml`](.github/workflows/ci.yml) | PRs + pushes to `main` | **Frontend**: `tsc`, `vite build` + prerendered landing pages, then `scripts/verifyBuild.js` asserts every title/canonical/OG tag and the sitemap match `seo.config.json`. **Backend**: `tsc` + `wrangler deploy --dry-run`. |
| [`deploy-backend.yml`](.github/workflows/deploy-backend.yml) | pushes to `main` touching `backend/**` | Deploys the Worker with `cloudflare/wrangler-action`. Skipped until enabled (below). |
| [`dependabot.yml`](.github/dependabot.yml) | weekly | Grouped npm (frontend + backend) and GitHub Actions update PRs. |

Local equivalents:

```bash
cd frontend && npm run build && npm run verify
cd backend  && npm run typecheck && npx wrangler deploy --dry-run
```

### Enable the automated backend deploy

```bash
# 1. Create an API token: https://dash.cloudflare.com/profile/api-tokens
#    (template: "Edit Cloudflare Workers", or custom with Account → Workers Scripts → Edit)
# 2. Store it and your account ID as repo secrets, then flip the switch:
gh secret set CLOUDFLARE_API_TOKEN  --repo mihirterna/greetprompt
gh secret set CLOUDFLARE_ACCOUNT_ID --repo mihirterna/greetprompt
gh variable set CLOUDFLARE_DEPLOY_ENABLED --body true --repo mihirterna/greetprompt
```

Until the `CLOUDFLARE_DEPLOY_ENABLED` variable is set, `deploy-backend.yml`
skips cleanly and manual `npx wrangler deploy` stays the workflow of record.

### Connect the frontend to Cloudflare Pages (one-time, no tokens)

> Cloudflare dashboard → **Workers & Pages → `cloudflare-wishes` → Settings →
> Build** → connect Git → repository `mihirterna/greetprompt`, production branch
> `main`, root directory `frontend`, build command `npm run build`, output
> directory `dist`, environment variable `NODE_VERSION=22` (plus `API_WORKER_URL`
> if the `/api/*` proxy should target a non-default Worker).

After connecting, every push to `main` deploys production and every PR gets its
own preview URL automatically. Recommended once CI is green: enable branch
protection on `main` requiring the two `ci.yml` jobs.

---

## 📜 License

MIT License — free for personal and commercial exploration.
Created with ❤️ by [Mihir](https://github.com/mihirterna).
