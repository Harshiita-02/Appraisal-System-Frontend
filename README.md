# Appraisal System — Frontend

React + TypeScript + Tailwind CSS frontend for the Appraisal System, in a
purple/violet theme matched to your color palette reference (vivid violet
`#7c3aed` for active states/CTAs, light lavender `#f5f3ff`/`#ede9fe` for
card fills, soft purple chips for tags).

**Scope of this build: frontend only, using mock data.** No backend calls
are made. You'll wire up your Spring Boot API yourself later — see
"Connecting a backend later" below for how the service layer is already
structured to make that a small change rather than a rewrite.

## Status

✅ Login page (mock auth — any email/password signs in)
✅ HR Dashboard — stat cards + filterable appraisals table
⏳ Users, Departments, Manage Appraisals, Create Appraisal, Reports —
   routes exist with placeholder pages, ready to build next

## Getting started

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`.

## Connecting a backend later

Two flags switch from mock data to real API calls:

- `src/services/authService.ts` → `USE_MOCK`
- `src/services/hrService.ts` → `USE_MOCK`

Set both to `false` once your backend is ready, and update the expected
request/response shapes in `src/types/index.ts` and the two service files
to match your actual endpoints. `vite.config.ts` already proxies `/api/*`
to `http://localhost:8080` in dev so you won't hit CORS issues locally —
adjust the `target` if your backend runs elsewhere.

`src/services/apiClient.ts` is pre-wired to attach a JWT from
`localStorage` to every request and to redirect to `/login` on a 401, so
once your backend issues tokens, no changes are needed there.

## Theme

Colors are CSS variables in `src/index.css` (`--bg-page`, `--bg-card`,
`--text-primary`, etc.) plus a `brand` color scale in `tailwind.config.js`
matched to your reference screenshot. Dark mode is wired via
`ThemeContext` (toggle button in the dashboard topbar) — flipping the
`dark` class on `<html>` swaps every CSS variable at once, so no
component-level dark: overrides were needed for the base palette.

## Project structure

```
src/
  components/   StatCard, StatusBadge, Icons, ProtectedRoute
  context/      AuthContext, ThemeContext
  layouts/      HrLayout (sidebar + topbar shell)
  pages/
    auth/       LoginPage
    hr/         HrDashboardPage, ComingSoonPage (placeholder for the rest)
  services/     apiClient (axios, unused while USE_MOCK=true), authService,
                hrService, mockData
  types/        Shared TypeScript interfaces
```
