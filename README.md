# RIWI-QA-Refine – User Guide

Welcome to **RIWI-QA-Refine**, a front-end web application that streamlines the Quality-Assurance flow for User Stories (HUs) and auto-generates XRAY test cases.

---

## Table of Contents
1. [Live Demo](#live-demo)
2. [Features](#features)
3. [Quick Start](#quick-start)
4. [Environment Variables](#environment-variables)
5. [Available Scripts](#available-scripts)
6. [Project Structure](#project-structure)
7. [FAQ](#faq)
8. [License](#license)

---

## Live Demo

The latest build is hosted at:

> 🌐 **https://riwi-qa-refine.diegormdev.site**

(_If the link is unavailable, run the project locally as described below._)

---

## Features

✔️ AI-powered refinement of Azure DevOps HUs  
✔️ Review queue with **accept / reject / re-refine** actions  
✔️ Historical log of approved & rejected HUs  
✔️ One-click generation of **XRAY** test cases  
✔️ Color-coded feature & module tags for instant visual context  
✔️ Responsive UI built with **Tailwind CSS** & **shadcn-ui**  
✔️ Fast dev experience powered by **Vite** (HMR < 50 ms)

---

## Quick Start

```bash
# 1. Clone repository
$ git clone https://github.com/riwi/qa-refine-frontend.git && cd qa-refine-frontend

# 2. Install dependencies
$ npm install

# 3. Configure environment
$ cp .env.save .env # then edit values (see below)

# 4. Launch dev server (http://localhost:8080)
$ npm run dev
```

The app will auto-reload when you edit files, and API calls to `/api/*` are transparently proxied to `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file in the project root.

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `https://api-qa-blackbird.diegormdev.site` | Backend REST endpoint. |
| `VITE_API_KEY` | `eyJhbGci...` | **JWT** bearer token used for every request. |

> Run `npm run dev` after editing `.env` so Vite can reload the variables.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR. |
| `npm run build` | Build production bundle into `dist/`. |
| `npm run preview` | Serve the production bundle locally. |
| `npm run lint` | Run ESLint over the entire codebase. |

---

## Project Structure

```
src/
├─ components/      # Reusable UI (shadcn + custom)
├─ pages/           # Route-level screens (Pending, History, Tests …)
├─ services/        # API client & helpers (axios, react-query)
├─ hooks/           # Custom React hooks
└─ types/           # TypeScript interfaces & enums
```

---

## FAQ

**The API returns 401 / 403 errors**  
Ensure that `VITE_API_KEY` in your `.env` is valid and has not expired.

**Styles look broken after updating Tailwind classes**  
Run `npm run dev` again to let Vite re-scan your source files.

**How do I request a new feature?**  
Open an issue or ping the maintainer listed below.

---

## License

MIT © 2025 **Blackbird**  
Maintainer: [Diego Ramirez](mailto:diego.ramirez@blackkbirdlabs.com.co)
