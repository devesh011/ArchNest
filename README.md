# ArchNest

**Turn a 2D floor plan into a fully rendered 3D space — powered by AI.**

ArchNest is an AI-first design tool that takes a simple 2D architectural floor plan (JPG/PNG) and generates a photorealistic 3D visualization of the space, with a live before/after comparison, PNG/PDF export, and shareable public links — all built on top of [Puter](https://puter.com) as the backend (auth, storage, hosting, and compute), with no traditional server of your own to run.

---

## ✨ Features

### Core

- **2D → 3D generation** — upload a floor plan image, ArchNest renders it into a fully modeled 3D space automatically.
- **Before / after comparison** — a drag-to-compare slider between the original 2D plan and the generated 3D render.
- **Export** — download the rendered result as a **PNG** or a dimension-matched **PDF**.
- **Project dashboard** — every generated project is saved and listed on the home page, with a distinct empty state for new users and a feature-showcase view for signed-out visitors.
- **Delete projects** — permanently remove a project and its private record.

### Sharing

- **Public share links** — sharing a project publishes a static, token-scoped snapshot of it via **Puter Hosting**, so anyone with the link can view it without needing to sign in.
- **Regenerate link** — instantly invalidate the current share link and issue a brand new one (old link stops resolving; a fresh token/URL is generated). Useful if a link is accidentally leaked.
- Note: due to CDN-level caching on the static hosting layer, a regenerated (old) link may take a few minutes to fully stop resolving — this is a hosting-layer characteristic, not an application bug.

### Account & usage

- **Puter-based authentication** — sign in/out is handled entirely through Puter's own auth flow; no separate ArchNest account system.
- **Usage insights** — surfaces the signed-in user's monthly Puter usage (`getMonthlyUsage`) and their ArchNest-specific storage footprint (`getAppStorageUsage`, walking the `projects/` and `shared/` directories to report total bytes and file count).

### Interface

- **Dark / light mode**, togglable, applied across the whole app.
- **Responsive, floating pill navbar** with a mobile hamburger menu.
- **Architectural, blueprint-inspired visual language** — Stone (`#f5f2ee`) + Teal (`#0d9488`) palette, `Instrument Serif` for headings, `Clash Display` for the wordmark, monospace accents for technical/annotation-style details.
- **Animated hero showcase** — an inline SVG animation that draws a 2D floor plan and morphs it into an isometric 3D form, illustrating the product's core idea directly on the landing page.
- **Installable PWA** — includes a web app manifest, app icons (including a maskable Android icon), and a manually registered service worker caching the static app shell for fast reloads. Adaptive **light/dark favicons** switch automatically based on the browser/OS theme (with static PNG and `.ico` fallbacks for browsers that don't support theme-aware favicons).

---

## 🏗️ Architecture

ArchNest has **no traditional backend server** — it's a client-side React app paired with a small **Puter Worker** (serverless function) for the pieces that need to run with the authenticated user's Puter identity attached.

```
┌─────────────────────┐        ┌──────────────────────────┐        ┌─────────────────┐
│   React Router v7    │──────▶│      Puter Worker         │──────▶│   Puter KV       │
│   (client, SSR)       │       │  (lib/puter.worker.js)     │       │  (per-user store) │
└─────────────────────┘        └──────────────────────────┘        └─────────────────┘
          │
          │  puter.fs.write() — direct, no worker involved
          ▼
┌─────────────────────┐
│   Puter Hosting       │   Public static files (e.g. shared/{id}/{token}.json)
│   (*.puter.site)      │   — read via plain, unauthenticated fetch()
└─────────────────────┘
```

**Why two different storage paths?** Puter's KV storage is isolated per authenticated user — there is no way for one signed-in user to read another user's KV entries, even with a shared key prefix. That makes KV perfect for private data (your own project list, your own records) but unusable for anything a stranger needs to view without signing in.

Public sharing therefore does **not** use KV at all. Instead, `shareProject()` writes a plain JSON snapshot of the project to the owner's Puter Hosting subdomain at a path that includes a random per-share token (`shared/{id}/{token}.json`). That file is served as a public static asset — reading it back (`getPublicProjectById`) is a plain, unauthenticated `fetch()`, with no Puter session required at all. This is the only mechanism available in this stack that supports genuine cross-user public access.

Regenerating a share link works by tombstoning and deleting the old token's file and writing a fresh one at a new token path — the project itself stays shared throughout; only the specific URL changes.

---

## 🧱 Tech Stack

| Layer                     | Choice                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Framework                 | [React Router v7](https://reactrouter.com) (framework/SSR mode)                                                    |
| UI library                | React 19                                                                                                           |
| Styling                   | Tailwind CSS v4                                                                                                    |
| Icons                     | lucide-react                                                                                                       |
| Backend / Auth / Storage  | [Puter.js](https://developer.puter.com) (`@heyputer/puter.js`) — auth, KV, filesystem, hosting, serverless workers |
| AI model (2D → 3D render) | Google **Gemini 2.5 Flash Image Preview**, accessed via Puter's `ai.txt2img` API                                   |
| Before/after UI           | react-compare-slider                                                                                               |
| PDF export                | jsPDF                                                                                                              |
| PWA                       | vite-plugin-pwa                                                                                                    |
| Language                  | TypeScript                                                                                                         |
| Build tool                | Vite                                                                                                               |

---

## 📁 Project Structure (key files)

```
app/
├── routes/
│   ├── home.tsx               # Landing page: hero, upload, project grid
│   ├── visualizer.$id.tsx     # Project view: render, compare, export, share, delete
│   ├── pricing.tsx
│   ├── product.tsx
│   ├── community.tsx
│   └── enterprise.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Upload.tsx
│   ├── Footer.tsx
│   ├── AppSplash.tsx           # Initial load / auth-check splash screen
│   └── ui/
│       ├── Logo.tsx            # Static wordmark (used in Navbar)
│       ├── AnimatedLogo.tsx    # Animated variant (used in AppSplash)
│       ├── Button.tsx
│       ├── HeroShowcase.tsx    # Animated 2D → 3D hero illustration
│       └── UsageWidget.tsx
├── lib/
│   ├── puter.action.ts        # All Puter-backed data operations (see below)
│   ├── puter.hosting.ts       # Hosting config + image upload helpers
│   ├── puter.worker.js        # Serverless Puter Worker: project save/list/get/delete
│   ├── ai.action.ts           # 3D generation call
│   ├── utils.ts               # Hosted-URL helpers, share tokens, image utils
│   └── constants.ts
├── root.tsx                   # App shell, auth context provider, PWA registration
├── app.css                    # Full design system (Tailwind v4 + custom components)
└── routes.ts                  # Route config

public/
├── manifest.webmanifest
├── favicon.ico
├── favicon-light.svg / favicon-dark.svg
├── favicon-light-32.png / favicon-dark-32.png
└── icon-16.png / icon-32.png / icon-180.png / icon-192.png / icon-512.png / icon-512-maskable.png
```

---

## 🔑 Key Modules

### `lib/puter.action.ts`

The single source of truth for all data operations, all built on top of `@heyputer/puter.js`:

| Function                         | Purpose                                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `signIn` / `signOut`             | Puter auth; `signIn` also ensures the `projects/` and `shared/` directories exist.                              |
| `getCurrentUser`                 | Returns the current Puter user, or `null`.                                                                      |
| `getMonthlyUsage`                | Surfaces the user's Puter account usage for the current month.                                                  |
| `getAppStorageUsage`             | Recursively walks `projects/` and `shared/` to report total bytes and file count used by ArchNest specifically. |
| `createProject`                  | Uploads source/rendered images to Puter Hosting, then saves the project record via the worker.                  |
| `getProjects` / `getProjectById` | Fetch the signed-in user's own project(s) via the worker (KV-backed, private).                                  |
| `getPublicProjectById`           | Fetches a shared project via a plain unauthenticated `fetch()` against its hosted JSON file.                    |
| `shareProject`                   | Publishes a project as a public, tokenized static file.                                                         |
| `regenerateShareLink`            | Kills the current share token/link and issues a new one.                                                        |
| `deleteProject`                  | Deletes the project's KV record and its hosted files.                                                           |

### `lib/puter.worker.js`

A Puter Worker exposing the private, authenticated endpoints (`/api/projects/save|list|get|delete`). Every route resolves against `user.puter` — the requesting user's own Puter session — so KV reads/writes are always scoped to that user and cannot be used to access another user's data.

### `lib/ai.action.ts`

Handles the 2D → 3D generation call. Converts the source floor plan image to a base64 data URL, sends it to **Gemini 2.5 Flash Image Preview** via `puter.ai.txt2img` (using `DEFAULT_RENDER_PROMPT` from `constants.ts`), and returns the rendered result as a data URL.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS recommended)
- A [Puter](https://puter.com) account (used for auth, storage, hosting, and running the worker)

### Installation

```bash
git clone <your-repo-url>
cd archnest
npm install
```

### Environment variables

Create a `.env` file in the project root:

```dotenv
VITE_PUTER_WORKER_URL=https://your-worker-subdomain.puter.work
```

This should point to your deployed Puter Worker (see `lib/puter.worker.js`).

### Development

```bash
npm run dev
```

### Type checking

```bash
npm run typecheck
```

### Production build

```bash
npm run build
npm start
```

`npm start` serves the production build via `@react-router/serve`.

---

## 📱 PWA

ArchNest is installable as a Progressive Web App:

- A hand-configured `manifest.webmanifest` (name, theme colors, icons — including a maskable variant for Android adaptive icons).
- A manually registered service worker (via `vite-plugin-pwa`'s `virtual:pwa-register` module), since React Router v7's framework mode renders its own HTML per-request and can't rely on the plugin's usual static-`index.html` auto-injection.
- Caching is deliberately limited to the static app shell (JS/CSS) — **no API responses are cached**, since ArchNest depends on live Puter calls (auth, storage, AI generation) that should always hit the network rather than risk serving stale data.
- Adaptive favicons switch between a dark-stroke variant (light browser theme) and a light-stroke variant (dark browser theme), with static PNG and `.ico` fallbacks for browsers without theme-aware favicon support.

---

## ⚠️ Known Limitations

- **Share link revocation isn't instantaneous.** Because sharing is backed by static file hosting (not a database), an old link from a regenerated share can take a few minutes to fully stop resolving, due to CDN-level caching on the hosting layer. There's no Puter API currently available to force an immediate cache purge.
- **Storage usage reporting can be slow for large accounts**, since `getAppStorageUsage` recursively walks the filesystem rather than reading a precomputed total.
- **PWA offline support is shell-only.** The app installs and reloads quickly offline, but it cannot generate renders, save projects, or fetch shared links without a live connection, since all of that depends on Puter's servers.
- **Model dependency.** 3D rendering relies on Google's Gemini 2.5 Flash Image Preview model, accessed through Puter's AI proxy. As a "preview" model, its behavior, quality, or availability could change upstream without notice. Note this is image-to-image generation (a styled render from the source photo), not literal 3D mesh construction.

---
