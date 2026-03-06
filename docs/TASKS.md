# Meal Planner — Tasks

## Phase 1: Foundation [DONE]

- [x] Init Astro project with Vue + Tailwind v4 + Node adapter
- [x] Configure TypeScript strict (no `any`)
- [x] Set up SQLite database with Drizzle ORM schema (4 tables)
- [x] Create seed.json with 12 recipes from recipes.md
- [x] Create seed script (`pnpm tsx scripts/seed.ts`)
- [x] Base layout with mobile-first bottom navigation (Recetas, Planner, Ajustes)
- [x] Recipe list page (home) — cards with name, tags, macros
- [x] Recipe detail page — slug URLs, ingredients, steps, notes, macros
- [x] Placeholder pages for Planner and Settings

## Phase 2: Recipe Catalog [DONE]

- [x] `RecipeFilters.vue` — tag chips + text search (Vue island)
- [x] Wire filters to recipe list (client-side filtering via `RecipeList.vue`)
- [x] `FavoriteButton.vue` — heart toggle with API call
- [x] `PATCH /api/recipes/:id/favorite` endpoint
- [x] `MacroCalculator.vue` — portion weight input/slider + live macro recalculation
- [x] Integrate MacroCalculator into recipe detail page
- [x] Recipe photo display (card thumbnail + detail full image)

## Phase 3: Recipe API (write endpoints) [DONE]

- [x] `GET /api/recipes` — list with optional filters (?tag, ?search)
- [x] `GET /api/recipes/:id` — detail
- [x] `POST /api/recipes` — create (auth required)
- [x] `PUT /api/recipes/:id` — update (auth required)
- [x] `POST /api/recipes/:id/photo` — upload photo (multipart, auth required)
- [x] API key auth middleware for write endpoints
- [x] Auto-generate slug from recipe name on create

## Phase 4: Meal Planner [DONE]

- [x] `WeeklyPlanner.vue` — 7-day tab navigation (L M X J V S D)
- [x] Smart slot auto-labeling (1->Cena, 2->Comida+Cena, 3->D+C+C, 4->D+C+M+C)
- [x] Editable slot labels
- [x] Per-slot adjustable portion weight (reuses MacroCalculator logic)
- [x] Recipe picker for adding meals to slots (`RecipePicker.vue`)
- [x] `POST /api/meal-entries` — add entry
- [x] `PUT /api/meal-entries/:id` — update entry
- [x] `DELETE /api/meal-entries/:id` — remove entry
- [x] `GET /api/meal-plans?week=YYYY-MM-DD` — get week plan (auto-creates)
- [x] Week navigation (prev/next)

## Phase 5: Macro Targets [DONE]

- [x] Settings page: define Training / Rest day macro targets
- [x] `GET /api/macro-targets` — get both profiles (auto-creates)
- [x] `PUT /api/macro-targets/:profileType` — update profile (upsert)
- [x] Per-day training/rest toggle in planner
- [x] `DailyMacroSummary.vue` — progress bars actual vs target
- [x] Daily macro summary integrated in WeeklyPlanner (replaces simple totals)

## Phase 6: MCP Server [DONE]

- [x] MCP server with stdio transport (separate Node.js process)
- [ ] OAuth 2.0 auth middleware (deferred to Phase 7/deploy)
- [x] Tool: `add_recipe` (calls POST /api/recipes)
- [x] Tool: `list_recipes` (calls GET /api/recipes)
- [x] Tool: `get_recipe` (calls GET /api/recipes/:id)
- [x] Tool: `update_recipe` (calls PUT /api/recipes/:id)
- [x] JSON Schema for each tool's `inputSchema` (auto-generated from Zod)
- [x] Test locally with Claude Code (stdio transport)

## Phase 7: Deploy & Polish

- [x] Dockerfile for Astro app (multi-stage build)
- [x] Dockerfile for MCP server
- [x] docker-compose.yml: Astro + MCP + cloudflared
- [x] Environment variables: API key, tunnel token (.env.example)
- [x] Mobile UX polish (design system overhaul: Manrope, Material Symbols, primary red, responsive nav)
- [x] Error handling for API endpoints (shared helpers in src/lib/api.ts)
- [x] `pnpm run seed` script in package.json

## Notes

- Seed: `pnpm tsx scripts/seed.ts`
- Push schema: `pnpm drizzle-kit push`
- After schema changes: delete `data/meal-planner.db`, push, re-seed
- Dev server: `pnpm dev`
