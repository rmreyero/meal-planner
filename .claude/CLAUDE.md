# Meal Planner Project

## Stack
- Astro 5 + Vue islands + Tailwind v4.2 (`@tailwindcss/vite`) + Node adapter (SSR)
- SQLite via Drizzle ORM + better-sqlite3
- pnpm (always, user preference)
- TypeScript strict (no `any`)

## Key Paths
- DB schema: `db/schema.ts`, connection: `db/index.ts`
- Seed data: `db/seed.json`, seed script: `scripts/seed.ts`
- DB file: `data/meal-planner.db` (gitignored)
- Photos: `data/photos/` (filesystem)
- Layout: `src/layouts/Layout.astro`
- Pages: `src/pages/` (SSR mode)
- Recipe URLs use slugs: `/recipes/[slug]`
- Plan & tasks: `docs/PLAN.md`, `docs/TASKS.md`

## Commands
- Dev server: `pnpm dev`
- Push schema: `pnpm drizzle-kit push`
- Seed DB: `pnpm tsx scripts/seed.ts`
- After schema changes: delete `data/meal-planner.db`, push, re-seed

## Conventions
- Commits: atomic, semantic (`<type>: <description>`), English, imperative, lowercase
- Code: Spanish UI text, English code/comments
- Always use pnpm
- TypeScript strict, no `any`

## Phase Status
- [x] Phase 1: Foundation (Astro init, DB schema, seed, layout, basic pages)
- [x] Phase 2: Recipe Catalog (filters, favorites, macro calculator)
- [ ] Phase 3: Recipe API (write endpoints, auth)
- [ ] Phase 4: Meal Planner
- [ ] Phase 5: Macro Targets
- [ ] Phase 6: MCP Server
- [ ] Phase 7: Deploy & Polish
