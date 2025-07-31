# RIWI-QA-Refine – Developer Guide

> **Version:** July 25 2025

This document explains the internal architecture, conventions and development workflow of the **RIWI-QA-Refine** front-end application so that you can start contributing productively in minutes.

---

## 1. Technology Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Build tool | **Vite 5** | Ultra-fast HMR, ESM build, configured in `vite.config.ts`. |
| Language / Runtime | **TypeScript 5** + **React 18** (with the SWC compiler) | Strict typing disabled for rapid prototyping (see `tsconfig.*`). Enable as the project matures. |
| UI library | **shadcn-ui** (Radix primitives) + **Tailwind CSS 3.4** | Atomic styling, themeable with `next-themes`. |
| Data fetching | **Axios** (wrapped in `api.ts`) + **@tanstack/react-query v5** | Provides caching, retries and optimistic updates. |
| Routing | **react-router-dom v6** | SPA navigation. |
| Linting | **ESLint 9** with React + TypeScript plugins | Config in `eslint.config.js`. |
| State helpers | React Context, custom hooks in `src/hooks/*`. |

---

## 2. Local Setup

1. Install Node >= 18 and npm >= 9 (we recommend `nvm`).
2. Clone the repo and `cd` into it.
3. Copy `.env.save` ➜ `.env` and provide real values:

```bash
cp .env.save .env
# then edit .env
VITE_API_BASE_URL=https://api-qa.example.com
VITE_API_KEY=<JWT-TOKEN>
```

4. Install dependencies and start the dev server:

```bash
npm i
npm run dev    # http://localhost:8080
```

`vite` proxies any `/api/*` request to `http://localhost:3000` (see `vite.config.ts`).

---

## 3. Project Structure

```
Frontend/
├─ public/                # Static assets copied verbatim
├─ src/
│  ├─ components/         # Reusable UI pieces
│  │  ├─ layout/          # Global layout components (e.g. Navbar)
│  │  └─ ui/              # shadcn-generated primitives
│  ├─ context/            # React Context providers
│  ├─ hooks/              # Custom React hooks
│  ├─ pages/              # Route-level components (Index, Pending, Tests …)
│  ├─ services/           # API gateway & helpers (axios, react-query)
│  ├─ types/              # Shared TypeScript types
│  └─ lib/                # Generic utilities
├─ vite.config.ts         # Build & dev-server config
├─ tailwind.config.ts     # Tailwind theme, aliases, safelist
└─ package.json           # Scripts & dependencies
```

> Tip: run `npm run lint -- --fix` before every commit.

---

## 4. API Layer (`src/services/api.ts`)

* Centralized **Axios** instance with:
  * `baseURL` & `timeout` (60 s to account for AI processing time).
  * Automatic `Authorization: Bearer <VITE_API_KEY>` header.
  * Request/response interceptors for logging & error surfacing.
* High-level helpers:
  * `refineHU`, `getPendingHUs`, `approveHU`, `rejectHU`, `getHUHistory`, `generateTests`, **etc.**
* Colour helpers map features/modules to Brand palette.
* Utilities: `isApiConfigured`, `debugEnvVars`.
* Project-scoped requests: a dynamic `X-Project-Key` header can be enabled via `setCurrentProjectKey(key)`.

All endpoints adhere to the **REST** style, returning camel-cased objects that are mapped to strongly-typed models (`src/types`).

---

## 5. Pages & Navigation

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `Index.tsx` | Home / dashboard. |
| `/pending` | `Pending.tsx` | Review and accept/refine HUs. |
| `/history` | `History.tsx` | Accepted/rejected HU archive. |
| `/tests` | `Tests.tsx` | Generate XRAY test cases. |
| `*` | `NotFound.tsx` | 404 fallback. |

Navigation bar lives in `components/layout/Navbar.tsx` and leverages **react-router links** plus shadcn modals.

---

## 6. State Management & Data Flow

1. Components call declarative hooks (e.g. `useQuery`, `useMutation`).
2. Hooks delegate to functions in `services/api.ts`.
3. Axios executes HTTP requests, responses hydrated into React Query cache.
4. Tailwind + shadcn components render the view.
5. Global context (e.g. project selection) is provided via `src/context/*`.

This keeps the UI reactive and massively reduces prop-drilling.

---

## 7. Testing Strategy

Currently no automated unit/integration tests. The `/tests` route triggers **AI-generated XRAY test cases** via the BE endpoint `/generate-tests`.

> **Next steps:** integrate Vitest + React Testing Library and CI.

---

## 8. Linting & Formatting

* ESLint is configured project-wide.
* Run `npm run lint` or integrate with your IDE.
* No Prettier; rely on IDE or configure if desired.

---

## 9. Build & Deployment

```bash
npm run build      # Production bundle ➜ dist/
npm run preview    # Serve dist/ locally at http://localhost:5000
```

The static bundle can be deployed to any CDN or container. For quick demos we suggest **Netlify** or **Vercel**.

---

## 10. Publishing New Versions

1. Update `package.json` version (`npm version patch|minor|major`).
2. Commit & push. CI/CD pipeline (TBD) should pick up and deploy.

---

## 11. Useful Snippets

*Inspect environment config in the console:*

```ts
import { debugEnvVars } from "@/services/api";

debugEnvVars();
```

*Programmatically switch project context:*

```ts
import { setCurrentProjectKey } from "@/services/api";

setCurrentProjectKey("RIWI");
```

---

## 12. Contact

For codebase questions ping **Diego Ramirez** `<diego.ramirez@blackkbirdlabs.com.co>` or the #riwi-qa slack channel.

Happy hacking! 🎉
