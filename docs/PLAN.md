# Meal Planner — Implementation Plan

## Context

Web app to browse recipes, adjust portion macros in real-time, and plan weekly meals with daily macro tracking. Deployed on home lab, accessible from internet. Shared with the family (no auth for browsing). MCP server exposed remotely so Claude Chat can add recipes programmatically via the app's API.

## Tech Stack

- **Framework:** Astro 5 with Vue islands (interactive components)
- **Styling:** Tailwind CSS v4.2 (mobile-first, via `@tailwindcss/vite`)
- **Database:** SQLite via Drizzle ORM + better-sqlite3
- **Runtime:** pnpm, TypeScript strict (no `any`)
- **MCP Server:** Separate HTTP/SSE process, exposed to internet, calls Astro API internally
- **Deployment:** Docker Compose on home lab, exposed via Cloudflare Tunnels (HTTPS automatic)

## Architecture

```
                         Internet (HTTPS via Cloudflare)
                              |
                        Cloudflare Tunnel (cloudflared)
                       +------+------+
                       |             |
              recipes.domain.com   mcp.domain.com
                       |             |
                 Astro Web App    MCP Server (HTTP/SSE)
                  (SSR + API)     (OAuth 2.0 auth)
                       |             |
                       +------+------+
                              | (internal Docker network)
                        Astro API --> SQLite DB
```

### Security Model

- **Web App (reads):** Public, no auth — family browses recipes and planner
- **Web App (writes):** API key required in `Authorization` header
- **MCP Server:** OAuth 2.0 (required by Claude Chat for remote MCP)
- **MCP -> Astro API:** Internal Docker network, MCP server has the API key as env var
- **HTTPS:** Handled by Cloudflare Tunnel automatically

## Database Schema

### Tables

- `recipes` — id, slug, name, category, servings, times, difficulty, ingredients (JSON), instructions (JSON), notes (JSON), tags (JSON), source, macros (weight/kcal/prot/carbs/fat), photo_path, is_favorite, timestamps
- `macro_targets` — id, profile_type (training/rest), calories, protein, carbs, fat
- `meal_plans` — id, week_start (unique ISO date of Monday)
- `meal_entries` — id, meal_plan_id (FK), day_of_week, slot_label, slot_order, recipe_id (FK), portion_weight, is_training_day

### Key Decisions

- Recipe URLs use slugs (`/recipes/mapo-tofu`), not IDs
- Ingredients stored as JSON array of `{group?: string, items: string[]}`
- Macros are per base portion weight; client calculates proportionally
- Seed data lives in `db/seed.json`; future recipes added via MCP/API

## API Endpoints

```
GET    /api/recipes              — List all (optional ?tag=X&search=Y)
GET    /api/recipes/:id          — Get recipe detail
POST   /api/recipes              — Create recipe (auth required)
PUT    /api/recipes/:id          — Update recipe (auth required)
PATCH  /api/recipes/:id/favorite — Toggle favorite
POST   /api/recipes/:id/photo    — Upload photo (multipart, auth required)

GET    /api/meal-plans?week=YYYY-MM-DD  — Get plan for a week
PUT    /api/meal-plans/:weekStart       — Create/update a full week plan
POST   /api/meal-entries                — Add entry to a day
PUT    /api/meal-entries/:id            — Update entry (portion, label)
DELETE /api/meal-entries/:id            — Remove entry

GET    /api/macro-targets               — Get both profiles
PUT    /api/macro-targets/:profileType  — Update a profile
```

## Design Principles

- **Mobile-first:** Primary use in the kitchen on phone
- **Clean & minimal:** White background, generous whitespace, typography-focused
- **Photos:** Optional per recipe, stored in `data/photos/`, served as static files

### Recipe List (Home)

- Full-width cards, one per row
- Each card: name, key macros (kcal, protein), tags
- Filter bar: tag chips + text search (Vue island)

### Recipe Detail

- Inline macro calculator: weight input above macro display
- Macros as row: kcal | protein | HC | fat — real-time updates
- Below: ingredients (grouped), preparation steps, notes, source link

### Weekly Planner

- Horizontal tab bar: L M X J V S D
- Each day: training/rest toggle, meal slots with recipe + portion + macros
- Smart auto-labeling: 1->Cena, 2->Comida+Cena, 3->D+C+C, 4->D+C+M+C (editable)
- Daily macro summary: progress bars actual vs target
- `[+ Add meal]` button per day

### Settings

- Two macro profiles: Training / Rest day
- Each: kcal, protein, carbs, fat targets

## Project Structure

```
meal-planner/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── data/
│   └── photos/
├── db/
│   ├── schema.ts          — Drizzle schema definitions
│   ├── index.ts            — DB connection + exports
│   └── seed.json           — Seed data (12 recipes)
├── scripts/
│   └── seed.ts             — Seed DB from seed.json
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro             — Recipe list (home)
│   │   ├── recipes/
│   │   │   └── [slug].astro        — Recipe detail
│   │   ├── planner.astro           — Weekly meal planner
│   │   ├── settings.astro          — Macro targets config
│   │   └── api/
│   │       ├── recipes/
│   │       ├── meal-plans/
│   │       ├── meal-entries/
│   │       └── macro-targets/
│   ├── components/
│   │   ├── RecipeFilters.vue
│   │   ├── MacroCalculator.vue
│   │   ├── FavoriteButton.vue
│   │   ├── WeeklyPlanner.vue
│   │   └── DailyMacroSummary.vue
│   └── styles/
│       └── global.css
├── mcp-server/
│   ├── package.json
│   ├── Dockerfile
│   ├── index.ts
│   ├── auth.ts
│   └── tools/
├── docs/
│   ├── PLAN.md
│   └── TASKS.md
├── Dockerfile
└── docker-compose.yml
```
