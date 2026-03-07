# Meal Planner

Personal meal planning app with recipe catalog, weekly planner and macro tracking.

## MCP Server — AI-powered recipe management

The app includes a **Model Context Protocol (MCP) server** that lets any MCP-compatible AI assistant (Claude, etc.) interact directly with your recipe database. This is the primary way to add and manage recipes — just paste a recipe URL or describe a dish in natural language, and the assistant will:

- **Add recipes** with structured ingredients, instructions, macros and photos
- **Search and browse** your catalog by name or tags
- **Update recipes** — fix typos, adjust portions, add missing macros
- **Read full details** of any recipe

The MCP server lives in `mcp-server/` and communicates with the app via its REST API.

```bash
# Start the MCP server (requires the dev server running)
cd mcp-server && pnpm start
```

Configure it in your AI client pointing to `mcp-server/index.ts` with `tsx`. Set `API_BASE` and `API_KEY` env vars if needed.

### Available tools

| Tool | Description |
|---|---|
| `list_recipes` | List/search recipes by name or tag |
| `get_recipe` | Get full recipe details by ID |
| `add_recipe` | Create a recipe with all fields + photo URL |
| `update_recipe` | Partially update a recipe by ID |

## Stack

- **Astro 5** — SSR with Node adapter
- **Vue 3** — interactive islands (Composition API)
- **Tailwind CSS v4** — styling via `@tailwindcss/vite`
- **SQLite** — via Drizzle ORM + better-sqlite3
- **Sharp** — on-the-fly image resizing with disk cache
- **Vitest** — unit tests with in-memory SQLite

## Features

- Recipe catalog with search, tag filters and favorites
- Macro calculator per portion with adjustable weight
- Weekly meal planner with drag-and-drop
- Daily macro summary (training/rest profiles)
- Photo upload with responsive srcset and fullscreen lightbox
- On-the-fly image optimization (WebP, resize, cache)
- Mobile-first responsive design

## Getting started

```bash
pnpm install
pnpm drizzle-kit push
pnpm seed
pnpm dev
```

The dev server runs at `http://localhost:4321`.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm seed` | Seed database from `db/seed.json` |
| `pnpm drizzle-kit push` | Push schema changes to SQLite |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |

## Project structure

```
db/
  schema.ts          # Drizzle schema (recipes, meal plans, entries, macro targets)
  index.ts           # DB connection
  seed.json          # Seed data
src/
  services/          # Business logic (plain functions, no framework deps)
  pages/
    api/             # REST endpoints (thin HTTP adapters)
    recipes/[slug]   # Recipe detail page
    planner          # Weekly planner
    settings         # Macro targets config
  components/        # Vue islands
  lib/               # Shared utilities (api, auth, slug, photo)
  layouts/           # Astro layouts
data/
  meal-planner.db    # SQLite database (gitignored)
  photos/            # Uploaded recipe photos (gitignored)
```

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/recipes?tag=&search=` | List recipes |
| POST | `/api/recipes` | Create recipe |
| GET | `/api/recipes/:id` | Get recipe |
| PUT | `/api/recipes/:id` | Update recipe |
| PATCH | `/api/recipes/:id/favorite` | Toggle favorite |
| POST | `/api/recipes/:id/photo` | Upload photo |
| GET | `/api/meal-plans?week=YYYY-MM-DD` | Get/create weekly plan |
| POST | `/api/meal-entries` | Add meal entry |
| PUT | `/api/meal-entries/:id` | Update meal entry |
| DELETE | `/api/meal-entries/:id` | Delete meal entry |
| GET | `/api/macro-targets` | Get macro targets |
| PUT | `/api/macro-targets/:profileType` | Update macro target |
