# WishCraft AI — AI Wishing Image Generator for WhatsApp

A high-performance B2C Micro-SaaS for generating personalized, studio-grade AI wishing cards (Good Morning, Birthday, Anniversaries, Festivals, Spiritual blessings) with flawless Hindi (Devanagari) and English luxury typography, optimized for 1-click sharing on WhatsApp.

Powered by **Cloudflare Workers**, **Workers AI**, **Edge Vector Typography Compositing**, and **Cloudflare Pages**.

---

## 🌟 Features & Highlights

- ⚡ **Sub-1.5s Generation**: Powered by Cloudflare Workers AI using `@cf/bytedance/stable-diffusion-xl-lightning` (4-step diffusion) with an optional `@cf/stabilityai/stable-diffusion-xl-base-1.0` studio mode.
- 🪷 **Pixel-Perfect Devanagari & English Typography**: Server-side vector compositing with embedded Google Fonts (*Rozha One*, *Yatra One*, *Cinzel*, *Playfair Display*, *Great Vibes*, *Kalam*, *Poppins*) ensuring 100% correct ligature and matra shaping with 24k gold foil gradients and 3D drop shadows.
- 📱 **1-Click WhatsApp Direct Share**: Uses modern Web Share API (`navigator.share({ files: [blob] })`) on mobile devices to open WhatsApp with the HD image attached in 1 tap, with automatic desktop WhatsApp Web fallback.
- 🖼️ **Adaptive Aspect Ratios**: Supports 1:1 Square (WhatsApp DP / Post) and 4:5 Portrait (WhatsApp Status / Story).
- 🎨 **Rich Occasions & Vibes**: Good Morning, Birthdays, Anniversaries, Diwali/Festivals, Spiritual Blessings, Daily Motivation, and Gratitude.
- 🚀 **100% Free Tier Compatible**: Pluggable storage architecture works immediately with Cloudflare Edge CDN cache and in-memory streams without requiring credit card / R2 verification.

---

## 🏗️ Project Architecture

```
cloudflare-wishes/
├── backend/                  # Cloudflare Worker API
│   ├── src/
│   │   ├── index.ts          # Hono router (/api/generate, /api/presets, /api/images/:id)
│   │   ├── types.ts          # Request/Response TypeScript schemas
│   │   ├── templates/        # Occasions, Vibes, Hindi/English quotes, safe-zone prompts
│   │   └── services/
│   │       ├── ai.ts         # Cloudflare Workers AI integration & prompt engine
│   │       ├── textOverlay.ts# Edge SVG vector typography & ornament compositor
│   │       └── storage.ts    # Pluggable R2 / Edge CDN caching service
│   ├── wrangler.toml         # Cloudflare Worker configuration ([ai] binding)
│   └── package.json
└── frontend/                 # Cloudflare Pages React App
    ├── src/
    │   ├── components/       # OccasionPicker, VibePicker, RecipientPicker, QuotePicker, CardPreview
    │   ├── App.tsx           # State management & live 60fps card customizer
    │   └── types.ts
    ├── index.html            # Preloaded Google Fonts
    ├── vite.config.ts        # Dev server with /api proxy to worker
    └── package.json
```

---

## 🚀 Getting Started (Local Development)

### 1. Start the Backend Worker
```bash
cd backend
npm run dev
# Worker runs on http://127.0.0.1:8787
```

### 2. Start the Frontend Web App
```bash
cd frontend
npm run dev
# Frontend runs on http://127.0.0.1:5173
```

---

## 🌐 Deploying to Cloudflare

### Deploy Backend (Cloudflare Worker)
```bash
cd backend
npx wrangler login
npm run deploy
```

### Deploy Frontend (Cloudflare Pages)
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=wishcraft-ai
```
*(Or link your GitHub repository to Cloudflare Pages for automatic deployments on push).*
